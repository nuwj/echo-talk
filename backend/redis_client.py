"""Redis client. Falls back gracefully when USE_MOCK_CELERY=True."""

from typing import Optional

try:
    import redis

    def get_redis_client(url: str) -> redis.Redis:
        return redis.from_url(url, decode_responses=True)

except ImportError:
    # Redis package not installed in mock mode — provide a no-op stub
    class _RedisStub:  # type: ignore[no-redef]
        def ping(self) -> bool:
            return True

        def get(self, key: str) -> Optional[str]:
            return None

        def set(self, key: str, value: str, **kwargs) -> None:
            pass

    def get_redis_client(url: str) -> _RedisStub:  # type: ignore[misc]
        return _RedisStub()
