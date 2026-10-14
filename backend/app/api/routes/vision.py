from __future__ import annotations

import base64

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import get_user_id
from app.models.vision import VisionExtractResponse
from app.services.vision_service import extract_ingredients_from_image

router = APIRouter(prefix="/vision", tags=["vision"])

# ~6 MB raw image — enough for a compressed kitchen photo, blocks abuse.
MAX_IMAGE_BYTES = 6 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}


@router.post("/extract", response_model=VisionExtractResponse)
async def extract_from_image(
    file: UploadFile = File(..., description="Ingredient photo (JPEG/PNG/WebP)"),
    _user_id: str = Depends(get_user_id),
) -> VisionExtractResponse:
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG, PNG, or WebP image.",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty image upload.")
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image is too large. Use a smaller photo (under 6 MB).",
        )

    image_base64 = base64.b64encode(raw).decode("ascii")
    mime = content_type if content_type in ALLOWED_CONTENT_TYPES else "image/jpeg"
    return await extract_ingredients_from_image(image_base64, mime_type=mime)
