"""Celery app factory.

In USE_MOCK_CELERY mode (default), tasks run synchronously in-process
without requiring a running Redis broker.
"""

from config import settings

try:
    from celery import Celery  # type: ignore[import]

    celery_app = Celery(
        "en_practice",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
    )
    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_always_eager=settings.USE_MOCK_CELERY,  # sync execution in mock mode
    )
except ImportError:
    # Celery not installed — provide a minimal decorator shim
    # that wraps tasks with a .delay() that calls them synchronously.

    class _TaskWrapper:  # type: ignore[no-redef]
        def __init__(self, func):
            self._func = func

        def __call__(self, *args, **kwargs):
            return self._func(*args, **kwargs)

        def delay(self, *args, **kwargs):
            return self._func(*args, **kwargs)

    class _FakeCelery:  # type: ignore[no-redef]
        def task(self, func=None, **kwargs):
            if func is None:
                def decorator(f):
                    return _TaskWrapper(f)
                return decorator
            return _TaskWrapper(func)

    celery_app = _FakeCelery()  # type: ignore[assignment]
