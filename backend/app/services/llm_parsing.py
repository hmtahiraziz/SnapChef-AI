import json
import re
from typing import Any

from fastapi import HTTPException


def parse_json_object(text: str, error_message: str) -> dict[str, Any]:
    trimmed = text.strip()
    match = re.search(r"\{[\s\S]*\}", trimmed)
    if not match:
        raise HTTPException(status_code=502, detail=error_message)

    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail=error_message) from exc

    if not isinstance(parsed, dict):
        raise HTTPException(status_code=502, detail=error_message)
    return parsed

