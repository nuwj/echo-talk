"""Skill updater: maps session errors → BKT knowledge state updates."""

from models.mock_db import db
from services.knowledge.bkt_model import BKTParams, update_mastery

_DEFAULT_PARAMS = BKTParams()

# Pronunciation error types that we treat as "wrong" for BKT
_PRONUNCIATION_ERROR_TYPES = {"substitution", "deletion", "insertion"}

# Map phoneme categories to skill IDs (heuristic)
_TH_PHONEMES = {"TH", "DH"}
_VOWEL_PHONEMES = {"AH", "AE", "EH", "IH", "IY", "UH", "UW", "AO", "OW", "AW", "OY", "AY"}


def _phoneme_to_skill(expected_phoneme: str) -> str:
    ph = expected_phoneme.upper().rstrip("012")
    if ph in _TH_PHONEMES:
        return "th_sounds"
    if ph in _VOWEL_PHONEMES:
        return "vowel_sounds"
    return "consonant_clusters"


def update_from_session(session_id: str, user_id: str) -> list[dict]:
    """
    Read pronunciation + grammar errors for a session and update BKT states.
    Returns list of updated knowledge state records.
    """
    updated = []

    # --- Pronunciation: per-phoneme ---
    assessment = db.get_pronunciation_assessment(session_id)
    if assessment:
        alignment = assessment.get("phoneme_alignment", [])
        skill_results: dict[str, list[bool]] = {}
        for entry in alignment:
            if entry["type"] == "insertion":
                continue  # no matching reference phoneme
            skill_id = _phoneme_to_skill(entry.get("expected") or "")
            correct = entry["type"] == "correct"
            skill_results.setdefault(skill_id, []).append(correct)

        for skill_id, results in skill_results.items():
            state = db.get_knowledge_state(user_id, skill_id)
            p_mastery = state["p_mastery"] if state else _DEFAULT_PARAMS.p_init
            for correct in results:
                p_mastery = update_mastery(p_mastery, correct, _DEFAULT_PARAMS)
            record = db.upsert_knowledge_state(user_id, skill_id, p_mastery)
            updated.append(record)

    # --- Grammar: per error record ---
    grammar_errors = db.get_grammar_errors(session_id)
    grammar_skill_errors: dict[str, int] = {}
    for err in grammar_errors:
        skill_id = err.get("skill_tag", "")
        if skill_id:
            grammar_skill_errors[skill_id] = grammar_skill_errors.get(skill_id, 0) + 1

    for skill_id, error_count in grammar_skill_errors.items():
        state = db.get_knowledge_state(user_id, skill_id)
        p_mastery = state["p_mastery"] if state else _DEFAULT_PARAMS.p_init
        # Each error = one wrong observation
        for _ in range(error_count):
            p_mastery = update_mastery(p_mastery, correct=False, params=_DEFAULT_PARAMS)
        record = db.upsert_knowledge_state(user_id, skill_id, p_mastery)
        updated.append(record)

    return updated
