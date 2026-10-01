# Software Requirements Specification (SRS)
## SnapChef AI — AI-Powered Recipe Assistant

| Field | Value |
|-------|--------|
| **Document title** | Software Requirements Specification |
| **Product name** | SnapChef AI |
| **Document version** | 1.0 |
| **Status** | Baseline (as-built / current release) |
| **Product version** | 1.0.0 |
| **Date** | 25 September 2026 |
| **Audience** | Client stakeholders, product owners, QA, development |
| **Classification** | Client deliverable |

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **SnapChef AI**, a mobile-first cooking assistant that helps users turn available ingredients into cookable recipes using artificial intelligence.

This document is intended for:

- Client review and sign-off of product scope
- Alignment between business stakeholders and the delivery team
- Input to QA test planning and acceptance criteria
- Reference for future enhancements and change control

### 1.2 Scope

SnapChef AI enables end users to:

1. Capture ingredients via text entry or photo (camera / gallery)
2. Extract ingredient names from images using AI vision
3. Generate regionally relevant recipes from a selected country/cuisine context
4. View recipe details, scale servings, and follow step-by-step cook mode
5. Save favorites (local + cloud sync when signed in)
6. Maintain a personal shopping list for missing or optional ingredients
7. Manage account, appearance, and cuisine preferences

**In scope (current product):** Expo mobile/web client, FastAPI backend, MongoDB favorites persistence, OpenAI-powered vision and recipe generation, Clerk authentication.

**Out of scope (current release):** Multi-device shopping-list sync, server-side storage of all generated recipes (non-favorites), social sharing of recipes as a first-class feature, payment/subscription billing, nutrition analysis, barcode scanning, and admin/CMS dashboards.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **SRS** | Software Requirements Specification |
| **API** | Application Programming Interface |
| **AI / LLM** | Artificial Intelligence / Large Language Model |
| **JWT** | JSON Web Token |
| **Clerk** | Third-party authentication and user management provider |
| **Expo** | React Native toolchain for building cross-platform apps |
| **FastAPI** | Python web framework used for the backend API |
| **FR** | Functional Requirement |
| **NFR** | Non-Functional Requirement |
| **UC** | Use Case |

### 1.4 References

- Product README (repository root)
- Mobile app README (`ai-recipe-app/README.md`)
- Backend API README (`backend/README.md`)
- Expo SDK documentation (project targets Expo SDK 54)
- Clerk Expo authentication documentation
- OpenAI Chat Completions API documentation

### 1.5 Overview of This Document

Section 2 describes the overall product and constraints. Section 3 lists specific requirements (including UI screenshots). Section 4 covers verification and acceptance. Later sections cover stack, limitations, deployment, and approvals.

---

## 2. Overall Description

### 2.1 Product Perspective

SnapChef AI is a client–server system:

```
┌─────────────────────────────────────┐
│  SnapChef AI Client                 │
│  (Expo / React Native / Expo Router)│
│  • Auth (Clerk)                     │
│  • UI & local storage               │
└───────────────┬─────────────────────┘
                │ HTTPS / JSON
┌───────────────▼─────────────────────┐
│  SnapChef AI Backend (FastAPI)      │
│  • Vision extract                   │
│  • Recipe generate                  │
│  • Favorites CRUD                   │
└───────┬─────────────────┬───────────┘
        │                 │
┌───────▼───────┐  ┌──────▼──────────┐
│  OpenAI API   │  │  MongoDB        │
│  (vision +    │  │  (favorites)    │
│   recipes)    │  └─────────────────┘
└───────────────┘
```

### 2.2 Product Functions (Summary)

| ID | Capability |
|----|------------|
| PF-01 | User onboarding and authentication (email/password, Google OAuth, email verification, password reset) |
| PF-02 | First-time country/cuisine selection |
| PF-03 | Ingredient input via text and photo |
| PF-04 | AI vision ingredient extraction |
| PF-05 | AI recipe generation (up to 3 recipes per request by default; API supports 1–5) |
| PF-06 | Recipe detail, servings adjustment (1–12), ingredient categorization (have / missing / optional) |
| PF-07 | Step-by-step cook mode with screen keep-awake |
| PF-08 | Favorites save/remove with local persistence and cloud sync when authenticated |
| PF-09 | Shopping list management (local device storage) |
| PF-10 | Settings: profile, cuisine preference, appearance (system/light/dark) |

