"""Celery task: BKT knowledge state update.

Runs after analyze_session completes. Reads pronunciation + grammar results
and applies BKT update formula to all affected skill states.
"""

from typing import Any

from models.mock_db import db
from services.knowledge.skill_updater import update_from_session
from workers.celery_app import celery_app


@celery_app.task  # type: ignore[attr-defined]
def update_knowledge(session_id: str) -> dict[str, Any]:
    """Update BKT knowledge states for the user based on session errors."""
    session = db.get_session(session_id)
    if not session:
        return {"error": f"session {session_id} not found"}

    user_id = session["user_id"]
    updated = update_from_session(session_id, user_id)
    return {
        "session_id": session_id,
        "user_id": user_id,
        "skills_updated": len(updated),
    }
