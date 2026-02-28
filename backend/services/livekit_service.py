"""LiveKit service with mock and real implementations."""

from abc import ABC, abstractmethod

from livekit.api import AccessToken, VideoGrants


class BaseLiveKitService(ABC):
    @abstractmethod
    def create_token(self, user_id: str, room_name: str) -> str:
        ...


class MockLiveKitService(BaseLiveKitService):
    def create_token(self, user_id: str, room_name: str) -> str:
        return f"mock-livekit-token-{user_id}-{room_name}"


class RealLiveKitService(BaseLiveKitService):
    """LiveKit Cloud token generation."""

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret

    def create_token(self, user_id: str, room_name: str) -> str:
        token = AccessToken(self.api_key, self.api_secret)
        token.identity = user_id
        token.name = user_id
        grant = VideoGrants(room_join=True, room=room_name)
        token.video_grants = grant
        return token.to_jwt()
