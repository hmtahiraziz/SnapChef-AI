"""MongoDB migration script.

Run from the `backend` folder with your Python environment active:

    python -m app.scripts.migrate

This will ensure indexes for the `favorites` collection used by the app.
"""
import asyncio
import sys

from app.core.config import get_settings
from app.db.mongodb import get_database, get_client
from app.repositories.favorites_repository import FavoritesRepository


async def migrate() -> int:
    settings = get_settings()
    print(f"Connecting to MongoDB {settings.mongodb_url} (db={settings.mongodb_db})")

    # Touch the client to ensure connection can be established
    try:
        db = get_database()
        # Run a lightweight command to verify connectivity
        await get_client().server_info()
    except Exception as exc:  # pragma: no cover - migration script
        print("Failed to connect to MongoDB:", exc)
        return 2

    repo = FavoritesRepository()

    print("Ensuring indexes for collection 'favorites'...")
    try:
        await repo.ensure_indexes()
    except Exception as exc:  # pragma: no cover - migration script
        print("Failed to ensure indexes:", exc)
        return 3

    print("Migration complete.")
    return 0


if __name__ == "__main__":
    code = asyncio.run(migrate())
    sys.exit(code)