### 2.3 User Characteristics

| Persona | Description | Primary goals |
|---------|-------------|----------------|
| **Home cook** | Casual user with limited planning time | Quickly find recipes from fridge/pantry ingredients |
| **Authenticated user** | Signed-in cook who returns regularly | Sync favorites across sessions; personalize cuisine |
| **Guest (pre-auth)** | New visitor | Complete onboarding and create an account |

Primary app features after onboarding require a signed-in Clerk user and completed country setup.

### 2.4 Constraints

| ID | Constraint |
|----|------------|
| C-01 | Mobile client built with Expo (SDK 54) and React Native |
| C-02 | Backend implemented with FastAPI and Python |
| C-03 | Recipe and vision intelligence depend on OpenAI API availability and quotas |
| C-04 | User authentication provided by Clerk |
| C-05 | Favorites cloud persistence requires MongoDB |
| C-06 | AI API keys must remain server-side (not embedded in the mobile client) |
| C-07 | Generated recipes for the current session are held in memory on the client unless favorited |
| C-08 | Shopping list is device-local (AsyncStorage); not synced across devices in this release |

### 2.5 Assumptions and Dependencies

**Assumptions**

- Users have a supported iOS, Android, or web runtime and network connectivity for AI and auth features.
- Client will provide/configure OpenAI, Clerk, and MongoDB credentials for deployed environments.
- Users grant camera and photo-library permissions when using scan features.
- Default regional framing may emphasize a configured country list (default: Pakistan) unless the user selects otherwise.

**Dependencies**

- OpenAI Chat Completions API (vision + recipe models)
- Clerk (identity, OAuth, JWT issuance)
- MongoDB (favorites)
- Expo / React Native platform services (camera, secure storage, keep-awake, sharing)

### 2.6 System Architecture (Logical)

| Layer | Technology |
|-------|------------|
| Presentation | Expo Router screens, NativeWind / Tailwind styling |
| Client state | React context (favorites, shopping list, preferences); in-memory recipe session |
| Client persistence | AsyncStorage; Clerk tokens in SecureStore |
| API gateway | FastAPI routers under `/api/v1` |
| AI services | OpenAI via backend services |
| Data store | MongoDB (favorites collection, unique per `user_id` + recipe `id`) |

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces

The application shall provide the following primary user interfaces:

| Screen / Flow | Description |
|---------------|-------------|
| Onboarding | First-run introduction; navigate to sign-in or sign-up |
| Sign-in / Sign-up | Email/password and Google OAuth |
| Verify email / Forgot & reset password | Clerk-backed account recovery flows |
| Select country | Mandatory post-sign-in cuisine/country setup |
| Home | Greeting, ingredient composer, cuisine selector, scan entry, generate action, favorite previews |
| AI Scan (modal) | Camera/gallery pick, preview, extraction, ingredient review sheet |
| Recipe results | List of generated recipes |
| Recipe detail | Image, metadata, servings scaler, ingredients, steps, favorite, shopping actions, start cook mode |
| Cook mode | Full-screen step pager with progress and keep-awake |
| Favorites | Saved recipes list with remove confirmation |
| Shopping | Add/edit/check/sort/search/share/clear shopping items |
| Settings / Account | Profile photo & name, cuisine & appearance links, sign out |
| Preferences | Cuisine and appearance (including clear local data on preferences hub) |

#### 3.1.1.1 User Interface Screenshots

The following screenshots illustrate the as-built SnapChef AI user experience. Image files live under [`docs/screenshots/`](./screenshots/).

> **Note for authors:** Place PNG/JPEG captures in `docs/screenshots/` using the filenames below. Until a file is present, the image slot will appear broken in Markdown preview—that is expected.

##### Authentication & onboarding

| Screen | File |
|--------|------|
| Onboarding | `01-onboarding.png` |
| Sign-in | `02-sign-in.png` |
| Sign-up | `03-sign-up.png` |
| Select country / cuisine | `04-select-country.png` |

![Onboarding](./screenshots/01-onboarding.png)

*Figure 1 — Onboarding*

![Sign-in](./screenshots/02-sign-in.png)

*Figure 2 — Sign-in*

![Sign-up](./screenshots/03-sign-up.png)

*Figure 3 — Sign-up*

![Select country](./screenshots/04-select-country.png)

