"""TTS service with mock and real implementations."""

import asyncio
from abc import ABC, abstractmethod


class BaseTTSService(ABC):
    @abstractmethod
    async def synthesize(self, text: str, voice: str = "default") -> bytes:
        ...


class MockTTSService(BaseTTSService):
    async def synthesize(self, text: str, voice: str = "default") -> bytes:
        await asyncio.sleep(0.1)
        # Return empty bytes; frontend will fall back to text display
        return b""


class RealTTSService(BaseTTSService):
    """Cartesia Sonic 3 TTS. Wire up when ready."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def synthesize(self, text: str, voice: str = "default") -> bytes:
        raise NotImplementedError("Real TTS service not yet configured")
