# AI Recipe Backend (FastAPI + MongoDB + OpenAI)

Backend API for ingredient extraction, recipe generation, and favorites persistence.

## Stack

- FastAPI
- MongoDB (Motor async client)
- OpenAI Chat Completions API

## Quick Start

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Set your values in `.env`:

- `OPENAI_API_KEY`
- `MONGODB_URL`
- `MONGODB_DB`

Run the server:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On Windows with npm scripts: `npm run start:venv:win`

## API

- `GET /health`
- `POST /api/v1/vision/extract`
- `POST /api/v1/recipes/generate`
- `GET /api/v1/favorites`
- `POST /api/v1/favorites`
- `DELETE /api/v1/favorites/{recipe_id}`

## Request Examples

Vision:

```json
{
  "image_base64": "..."
}
```

Recipe generation:

```json
{
  "ingredients": ["egg", "onion", "tomato"],
  "max_recipes": 3,
  "country": "Pakistan"
}
```

Example recipe response item:

```json
{
  "id": "egg-masala",
  "title": "Egg Masala",
  "servings": 2,
  "prepTimeMinutes": 10,
  "cookTimeMinutes": 20,
  "country": "Pakistan",
  "cuisine": "Pakistani",
  "description": "A simple home-style egg curry.",
  "difficulty": "easy",
  "ingredients": [{ "name": "egg", "quantity": "4", "unit": "whole" }],
  "missingIngredients": [{ "name": "salt", "quantity": "1", "unit": "tsp" }],
  "optionalIngredients": [{ "name": "fresh coriander", "quantity": "2", "unit": "tbsp" }],
  "steps": ["Boil eggs.", "Cook masala.", "Combine and simmer."]
}
```

Add favorite:

```json
{
  "recipe": {
    "id": "egg-masala",
    "title": "Egg Masala",
    "servings": 2,
    "country": "Pakistan",
    "ingredients": [{ "name": "egg", "quantity": "4", "unit": "whole" }],
    "steps": ["Boil eggs.", "Cook masala.", "Combine and simmer."]
  }
}
```

## Auth Placeholder

Favorites routes currently read `x-user-id` header for user scoping.
This is a temporary local mechanism and is designed to be replaced with Clerk token verification next.
