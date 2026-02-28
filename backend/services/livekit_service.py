"""LiveKit service with mock and real implementations."""

from abc import ABC, abstractmethod


class BaseLiveKitService(ABC):
    @abstractmethod
    def create_token(self, user_id: str, room_name: str) -> str:
        ...


class MockLiveKitService(BaseLiveKitService):
    def create_token(self, user_id: str, room_name: str) -> str:
        return f"mock-livekit-token-{user_id}-{room_name}"


class RealLiveKitService(BaseLiveKitService):
    """LiveKit token generation. Wire up when ready."""

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret

    def create_token(self, user_id: str, room_name: str) -> str:
        raise NotImplementedError("Real LiveKit service not yet configured")
