from fastapi import APIRouter

from app.models.common import MessageResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=MessageResponse)
async def health_check() -> MessageResponse:
    return MessageResponse(message="ok")

