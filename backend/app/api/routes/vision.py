from fastapi import APIRouter

from app.models.vision import VisionExtractRequest, VisionExtractResponse
from app.services.vision_service import extract_ingredients_from_image

router = APIRouter(prefix="/vision", tags=["vision"])


@router.post("/extract", response_model=VisionExtractResponse)
async def extract_from_image(payload: VisionExtractRequest) -> VisionExtractResponse:
    return await extract_ingredients_from_image(payload.image_base64)
