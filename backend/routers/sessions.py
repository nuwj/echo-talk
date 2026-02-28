from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from models.mock_db import db
from schemas.session import SessionCreate, SessionResponse, SessionSummary, TranscriptEntry
from workers.analysis_tasks import analyze_session
from workers.knowledge_tasks import update_knowledge

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def create_session(req: SessionCreate, current_user: dict = Depends(get_current_user)):
    session = db.create_session(user_id=current_user["id"], mode=req.mode)
    return SessionResponse(
        id=session["id"],
        user_id=session["user_id"],
        mode=session["mode"],
        started_at=session["started_at"],
        status=session["status"],
    )


@router.get("", response_model=list[SessionSummary])
async def list_sessions(current_user: dict = Depends(get_current_user)):
    sessions = db.get_sessions_by_user(current_user["id"])
    return [
        SessionSummary(
            id=s["id"],
            mode=s["mode"],
            started_at=s["started_at"],
            ended_at=s.get("ended_at"),
            status=s["status"],
            message_count=s.get("message_count", 0),
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    session = db.get_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    transcripts = db.get_transcripts(session_id)
    return SessionResponse(
        id=session["id"],
        user_id=session["user_id"],
        mode=session["mode"],
        started_at=session["started_at"],
        ended_at=session.get("ended_at"),
        status=session["status"],
        transcripts=[TranscriptEntry(**t) for t in transcripts],
        message_count=len(transcripts),
    )


@router.post("/{session_id}/end", response_model=SessionResponse)
async def end_session(session_id: str, current_user: dict = Depends(get_current_user)):
    session = db.get_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    session = db.end_session(session_id)
    transcripts = db.get_transcripts(session_id)

    # Trigger async analysis pipeline (runs synchronously in mock mode)
    analyze_session.delay(session_id)
    update_knowledge.delay(session_id)

    return SessionResponse(
        id=session["id"],
        user_id=session["user_id"],
        mode=session["mode"],
        started_at=session["started_at"],
        ended_at=session.get("ended_at"),
        status=session["status"],
        transcripts=[TranscriptEntry(**t) for t in transcripts],
        message_count=len(transcripts),
    )
