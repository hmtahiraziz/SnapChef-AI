from typing import Any

import httpx
from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from app.core.config import get_settings

_jwks: dict[str, Any] | None = None


def _format_auth_header(value: str | None) -> str:
    if not value:
        return ''
    return value.strip()


async def _fetch_jwks(settings: Any) -> dict[str, Any]:
    global _jwks
    if _jwks is None:
        if not settings.clerk_jwks_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Clerk JWKS URL is not configured.",
            )
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.clerk_jwks_url, timeout=10.0)
            response.raise_for_status()
            _jwks = response.json()
    return _jwks


async def _verify_clerk_token(token: str, settings: Any) -> dict[str, Any]:
    jwks = await _fetch_jwks(settings)
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization token.") from exc

    kid = unverified_header.get("kid")
    if not kid or "keys" not in jwks:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization token.")

    key = next((item for item in jwks["keys"] if item.get("kid") == kid), None)
    if not key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization token.")

    decode_kwargs: dict[str, Any] = {
        "algorithms": ["RS256"],
        "issuer": settings.clerk_issuer,
    }
    if settings.clerk_audience:
        decode_kwargs["audience"] = settings.clerk_audience
    else:
        decode_kwargs["options"] = {"verify_aud": False}

    try:
        claims = jwt.decode(token, key, **decode_kwargs)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired authorization token.") from exc

    return claims


async def get_user_id(
    authorization: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None),
    settings: Any = Depends(get_settings),
) -> str:
    auth_header = _format_auth_header(authorization)
    if auth_header:
        parts = auth_header.split(" ", 1)
        if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization header.")

        claims = await _verify_clerk_token(parts[1].strip(), settings)
        user_id = claims.get("sub") or claims.get("user_id")
        if not user_id or not isinstance(user_id, str):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization token does not contain a valid user id.")
        return user_id

    if settings.app_env == "development" and x_user_id and x_user_id.strip():
        return x_user_id.strip()

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required.")

