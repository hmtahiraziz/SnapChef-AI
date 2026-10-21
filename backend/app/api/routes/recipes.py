from fastapi import APIRouter, Depends

from app.api.deps import get_user_id
from app.models.recipe import GenerateRecipesRequest, GenerateRecipesResponse
from app.services.recipe_service import generate_recipes

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.post("/generate", response_model=GenerateRecipesResponse)
async def generate(
    payload: GenerateRecipesRequest,
    _user_id: str = Depends(get_user_id),
) -> GenerateRecipesResponse:
    return await generate_recipes(
        payload.ingredients,
        payload.max_recipes,
        payload.country,
        payload.exclude_titles,
    )
