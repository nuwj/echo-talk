"""Celery task: post-session analysis.

Workflow:
1. Re-transcribe user audio with Whisper for phoneme accuracy (mocked via STT transcript)
2. Run Needleman-Wunsch phoneme alignment on each user utterance
3. Detect grammar errors from the transcript text
4. Persist results to pronunciation_assessments + grammar_errors tables

Triggered by: POST /sessions/{session_id}/end  (see routers/sessions.py)
"""

import re
from typing import Any

from models.mock_db import db
from services.pronunciation.phoneme_aligner import (
    align_phonemes,
    compute_pronunciation_score,
    get_word_phonemes,
)
from workers.celery_app import celery_app


# ---------------------------------------------------------------------------
# Grammar detection helpers (rule-based, sufficient for mock/free tier)
# ---------------------------------------------------------------------------

_ARTICLE_PATTERN = re.compile(
    r"\b(a|an|the)\s+\w+|\bi\s+(go|went|am|was|have|has)\b",
    re.IGNORECASE,
)

_GRAMMAR_RULES = [
    # (regex_to_detect_error, skill_tag, error_type)
    (re.compile(r"\bI\s+goes?\b", re.IGNORECASE), "subject_verb_agreement", "wrong_3p_verb"),
    (re.compile(r"\bhe\s+go\b", re.IGNORECASE), "subject_verb_agreement", "missing_3p_s"),
    (re.compile(r"\byesterday\s+I\s+(\w+[^edt])\b", re.IGNORECASE), "verb_tense_past", "wrong_tense"),
    (re.compile(r"\bI\s+am\s+go\b", re.IGNORECASE), "verb_tense_present", "missing_gerund"),
    (re.compile(r"\bI\s+go\s+to\s+school\s+in\s+the\s+morning\b", re.IGNORECASE), "preposition", "ok"),
    (re.compile(r"\b(a)\s+[aeiou]\w+", re.IGNORECASE), "article_usage", "wrong_article_an"),
]


def _detect_grammar_errors(transcript: str) -> list[dict]:
    errors = []
    for pattern, skill_tag, error_type in _GRAMMAR_RULES:
        if error_type == "ok":
            continue
        for match in pattern.finditer(transcript):
            errors.append(
                {
                    "skill_tag": skill_tag,
                    "original": match.group(0),
                    "corrected": "",  # filled by LLM recast in Phase 1, placeholder here
                    "error_type": error_type,
                }
            )
    return errors


# ---------------------------------------------------------------------------
# Phoneme alignment helper
# ---------------------------------------------------------------------------

def _align_transcript(user_text: str) -> tuple[list[dict], float]:
    """Align all words in a transcript. Returns (alignment, overall_score)."""
    all_alignment: list[dict] = []
    position_offset = 0
    for word in user_text.split():
        clean_word = re.sub(r"[^a-zA-Z']", "", word)
        if not clean_word:
            continue
        expected = get_word_phonemes(clean_word)
        # In mock mode we treat actual == expected (perfect pronunciation) +
        # inject a random substitution on common TH words for demo purposes
        actual = list(expected)
        if clean_word.lower().startswith("th"):
            if actual:
                actual[0] = "S"  # common substitution: "θ" → "S"
        alignment = align_phonemes(expected, actual)
        for entry in alignment:
            entry["position"] += position_offset
        all_alignment.extend(alignment)
        position_offset += len(alignment)
    overall = compute_pronunciation_score(all_alignment)
    return all_alignment, overall


# ---------------------------------------------------------------------------
# Celery task
# ---------------------------------------------------------------------------

@celery_app.task  # type: ignore[attr-defined]
def analyze_session(session_id: str) -> dict[str, Any]:
    """Main post-session analysis task."""
    session = db.get_session(session_id)
    if not session:
        return {"error": f"session {session_id} not found"}

    user_id = session["user_id"]
    transcripts = db.get_transcripts(session_id)
    user_turns = [t["content"] for t in transcripts if t["role"] == "user"]
    full_text = " ".join(user_turns)

    # 1. Grammar errors
    errors = _detect_grammar_errors(full_text)
    db.save_grammar_errors(session_id, errors)

    # 2. Phoneme alignment
    alignment, overall_score = _align_transcript(full_text)
    db.save_pronunciation_assessment(
        session_id=session_id,
        overall_score=overall_score,
        phoneme_alignment=alignment,
    )

    return {
        "session_id": session_id,
        "overall_score": overall_score,
        "grammar_errors": len(errors),
        "phoneme_count": len(alignment),
    }
