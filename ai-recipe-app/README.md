# AI Recipe App

Snap or type your ingredients, get recipes you can cook.

## Project location

The Expo app lives in this folder (`ai-recipe-app`) because the parent folder name contains spaces, which Expo does not allow for project names.

## Setup

```powershell
cd ai-recipe-app
npm install
copy .env.example .env
```

Add your OpenAI API key to `.env`:

```
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

## Run

```powershell
npm start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

## Structure

```
src/
  app/              # Expo Router screens
    (tabs)/         # Home + Favorites tabs
    recipes/        # Recipe list (stack)
    recipe/[id]     # Recipe detail (stack)
  components/       # Shared UI
  constants/        # Theme, env config
  hooks/            # useIngredients, etc.
  services/         # Vision, recipe API, favorites (stubs)
  types/            # Recipe, Ingredient types
```

## Phases

| Phase | Status | Scope |
|-------|--------|-------|
| 0 | Done | Scaffold, types, navigation skeleton |
| 1 | Done | Text + camera input, vision extraction |
| 2 | Done | AI recipes, servings scaler |
| 3 | Done | Local favorites persistence |
