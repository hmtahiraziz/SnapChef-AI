import asyncio
import unittest
from unittest.mock import AsyncMock, patch

from app.main import initialize_app_dependencies


class StartupTests(unittest.TestCase):
    def test_initialize_app_dependencies_continues_when_index_creation_fails(self) -> None:
        async def run_test() -> None:
            with patch("app.main.favorites_repository.ensure_indexes", new=AsyncMock(side_effect=RuntimeError("db down"))):
                await initialize_app_dependencies()

        asyncio.run(run_test())


if __name__ == "__main__":
    unittest.main()