*Figure 4 — Country / cuisine selection*

##### Core cooking flows

| Screen | File |
|--------|------|
| Home | `05-home.png` |
| AI Scan / ingredient capture | `06-ai-scan.png` |
| Ingredient review | `07-ingredient-review.png` |
| Recipe results | `08-recipe-results.png` |
| Recipe detail | `09-recipe-detail.png` |
| Cook mode | `10-cook-mode.png` |

![Home](./screenshots/05-home.png)

*Figure 5 — Home (ingredient composer & generate)*

![AI Scan](./screenshots/06-ai-scan.png)

*Figure 6 — AI Scan (camera / gallery)*

![Ingredient review](./screenshots/07-ingredient-review.png)

*Figure 7 — Ingredient review after vision extraction*

![Recipe results](./screenshots/08-recipe-results.png)

*Figure 8 — Generated recipe results*

![Recipe detail](./screenshots/09-recipe-detail.png)

*Figure 9 — Recipe detail (servings, ingredients, steps)*

![Cook mode](./screenshots/10-cook-mode.png)

*Figure 10 — Cook mode (step-by-step)*

##### Library, shopping & settings

| Screen | File |
|--------|------|
| Favorites | `11-favorites.png` |
| Shopping list | `12-shopping.png` |
| Settings | `13-settings.png` |
| Account / profile | `14-account.png` |

![Favorites](./screenshots/11-favorites.png)

*Figure 11 — Favorites*

![Shopping list](./screenshots/12-shopping.png)

*Figure 12 — Shopping list*

![Settings](./screenshots/13-settings.png)

*Figure 13 — Settings*

![Account](./screenshots/14-account.png)

*Figure 14 — Account / profile*

#### 3.1.2 Hardware Interfaces

- Camera and photo library (ingredient capture)
- Device clipboard and OS share sheet (shopping list export)
- Display keep-awake during cook mode

#### 3.1.3 Software Interfaces

| Interface | Protocol | Notes |
|-----------|----------|-------|
| Backend REST API | HTTP/JSON | Base URL configured via `EXPO_PUBLIC_API_BASE_URL` |
| Clerk | SDK + OAuth | Publishable key required on client |
| OpenAI | HTTPS (server-side only) | Used by backend vision and recipe services |
| MongoDB | Async driver (Motor) | Favorites persistence |

#### 3.1.4 Communication Interfaces

- Client ↔ Backend: JSON over HTTP(S)
- Authenticated favorites requests: `Authorization: Bearer <Clerk JWT>`
- Development fallback (backend, when `APP_ENV=development`): optional `x-user-id` header
- CORS configurable on backend via environment settings

---

### 3.2 Functional Requirements

#### 3.2.1 Authentication & Onboarding

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | The system shall present onboarding to first-time users before requiring account creation or sign-in. | Must |
| FR-AUTH-02 | The system shall support email/password registration and sign-in via Clerk. | Must |
| FR-AUTH-03 | The system shall support Google OAuth sign-in via Clerk. | Must |
| FR-AUTH-04 | The system shall support email verification for applicable sign-up flows. | Must |
| FR-AUTH-05 | The system shall support forgot-password and reset-password flows. | Must |
| FR-AUTH-06 | Unsigned users shall be redirected away from protected main-app routes to onboarding or sign-in. | Must |
| FR-AUTH-07 | After first successful sign-in, the user shall complete country/cuisine selection before accessing Home. | Must |
| FR-AUTH-08 | The system shall allow users to sign out from Settings/Account. | Must |
| FR-AUTH-09 | The system shall allow users to update profile display name and profile photo via Clerk. | Should |

#### 3.2.2 Ingredient Capture

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ING-01 | Users shall add ingredients by typing (including comma-separated or bulk entry). | Must |
| FR-ING-02 | Users shall add ingredients by photographing food (camera) or selecting an image (gallery). | Must |
| FR-ING-03 | Captured images shall be resized/compressed client-side before upload (e.g., JPEG base64). | Should |
| FR-ING-04 | After vision extraction, users shall review ingredients (select, rename, remove) before merging into the working list. | Must |
| FR-ING-05 | Users shall be able to clear or edit the working ingredient list on Home before generation. | Must |

