from __future__ import annotations

import re

from fastapi import HTTPException
from pydantic import ValidationError

from app.core.config import get_settings
from app.models.recipe import GenerateRecipesResponse, Ingredient, Recipe
from app.services.llm_parsing import parse_json_object
from app.services.openai_client import get_openai_client


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug or "recipe"


def _title_case(value: str) -> str:
    cleaned = re.sub(r"\s+", " ", value.strip())
    if not cleaned:
        return cleaned
    # Keep short conjunctions lowercase unless first word.
    small = {"and", "or", "with", "of", "in", "a", "an", "the", "to", "for"}
    words = cleaned.split(" ")
    out: list[str] = []
    for idx, word in enumerate(words):
        lower = word.lower()
        if idx > 0 and lower in small:
            out.append(lower)
        else:
            out.append(word[:1].upper() + word[1:] if word else word)
    return " ".join(out)


def _clean_step(step: str, index: int) -> str:
    text = re.sub(r"\s+", " ", step.strip())
    # Strip leading numbering the model may add ("1.", "Step 1:", etc.)
    text = re.sub(r"^(?:step\s*)?\d+[\).:\-]\s*", "", text, flags=re.IGNORECASE)
    if not text:
        return f"Complete step {index + 1}."
    if text[-1] not in ".!?":
        text += "."
    return text[0].upper() + text[1:] if text else text


def _clean_ingredient(item: Ingredient) -> Ingredient | None:
    name = re.sub(r"\s+", " ", (item.name or "").strip())
    if not name:
        return None
    quantity = (item.quantity or "").strip() or None
    unit = (item.unit or "").strip() or None
    # Prefer lowercase ingredient names for consistency in lists.
    name = name[0].upper() + name[1:] if name else name
    return Ingredient(name=name, quantity=quantity, unit=unit)


def _clean_ingredient_list(items: list[Ingredient]) -> list[Ingredient]:
    cleaned: list[Ingredient] = []
    seen: set[str] = set()
    for item in items:
        next_item = _clean_ingredient(item)
        if not next_item:
            continue
        key = next_item.name.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(next_item)
    return cleaned


def _normalize_recipe(recipe: Recipe, country: str, index: int) -> Recipe:
    title = _title_case(recipe.title or f"Home Recipe {index + 1}")
    recipe_id = _slugify(recipe.id or title)
    if not recipe_id or recipe_id == "recipe":
        recipe_id = f"{_slugify(title)}-{index + 1}"

    description = re.sub(r"\s+", " ", (recipe.description or "").strip())
    if description and description[-1] not in ".!?":
        description += "."
    if description:
        description = description[0].upper() + description[1:]

    cuisine = re.sub(r"\s+", " ", (recipe.cuisine or "").strip()) or None
    if cuisine:
        cuisine = _title_case(cuisine)

    steps = [_clean_step(step, i) for i, step in enumerate(recipe.steps) if step and step.strip()]
    if not steps:
        steps = ["Prepare the ingredients.", "Cook until done.", "Serve hot."]
    else:
        steps = steps[:6]

    ingredients = _clean_ingredient_list(recipe.ingredients)
    if not ingredients:
        # Should be rare; keep model output if cleaning wiped everything.
        ingredients = recipe.ingredients

    return recipe.model_copy(
        update={
            "id": recipe_id,
            "title": title,
            "country": (recipe.country or country).strip() or country,
            "cuisine": cuisine,
            "description": description or f"A practical {country} home-style dish.",
            "difficulty": recipe.difficulty or "medium",
            "servings": max(1, min(recipe.servings or 2, 20)),
            "prepTimeMinutes": recipe.prepTimeMinutes if recipe.prepTimeMinutes is not None else 10,
            "cookTimeMinutes": recipe.cookTimeMinutes if recipe.cookTimeMinutes is not None else 20,
            "ingredients": ingredients,
            "missingIngredients": _clean_ingredient_list(recipe.missingIngredients),
            "optionalIngredients": _clean_ingredient_list(recipe.optionalIngredients),
            "steps": steps,
        }
    )


