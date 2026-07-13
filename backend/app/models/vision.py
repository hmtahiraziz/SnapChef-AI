from pydantic import BaseModel, Field, field_validator


class VisionExtractRequest(BaseModel):
    image_base64: str = Field(min_length=50)


class ExtractedIngredient(BaseModel):
    name: str = Field(min_length=1)
    confidence: float | None = Field(default=None, ge=0, le=1)


class VisionExtractResponse(BaseModel):
    ingredients: list[str] = Field(default_factory=list)
    items: list[ExtractedIngredient] = Field(default_factory=list)

    @field_validator("ingredients", "items", mode="before")
    @classmethod
    def empty_if_none(cls, value: object) -> object:
        return [] if value is None else value
