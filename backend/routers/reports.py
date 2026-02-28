"""Reports router — exposes the generate_report Celery task via REST."""

from fastapi import APIRouter, Depends

from dependencies import get_current_user
from workers.report_tasks import generate_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/weekly")
async def weekly_report(current_user: dict = Depends(get_current_user)):
    """Return a weekly practice summary for the current user."""
    result = generate_report.delay(current_user["id"])
    # _FakeCelery shim returns raw dict from .delay()
    # Real Celery returns AsyncResult — call .get() to block for result
    if isinstance(result, dict):
        return result
    return result.get(timeout=10)
