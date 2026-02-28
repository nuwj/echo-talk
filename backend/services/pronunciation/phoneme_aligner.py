"""Needleman-Wunsch phoneme alignment.

Aligns a sequence of actual phonemes (from STT) against expected phonemes
(from CMU Pronouncing Dictionary) and produces a diff-style annotation.

Output format matches 开发速查.md §4.1:
    [{"position": 0, "phoneme": "θ", "expected": "θ", "actual": "s", "type": "substitution"}, ...]
"""

from __future__ import annotations

# Scoring constants
MATCH_SCORE = 2
MISMATCH_SCORE = -1
GAP_SCORE = -1


def _needleman_wunsch(ref: list[str], hyp: list[str]) -> list[tuple[str | None, str | None]]:
    """Classic NW global alignment. Returns list of (ref_phoneme, hyp_phoneme) pairs."""
    n, m = len(ref), len(hyp)
    # Fill DP table
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        dp[i][0] = dp[i - 1][0] + GAP_SCORE
    for j in range(1, m + 1):
        dp[0][j] = dp[0][j - 1] + GAP_SCORE

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            match = dp[i - 1][j - 1] + (MATCH_SCORE if ref[i - 1] == hyp[j - 1] else MISMATCH_SCORE)
            delete = dp[i - 1][j] + GAP_SCORE
            insert = dp[i][j - 1] + GAP_SCORE
            dp[i][j] = max(match, delete, insert)

    # Traceback
    alignment: list[tuple[str | None, str | None]] = []
    i, j = n, m
    while i > 0 or j > 0:
        if i > 0 and j > 0:
            score = MATCH_SCORE if ref[i - 1] == hyp[j - 1] else MISMATCH_SCORE
            if dp[i][j] == dp[i - 1][j - 1] + score:
                alignment.append((ref[i - 1], hyp[j - 1]))
                i -= 1
                j -= 1
                continue
        if i > 0 and dp[i][j] == dp[i - 1][j] + GAP_SCORE:
            alignment.append((ref[i - 1], None))
            i -= 1
        else:
            alignment.append((None, hyp[j - 1]))
            j -= 1

    alignment.reverse()
    return alignment


def align_phonemes(expected: list[str], actual: list[str]) -> list[dict]:
    """
    Align expected vs actual phoneme sequences.

    Returns a list of alignment dicts ready to be stored in
    pronunciation_assessments.phoneme_alignment.
    """
    pairs = _needleman_wunsch(expected, actual)
    result = []
    position = 0
    for ref_ph, hyp_ph in pairs:
        if ref_ph is None:
            # Extra phoneme inserted by speaker
            entry = {
                "position": position,
                "phoneme": hyp_ph,
                "expected": None,
                "actual": hyp_ph,
                "type": "insertion",
            }
        elif hyp_ph is None:
            # Speaker dropped a phoneme
            entry = {
                "position": position,
                "phoneme": ref_ph,
                "expected": ref_ph,
                "actual": None,
                "type": "deletion",
            }
        elif ref_ph == hyp_ph:
            entry = {
                "position": position,
                "phoneme": ref_ph,
                "expected": ref_ph,
                "actual": hyp_ph,
                "type": "correct",
            }
        else:
            entry = {
                "position": position,
                "phoneme": ref_ph,
                "expected": ref_ph,
                "actual": hyp_ph,
                "type": "substitution",
            }
        result.append(entry)
        position += 1
    return result


def compute_pronunciation_score(alignment: list[dict]) -> float:
    """Compute a 0-100 score from alignment: correct / total_reference_phonemes * 100."""
    ref_phonemes = [a for a in alignment if a["type"] != "insertion"]
    if not ref_phonemes:
        return 100.0
    correct = sum(1 for a in ref_phonemes if a["type"] == "correct")
    return round(correct / len(ref_phonemes) * 100, 1)


def get_word_phonemes(word: str) -> list[str]:
    """
    Look up CMU Pronouncing Dictionary phonemes for a word.
    Falls back to character-level mock if `pronouncing` is not installed.
    """
    try:
        import pronouncing  # type: ignore[import]
        phones_list = pronouncing.phones_for_word(word.lower())
        if phones_list:
            # Strip stress digits: "AH0" → "AH"
            return [p.rstrip("012") for p in phones_list[0].split()]
    except ImportError:
        pass
    # Fallback: treat each letter as a phoneme (mock only)
    return list(word.lower())