def _recipe_prompt(max_recipes: int, country: str) -> str:
    pakistan_rules = ""
    if country.strip().lower() in {"pakistan", "pakistani"}:
        pakistan_rules = (
            "Pakistan: prefer home-style Pakistani dishes; common spices "
            "(cumin, coriander, turmeric, chili, garam masala, ginger, garlic); "
            "household units (tsp, tbsp, cup, g, ml, whole)."
        )

    return f"""You are SnapChef AI. Return cook-ready home recipes as JSON only.

Country/cuisine: {country}
{pakistan_rules}

Rules:
- Main "ingredients" = ONLY items from the user's available list (with quantity/unit).
- Extra required items go in "missingIngredients"; upgrades in "optionalIngredients".
- Up to {max_recipes} distinct recipes. Appetizing titles. 1 short description sentence.
- difficulty: easy|medium|hard. Realistic prep/cook minutes. Servings 2–4.
- steps: 4–6 short actionable steps each. Be concise.

JSON shape:
{{
  "recipes": [
    {{
      "id": "kebab-case-id",
      "title": "Recipe name",
      "servings": 2,
      "prepTimeMinutes": 10,
      "cookTimeMinutes": 20,
      "country": "{country}",
      "cuisine": "Cuisine",
      "description": "One short sentence.",
      "difficulty": "easy",
      "ingredients": [{{"name": "Onion", "quantity": "1", "unit": "whole"}}],
      "missingIngredients": [{{"name": "Salt", "quantity": "1", "unit": "tsp"}}],
      "optionalIngredients": [],
      "steps": ["Step one.", "Step two."]
    }}
  ]
}}

No markdown. JSON only.
"""


def _max_tokens_for_count(max_recipes: int) -> int:
    # Keep output budget tight so generation finishes faster.
    return min(2400, 900 + max_recipes * 550)


async def generate_recipes(
    ingredients: list[str],
    max_recipes: int,
    country: str,
) -> GenerateRecipesResponse:
    if not ingredients:
        raise HTTPException(status_code=400, detail="At least one ingredient is required.")

    settings = get_settings()
    client = get_openai_client()
    ingredient_text = ", ".join(item.strip() for item in ingredients if item.strip())
    country_text = country.strip()
    recipe_count = max(1, min(max_recipes, 5))

    try:
        response = await client.chat.completions.create(
            model=settings.openai_model_recipes,
            response_format={"type": "json_object"},
            temperature=0.4,
            max_tokens=_max_tokens_for_count(recipe_count),
            messages=[
                {"role": "system", "content": _recipe_prompt(recipe_count, country_text)},
                {
                    "role": "user",
                    "content": (
                        f"Country: {country_text}\n"
                        f"Available ingredients: {ingredient_text}\n"
                        f"Return {recipe_count} recipes. Keep steps short."
                    ),
                },
            ],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Recipe generation failed.") from exc

    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise HTTPException(status_code=502, detail="Recipe model returned an empty response.")

    parsed = parse_json_object(content, "Could not parse recipe response.")
    try:
        validated = GenerateRecipesResponse.model_validate(parsed)
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="Recipe response format was invalid.") from exc

    if not validated.recipes:
        raise HTTPException(status_code=502, detail="Recipe model returned no recipes.")

    normalized: list[Recipe] = []
    seen_ids: set[str] = set()
    for index, recipe in enumerate(validated.recipes[:recipe_count]):
        cleaned = _normalize_recipe(recipe, country_text, index)
        # Guarantee unique ids for navigation/favorites.
        base_id = cleaned.id
        unique_id = base_id
        suffix = 2
        while unique_id in seen_ids:
            unique_id = f"{base_id}-{suffix}"
            suffix += 1
        seen_ids.add(unique_id)
        if unique_id != cleaned.id:
            cleaned = cleaned.model_copy(update={"id": unique_id})
        normalized.append(cleaned)

    return GenerateRecipesResponse(recipes=normalized)
