from fastapi import APIRouter

from app.models.recipe import GenerateRecipesRequest, GenerateRecipesResponse
from app.services.recipe_service import generate_recipes

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.post("/generate", response_model=GenerateRecipesResponse)
async def generate(payload: GenerateRecipesRequest) -> GenerateRecipesResponse:
    return await generate_recipes(payload.ingredients, payload.max_recipes, payload.country)

