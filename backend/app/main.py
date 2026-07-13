from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.favorites import repository as favorites_repository
from app.api.routes.favorites import router as favorites_router
from app.api.routes.health import router as health_router
from app.api.routes.recipes import router as recipes_router
from app.api.routes.vision import router as vision_router
from app.core.config import get_settings
from app.db.mongodb import close_mongo_connection

logger = logging.getLogger(__name__)


async def initialize_app_dependencies() -> None:
    try:
        await favorites_repository.ensure_indexes()
    except Exception as exc:  # pragma: no cover - defensive startup handling
        logger.warning("Skipping favorites index initialization: %s", exc)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await initialize_app_dependencies()
    yield
    await close_mongo_connection()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list if settings.cors_origin_list != ["*"] else [],
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(vision_router, prefix="/api/v1")
    app.include_router(recipes_router, prefix="/api/v1")
    app.include_router(favorites_router, prefix="/api/v1")
    return app


app = create_app()

