from datetime import datetime, timezone

from pymongo import ASCENDING, DESCENDING

from app.db.mongodb import get_database
from app.models.recipe import FavoriteRecipe, Recipe


class FavoritesRepository:
    COLLECTION_NAME = "favorites"

    async def ensure_indexes(self) -> None:
        collection = get_database()[self.COLLECTION_NAME]
        await collection.create_index([("user_id", ASCENDING), ("id", ASCENDING)], unique=True)
        await collection.create_index([("user_id", ASCENDING), ("savedAt", DESCENDING)])

    async def list_by_user(self, user_id: str) -> list[FavoriteRecipe]:
        collection = get_database()[self.COLLECTION_NAME]
        cursor = collection.find({"user_id": user_id}, {"_id": 0, "user_id": 0}).sort("savedAt", DESCENDING)
        docs = await cursor.to_list(length=200)
        return [FavoriteRecipe.model_validate(doc) for doc in docs]

    async def upsert(self, user_id: str, recipe: Recipe) -> FavoriteRecipe:
        collection = get_database()[self.COLLECTION_NAME]
        favorite = FavoriteRecipe(**recipe.model_dump(), savedAt=datetime.now(timezone.utc))
        doc = {
            "user_id": user_id,
            **favorite.model_dump(mode="json"),
        }

        await collection.update_one(
            {"user_id": user_id, "id": recipe.id},
            {"$set": doc},
            upsert=True,
        )
        return favorite

    async def delete(self, user_id: str, recipe_id: str) -> bool:
        collection = get_database()[self.COLLECTION_NAME]
        result = await collection.delete_one({"user_id": user_id, "id": recipe_id})
        return result.deleted_count > 0