#### 3.2.3 Vision Extraction

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-VIS-01 | The backend shall accept a base64-encoded image and return detected ingredient names. | Must |
| FR-VIS-02 | The response shall support structured items (name + optional confidence) and remain compatible with a simple ingredients string array. | Must |
| FR-VIS-03 | Duplicate ingredient names shall be deduplicated server-side where applicable. | Should |
| FR-VIS-04 | Vision failures shall return a clear error to the client (e.g., HTTP 4xx/5xx with actionable messaging). | Must |

#### 3.2.4 Recipe Generation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-REC-01 | Given one or more ingredients and a country context, the system shall generate recipes via the backend AI service. | Must |
| FR-REC-02 | Default generation shall return up to **3** recipes; API shall allow `max_recipes` in range **1–5**. | Must |
| FR-REC-03 | Each recipe shall include at minimum: `id`, `title`, `servings`, `ingredients[]`, and `steps[]`. | Must |
| FR-REC-04 | Recipes should include metadata where available: prep/cook time, cuisine, description, difficulty, missing ingredients, optional ingredients. | Should |
| FR-REC-05 | Generation shall bias recipes toward the user’s selected country/cuisine context. | Must |
| FR-REC-06 | The client shall display a results list and allow navigation to recipe detail. | Must |
| FR-REC-07 | If a hero image URL is not provided by the API, the client may enrich a placeholder/related image for display. | Could |
| FR-REC-08 | Recipe generation shall require a non-empty ingredient list. | Must |

#### 3.2.5 Recipe Detail & Servings

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DET-01 | Recipe detail shall show title, description (if any), times, difficulty, and hero visual. | Must |
| FR-DET-02 | Users shall adjust servings in the range **1–12**; quantities for “ingredients you have” shall scale accordingly. | Must |
| FR-DET-03 | Detail shall distinguish ingredients the user has, missing ingredients, and optional ingredients. | Must |
| FR-DET-04 | Users shall be able to add missing and/or optional ingredients to the shopping list from detail. | Must |
| FR-DET-05 | Users shall start cook mode from recipe detail. | Must |
| FR-DET-06 | Opening a recipe that is neither in the current session nor in favorites shall show a not-found / unavailable state. | Must |

#### 3.2.6 Cook Mode

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-COOK-01 | Cook mode shall present recipe steps one at a time with progress indication. | Must |
| FR-COOK-02 | Users shall navigate steps via controls and/or horizontal swipe. | Must |
| FR-COOK-03 | The device screen shall remain awake while cook mode is active. | Should |
| FR-COOK-04 | Users shall be able to exit cook mode and return to recipe detail. | Must |

#### 3.2.7 Favorites

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FAV-01 | Users shall favorite and unfavorite recipes from list/detail UI. | Must |
| FR-FAV-02 | Favorites shall persist locally on device (AsyncStorage). | Must |
| FR-FAV-03 | When signed in, favorites shall sync with the backend (list, add/upsert, delete). | Must |
| FR-FAV-04 | On load for signed-in users, the client shall merge local and remote favorites. | Should |
| FR-FAV-05 | The Favorites tab shall list saved recipes and support removal with confirmation. | Must |
| FR-FAV-06 | Backend favorites endpoints shall require authenticated user identity (Clerk JWT; or approved development fallback). | Must |

#### 3.2.8 Shopping List

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SHOP-01 | Users shall maintain a shopping list of items with optional quantity/unit. | Must |
| FR-SHOP-02 | Users shall check/uncheck items, edit items, and delete items (including swipe delete). | Must |
| FR-SHOP-03 | Users shall sort/group items (e.g., by recipe, category, unchecked-first) and search items. | Should |
| FR-SHOP-04 | Users shall share the list or copy it to the clipboard. | Should |
| FR-SHOP-05 | Users shall clear checked items in bulk. | Should |
| FR-SHOP-06 | Shopping list data shall persist locally on the device for this release. | Must |

#### 3.2.9 Preferences & Settings

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PREF-01 | Users shall select a default country/cuisine from a predefined list; selection shall influence recipe generation. | Must |
| FR-PREF-02 | Users shall choose appearance: system, light, or dark. | Must |
| FR-PREF-03 | Preferences shall persist locally across app launches. | Must |
| FR-PREF-04 | Users shall access account management (profile, sign out) from Settings. | Must |

#### 3.2.10 System / Health

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SYS-01 | The backend shall expose a health endpoint returning a success status for monitoring. | Must |
| FR-SYS-02 | The client shall surface network and API errors with user-readable messages when generation, vision, or sync fail. | Must |

