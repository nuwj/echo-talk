"""TTS service with mock and real implementations."""

import asyncio
from abc import ABC, abstractmethod

import httpx


class BaseTTSService(ABC):
    @abstractmethod
    async def synthesize(self, text: str, voice: str = "default") -> bytes:
        ...


class MockTTSService(BaseTTSService):
    async def synthesize(self, text: str, voice: str = "default") -> bytes:
        await asyncio.sleep(0.1)
        # Return empty bytes; frontend will fall back to text display
        return b""


# Default Cartesia voice — English, female, warm
CARTESIA_DEFAULT_VOICE = "a0e99841-438c-4a64-b679-ae501e7d6091"


class RealTTSService(BaseTTSService):
    """Cartesia Sonic TTS via REST API."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def synthesize(self, text: str, voice: str = "default") -> bytes:
        voice_id = CARTESIA_DEFAULT_VOICE if voice == "default" else voice
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.cartesia.ai/tts/bytes",
                headers={
                    "X-API-Key": self.api_key,
                    "Cartesia-Version": "2024-06-10",
                    "Content-Type": "application/json",
                },
                json={
                    "model_id": "sonic-2",
                    "transcript": text,
                    "voice": {"mode": "id", "id": voice_id},
                    "output_format": {
                        "container": "wav",
                        "encoding": "pcm_s16le",
                        "sample_rate": 22050,
                    },
                },
            )
            resp.raise_for_status()
            return resp.content
