"""Pydantic schemas for pronunciation assessments and grammar errors."""

from typing import Optional
from pydantic import BaseModel


class PhonemeAlignment(BaseModel):
    position: int
    phoneme: str        # IPA symbol (reference)
    expected: str       # same as phoneme
    actual: Optional[str]  # None for deletion
    type: str           # "correct" | "substitution" | "deletion" | "insertion"


class PronunciationAssessment(BaseModel):
    id: str
    session_id: str
    overall_score: float                    # 0-100
    phoneme_alignment: list[PhonemeAlignment]
    elsa_response: Optional[dict] = None   # raw ELSA API response for Pro users
    created_at: str


class GrammarError(BaseModel):
    id: str
    session_id: str
    skill_tag: str     # maps to skills.id, e.g. "article_usage"
    original: str
    corrected: str
    error_type: str    # e.g. "missing_article", "wrong_tense"
    created_at: str
