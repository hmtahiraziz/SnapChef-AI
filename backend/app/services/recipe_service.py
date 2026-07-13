from fastapi import HTTPException
from pydantic import ValidationError

from app.core.config import get_settings
from app.models.recipe import GenerateRecipesResponse
from app.services.llm_parsing import parse_json_object
from app.services.openai_client import get_openai_client


def _recipe_prompt(max_recipes: int, country: str) -> str:
    pakistan_rules = ""
    if country.strip().lower() in {"pakistan", "pakistani"}:
        pakistan_rules = """
Pakistan-specific rules:
- Prefer Pakistani cuisine and Pakistani cooking methods.
- Prefer local spices such as cumin, coriander, turmeric, red chili, garam masala, black pepper, ginger, garlic, and green chilies.
- Use metric measurements.
- Keep ingredient names familiar to Pakistani users.
- Assume cooking in a normal household kitchen.
"""

    return f"""You are an expert culinary AI assistant specializing in regional cuisine.

Your primary objective is to generate realistic, delicious, and practical recipes using ONLY the ingredients provided by the user.

Always prioritize recipes that match the selected country: {country}.
{pakistan_rules}
Strict ingredient rules:
- Never claim an ingredient is available unless it was provided.
- The main "ingredients" array must contain ONLY items from the provided available ingredients (with quantities/units).
- If additional ingredients are required to cook the dish, place them in "missingIngredients".
- If optional ingredients can improve taste, place them in "optionalIngredients".
- Do not invent pantry staples into the main ingredients list.

Return JSON only with this exact shape:
{{
  "recipes": [
    {{
      "id": "stable-kebab-case-id",
      "title": "Recipe name",
      "servings": 2,
      "prepTimeMinutes": 10,
      "cookTimeMinutes": 20,
      "country": "{country}",
      "cuisine": "Cuisine label",
      "description": "One short sentence about the dish.",
      "difficulty": "easy",
      "ingredients": [
        {{"name": "onion", "quantity": "1", "unit": "whole"}}
      ],
      "missingIngredients": [
        {{"name": "salt", "quantity": "1", "unit": "tsp"}}
      ],
      "optionalIngredients": [
        {{"name": "fresh coriander", "quantity": "2", "unit": "tbsp"}}
      ],
      "steps": [
        "Step one.",
        "Step two."
      ]
    }}
  ]
}}

Rules:
- Suggest up to {max_recipes} recipes
- servings must be a positive integer
- difficulty must be one of: easy, medium, hard
- ingredients, missingIngredients, and optionalIngredients must use valid names
- steps must be clear and sequential
- Never return markdown
- Never return explanations
- Never return plain text
- Only JSON
"""


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

    try:
        response = await client.chat.completions.create(
            model=settings.openai_model_recipes,
            response_format={"type": "json_object"},
            max_tokens=3500,
            messages=[
                {"role": "system", "content": _recipe_prompt(max_recipes, country_text)},
                {
                    "role": "user",
                    "content": f"Country: {country_text}\nAvailable ingredients: {ingredient_text}",
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

    # Ensure country is set even if the model omits it.
    for recipe in validated.recipes:
        if not recipe.country:
            recipe.country = country_text

    return validated
