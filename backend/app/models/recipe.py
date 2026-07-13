from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class Ingredient(BaseModel):
    name: str = Field(min_length=1)
    quantity: str | None = None
    unit: str | None = None


class Recipe(BaseModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    servings: int = Field(ge=1, le=20)
    ingredients: list[Ingredient] = Field(min_length=1)
    steps: list[str] = Field(min_length=1)
    prepTimeMinutes: int | None = Field(default=None, ge=0)
    cookTimeMinutes: int | None = Field(default=None, ge=0)
    country: str = Field(default="Pakistan", min_length=2)
    cuisine: str | None = None
    description: str | None = None
    difficulty: Literal["easy", "medium", "hard"] | None = None
    imageUrl: str | None = None
    missingIngredients: list[Ingredient] = Field(default_factory=list)
    optionalIngredients: list[Ingredient] = Field(default_factory=list)

    @field_validator("missingIngredients", "optionalIngredients", mode="before")
    @classmethod
    def empty_list_if_none(cls, value: object) -> object:
        return [] if value is None else value


class GenerateRecipesRequest(BaseModel):
    ingredients: list[str] = Field(min_length=1)
    max_recipes: int = Field(default=3, ge=1, le=5)
    country: str = Field(min_length=2)


class GenerateRecipesResponse(BaseModel):
    recipes: list[Recipe]


class FavoriteRecipe(Recipe):
    savedAt: datetime


class AddFavoriteRequest(BaseModel):
    recipe: Recipe


class FavoritesResponse(BaseModel):
    favorites: list[FavoriteRecipe]
