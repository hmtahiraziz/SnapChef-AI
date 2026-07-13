from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_user_id
from app.models.recipe import AddFavoriteRequest, FavoritesResponse
from app.repositories.favorites_repository import FavoritesRepository

router = APIRouter(prefix="/favorites", tags=["favorites"])
repository = FavoritesRepository()


@router.get("", response_model=FavoritesResponse)
async def list_favorites(user_id: str = Depends(get_user_id)) -> FavoritesResponse:
    favorites = await repository.list_by_user(user_id)
    return FavoritesResponse(favorites=favorites)


@router.post("", response_model=FavoritesResponse)
async def add_favorite(payload: AddFavoriteRequest, user_id: str = Depends(get_user_id)) -> FavoritesResponse:
    await repository.upsert(user_id=user_id, recipe=payload.recipe)
    favorites = await repository.list_by_user(user_id)
    return FavoritesResponse(favorites=favorites)


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite(recipe_id: str, user_id: str = Depends(get_user_id)) -> None:
    removed = await repository.delete(user_id=user_id, recipe_id=recipe_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Favorite not found.")

