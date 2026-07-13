from fastapi import HTTPException
from pydantic import ValidationError

from app.core.config import get_settings
from app.models.vision import ExtractedIngredient, VisionExtractResponse
from app.services.llm_parsing import parse_json_object
from app.services.openai_client import get_openai_client

VISION_PROMPT = """You are a food vision assistant for a home cooking app.

Identify edible food ingredients clearly visible in this photo (fridge, pantry, counter, or plate).

Rules:
- Include only real food ingredients a person would cook with.
- Ignore appliances, utensils, packaging text, brand logos, people, and non-food objects.
- Prefer simple, familiar ingredient names (e.g. "tomato", "chicken", "onion", "yogurt").
- Do not invent items that are not visibly present.
- Deduplicate near-identical names (keep one canonical name).
- If nothing edible is visible, return empty lists.

Return JSON only with this exact shape:
{
  "items": [
    {"name": "tomato", "confidence": 0.92},
    {"name": "onion", "confidence": 0.8}
  ]
}

confidence is optional (0 to 1). Never return markdown or explanations.
"""


def _normalize_items(parsed: dict) -> list[ExtractedIngredient]:
    raw_items = parsed.get("items")
    ingredients = parsed.get("ingredients")

    collected: list[ExtractedIngredient] = []
    seen: set[str] = set()

    if isinstance(raw_items, list):
        for entry in raw_items:
            if isinstance(entry, str):
                name = entry.strip()
                confidence = None
            elif isinstance(entry, dict):
                name = str(entry.get("name", "")).strip()
                conf = entry.get("confidence")
                confidence = float(conf) if isinstance(conf, (int, float)) else None
            else:
                continue

            key = name.lower()
            if not name or key in seen:
                continue
            seen.add(key)
            collected.append(ExtractedIngredient(name=name, confidence=confidence))

    if not collected and isinstance(ingredients, list):
        for entry in ingredients:
            if not isinstance(entry, str):
                continue
            name = entry.strip()
            key = name.lower()
            if not name or key in seen:
                continue
            seen.add(key)
            collected.append(ExtractedIngredient(name=name))

    return collected


async def extract_ingredients_from_image(image_base64: str) -> VisionExtractResponse:
    settings = get_settings()
    client = get_openai_client()

    try:
        response = await client.chat.completions.create(
            model=settings.openai_model_vision,
            response_format={"type": "json_object"},
            max_tokens=800,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                }
            ],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Vision request failed.") from exc

    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise HTTPException(status_code=502, detail="Vision returned an empty response.")

    parsed = parse_json_object(content, "Could not parse vision response.")
    items = _normalize_items(parsed)

    try:
        return VisionExtractResponse(
            ingredients=[item.name for item in items],
            items=items,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="Vision response format was invalid.") from exc