---

### 3.3 Use Cases (Selected)

#### UC-01: Generate Recipes from Typed Ingredients

1. User signs in and opens Home.
2. User enters ingredients and confirms country/cuisine.
3. User taps generate.
4. System calls recipe generation API and displays results.
5. User opens a recipe for detail / cook / favorite / shopping actions.

**Success:** At least one valid recipe is shown.  
**Failure:** Empty ingredients, network error, or AI/backend error with clear feedback.

#### UC-02: Scan Ingredients from Photo

1. User opens AI Scan (camera or gallery).
2. User confirms the image.
3. System extracts ingredients via vision API.
4. User reviews/edits the list and merges to Home.
5. User proceeds as in UC-01.

#### UC-03: Save and Sync Favorite

1. User favorites a recipe.
2. System saves locally; if signed in, upserts to MongoDB via API.
3. Recipe appears in Favorites tab and remains available after relaunch (subject to sync success).

#### UC-04: Cook Mode

1. User opens recipe detail and starts cook mode.
2. User advances through steps; screen stays awake.
3. User finishes or exits.

---

### 3.4 Data Requirements

#### 3.4.1 Recipe

| Field | Type | Notes |
|-------|------|-------|
| id | string | Stable identifier |
| title | string | Display name |
| servings | number | Base servings (backend typically 1–20) |
| ingredients | Ingredient[] | Primary (“you have”) ingredients |
| steps | string[] | Ordered cooking instructions |
| prepTimeMinutes | number? | Optional |
| cookTimeMinutes | number? | Optional |
| country | string? | Regional context |
| cuisine | string? | Cuisine label |
| description | string? | Short summary |
| difficulty | easy \| medium \| hard | Optional |
| missingIngredients | Ingredient[]? | Not on hand |
| optionalIngredients | Ingredient[]? | Nice-to-have |
| imageUrl | string? | Optional hero image |

**Ingredient:** `name` (required), `quantity?`, `unit?`

**FavoriteRecipe:** Recipe + `savedAt` (ISO datetime)

#### 3.4.2 Shopping List Item (client)

| Field | Type |
|-------|------|
| id | string |
| name | string |
| quantity / unit | optional strings |
| checked | boolean |
| sourceRecipeTitle | optional string |
| category | optional string |
| addedAt | optional timestamp |

#### 3.4.3 Persistence Matrix

| Data | Storage | Sync |
|------|---------|------|
| Favorites | AsyncStorage + MongoDB | Cloud when signed in |
| Shopping list | AsyncStorage | Device only |
| Preferences / onboarding flags | AsyncStorage | Device only |
| Active generated recipes | In-memory session | Not persisted unless favorited |
| Auth session | SecureStore (Clerk token cache) | Clerk |

---

### 3.5 Backend API Requirements (Summary)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/health` | No | Liveness/health |
| POST | `/api/v1/vision/extract` | No* | Extract ingredients from image |
| POST | `/api/v1/recipes/generate` | No* | Generate recipes from ingredients + country |
| GET | `/api/v1/favorites` | Yes | List user favorites |
| POST | `/api/v1/favorites` | Yes | Upsert favorite |
| DELETE | `/api/v1/favorites/{recipe_id}` | Yes | Remove favorite |

\*Current implementation does not require authentication on vision/generate endpoints. For production hardening, the client may require these endpoints to be authenticated (see §6 Future Considerations).

**Example generate request**

```json
{
  "ingredients": ["egg", "onion", "tomato"],
  "max_recipes": 3,
  "country": "Pakistan"
}
```

---

### 3.6 Non-Functional Requirements

#### 3.6.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Recipe generation and vision calls shall complete within acceptable interactive latency under normal network conditions; long waits shall show loading UI. |
| NFR-PERF-02 | Images for vision shall be resized client-side before upload to reduce bandwidth. |
| NFR-PERF-03 | Local list screens (favorites, shopping) shall remain responsive for typical personal dataset sizes. |

#### 3.6.2 Reliability & Availability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | Backend health endpoint shall support basic uptime checks. |
| NFR-REL-02 | When OpenAI or MongoDB is unavailable, the API shall fail gracefully with appropriate HTTP status codes. |
| NFR-REL-03 | Favorited recipes and shopping list shall remain available offline when already stored locally; AI features require connectivity. |

