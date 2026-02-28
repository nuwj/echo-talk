"""STT service with mock and real implementations."""

import asyncio
from abc import ABC, abstractmethod


class BaseSTTService(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, language: str = "en") -> str:
        ...


class MockSTTService(BaseSTTService):
    MOCK_TRANSCRIPTIONS = [
        "Hello, I would like to practice my English speaking skills.",
        "I think learning English is very important for my career.",
        "Yesterday I went to the park and it was very beautiful.",
        "Can you help me improve my pronunciation?",
        "I have been studying English for about two years now.",
    ]
    _counter = 0

    async def transcribe(self, audio_bytes: bytes, language: str = "en") -> str:
        await asyncio.sleep(0.2)
        result = self.MOCK_TRANSCRIPTIONS[self._counter % len(self.MOCK_TRANSCRIPTIONS)]
        self._counter += 1
        return result


class RealSTTService(BaseSTTService):
    """Deepgram Flux STT. Wire up when ready."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def transcribe(self, audio_bytes: bytes, language: str = "en") -> str:
        raise NotImplementedError("Real STT service not yet configured")
