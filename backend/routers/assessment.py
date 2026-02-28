"""Assessment router: pronunciation + knowledge state endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from models.mock_db import db
from models.exercise import GrammarError, PhonemeAlignment, PronunciationAssessment
from models.knowledge import KnowledgeState, Skill

router = APIRouter(prefix="/assessments", tags=["assessments"])


# --- Knowledge routes first (must precede /{session_id} to avoid conflicts) ---

@router.get("/knowledge/states", response_model=list[KnowledgeState])
async def get_knowledge_states(current_user: dict = Depends(get_current_user)):
    """Return all BKT knowledge states for the current user."""
    states = db.get_all_knowledge_states(current_user["id"])
    return [KnowledgeState(**s) for s in states]


@router.get("/knowledge/skills", response_model=list[Skill])
async def get_skills(_current_user: dict = Depends(get_current_user)):
    """Return the full skill taxonomy."""
    return [Skill(**s) for s in db.get_skills()]


# --- Session-scoped routes ---

@router.get("/{session_id}", response_model=PronunciationAssessment)
async def get_assessment(
    session_id: str, current_user: dict = Depends(get_current_user)
):
    """Return pronunciation assessment for a completed session."""
    session = db.get_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    record = db.get_pronunciation_assessment(session_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not ready yet — analysis is still processing.",
        )

    return PronunciationAssessment(
        id=record["id"],
        session_id=record["session_id"],
        overall_score=record["overall_score"],
        phoneme_alignment=[PhonemeAlignment(**p) for p in record["phoneme_alignment"]],
        elsa_response=record.get("elsa_response"),
        created_at=record["created_at"],
    )


@router.get("/{session_id}/grammar", response_model=list[GrammarError])
async def get_grammar_errors(
    session_id: str, current_user: dict = Depends(get_current_user)
):
    """Return grammar errors detected in a session."""
    session = db.get_session(session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    errors = db.get_grammar_errors(session_id)
    return [GrammarError(**e) for e in errors]
