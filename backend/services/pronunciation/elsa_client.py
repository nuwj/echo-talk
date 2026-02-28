"""ELSA Speech API client (Pro tier).

Docs: https://developers.elsaspeak.com/
Mock mode is controlled by config.USE_MOCK_ELSA.
"""

from __future__ import annotations
import random
from typing import Optional

import httpx

from config import settings

_BASE_URL = "https://api.elsaspeak.com/v1"


class ElsaClient:
    def __init__(self, api_key: str):
        self._api_key = api_key
        self._headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    async def assess(self, audio_base64: str, reference_text: str) -> dict:
        """Send audio to ELSA and return raw assessment JSON."""
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{_BASE_URL}/pronunciation/assess",
                headers=self._headers,
                json={
                    "audio": audio_base64,
                    "text": reference_text,
                    "language": "en-US",
                },
            )
            resp.raise_for_status()
            return resp.json()


class MockElsaClient:
    """Returns plausible-looking mock data for development."""

    async def assess(self, audio_base64: str, reference_text: str) -> dict:  # noqa: ARG002
        words = reference_text.split()
        return {
            "overall_score": round(random.uniform(65, 95), 1),
            "words": [
                {
                    "word": w,
                    "score": round(random.uniform(60, 100), 1),
                    "phonemes": [],
                }
                for w in words
            ],
        }


def get_elsa_client() -> ElsaClient | MockElsaClient:
    if settings.USE_MOCK_ELSA or not settings.ELSA_API_KEY:
        return MockElsaClient()
    return ElsaClient(settings.ELSA_API_KEY)