#### 3.6.3 Security & Privacy

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | OpenAI API keys shall be stored only on the server. |
| NFR-SEC-02 | Favorites mutations and retrieval shall be scoped to the authenticated user. |
| NFR-SEC-03 | Clerk session tokens shall be stored using platform secure storage mechanisms. |
| NFR-SEC-04 | Sensitive environment configuration shall not be committed to source control. |
| NFR-SEC-05 | Production deployments should disable insecure development identity fallbacks (`x-user-id`). |

#### 3.6.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | Primary flows (add ingredients → generate → cook) shall be completable without documentation for a typical smartphone user. |
| NFR-USE-02 | The app shall support light, dark, and system appearance modes. |
| NFR-USE-03 | Empty and error states shall provide clear next actions. |

#### 3.6.5 Portability & Compatibility

| ID | Requirement |
|----|-------------|
| NFR-PORT-01 | The client shall target iOS, Android, and web via Expo. |
| NFR-PORT-02 | Portrait orientation is the primary supported layout for mobile. |

#### 3.6.6 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MAIN-01 | Client and backend shall remain modular (screens/services/routes separated). |
| NFR-MAIN-02 | Configuration shall be environment-driven (API base URL, Clerk keys, OpenAI models, MongoDB connection). |

---

## 4. Verification and Acceptance

### 4.1 Acceptance Criteria (Release 1.0)

The product is accepted when the following can be demonstrated on a configured staging or production-like environment:

1. New user completes onboarding → sign-up/sign-in → country selection → Home.
2. User generates recipes from typed ingredients for a selected country.
3. User scans an image, reviews extracted ingredients, and generates recipes.
4. User opens recipe detail, scales servings (1–12), and enters cook mode.
5. User favorites a recipe; it appears in Favorites and persists after app relaunch (signed-in sync verified).
6. User adds missing ingredients to shopping list, checks items, and shares/copies the list.
7. User changes cuisine and appearance preferences; settings persist after relaunch.
8. User signs out and is returned to the unauthenticated entry flow.
9. Backend `/health` returns OK; favorites API rejects unauthenticated access.

### 4.2 Traceability

Requirements in §3 map to implemented modules in:

- Client: `ai-recipe-app/src/app`, `features`, `services`, `context`
- Backend: `backend/app/api/routes`, `services`, `repositories`

---

## 5. Technology Stack (As Built)

| Component | Stack |
|-----------|--------|
| Mobile/Web client | Expo ~54, React 19, React Native 0.81, Expo Router ~6, NativeWind 4, TypeScript ~5.9 |
| Auth | Clerk (`@clerk/clerk-expo`) |
| Backend | FastAPI 0.116, Uvicorn, Pydantic 2 |
| Database | MongoDB via Motor 3.7 |
| AI | OpenAI Python SDK |
| Local storage | AsyncStorage, Expo SecureStore |

---

## 6. Known Limitations and Future Considerations

| Item | Current state | Recommendation for client roadmap |
|------|---------------|-----------------------------------|
| Auth on AI endpoints | Vision and recipe generate are publicly callable if the API is reachable | Require Clerk JWT (or API gateway auth) in production |
| Recipe persistence | Session memory + favorites only | Optional “history” store or regenerate-from-id |
| Shopping sync | Device-local only | Cloud sync per user account |
| Automated tests | Limited / placeholder backend test script | Add API and critical-path UI tests |
| Documentation drift | Some README env notes outdated vs code | Align docs with `EXPO_PUBLIC_API_BASE_URL` + server-side OpenAI key |

---

## 7. Environment Configuration (Deployment)

### Client (examples)

- `EXPO_PUBLIC_API_BASE_URL` — Backend base URL
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key

### Backend (examples)

- `OPENAI_API_KEY`, `OPENAI_MODEL_RECIPES`, `OPENAI_MODEL_VISION`
- `MONGODB_URL`, `MONGODB_DB`
- `CLERK_JWKS_URL`, `CLERK_ISSUER`, `CLERK_AUDIENCE` (optional)
- `APP_ENV`, `CORS_ORIGINS`

---

## 8. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Client Product Owner | | | |
| Project Manager | | | |
| Technical Lead | | | |
| QA Lead | | | |

---

*End of Software Requirements Specification — SnapChef AI v1.0*
