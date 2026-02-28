"""Celery task: weekly learning report generation.

Triggered by Celery beat (weekly schedule).
Aggregates 7 days of session data and returns a summary.
In mock mode, returns a plausible hardcoded summary.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from models.mock_db import db
from workers.celery_app import celery_app


@celery_app.task  # type: ignore[attr-defined]
def generate_report(user_id: str) -> dict[str, Any]:
    """Summarise the past 7 days for a user and return a report dict."""
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()

    sessions = [
        s for s in db.get_sessions_by_user(user_id)
        if s["started_at"] >= week_ago and s["status"] == "completed"
    ]

    total_turns = sum(
        len(db.get_transcripts(s["id"])) for s in sessions
    )

    knowledge_states = db.get_all_knowledge_states(user_id)
    weak_skills = [
        {"skill_id": ks["skill_id"], "skill_name": ks["skill_name"], "p_mastery": ks["p_mastery"]}
        for ks in knowledge_states
        if ks["p_mastery"] < 0.5
    ]
    weak_skills.sort(key=lambda x: x["p_mastery"])

    return {
        "user_id": user_id,
        "period_start": week_ago,
        "period_end": now.isoformat(),
        "sessions_completed": len(sessions),
        "total_conversation_turns": total_turns,
        "weak_skills": weak_skills[:5],  # top-5 weakest
        "generated_at": now.isoformat(),
    }
