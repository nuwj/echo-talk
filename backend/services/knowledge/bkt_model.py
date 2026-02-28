"""Bayesian Knowledge Tracing (BKT) model.

Reference: Corbett & Anderson (1994).
Formulas documented in 开发速查.md §4.2 and 技术方案设计.md §Phase2.
"""

from dataclasses import dataclass


@dataclass
class BKTParams:
    p_init: float = 0.1     # P(mastery at start)
    p_transit: float = 0.2  # P(learn | not mastered, one practice)
    p_slip: float = 0.1     # P(wrong | mastered)
    p_guess: float = 0.2    # P(correct | not mastered)


MASTERY_THRESHOLD = 0.95  # skill considered mastered above this


def update_mastery(p_mastery: float, correct: bool, params: BKTParams) -> float:
    """
    Given current mastery probability and observation, return updated probability.

    Steps:
    1. Compute posterior P(mastery | observation) via Bayes
    2. Apply learning: P_new = P_posterior + (1 - P_posterior) * p_transit
    """
    if correct:
        p_obs = p_mastery * (1 - params.p_slip) + (1 - p_mastery) * params.p_guess
        p_posterior = p_mastery * (1 - params.p_slip) / p_obs
    else:
        p_obs = p_mastery * params.p_slip + (1 - p_mastery) * (1 - params.p_guess)
        p_posterior = p_mastery * params.p_slip / p_obs

    return p_posterior + (1 - p_posterior) * params.p_transit


def is_mastered(p_mastery: float) -> bool:
    return p_mastery >= MASTERY_THRESHOLD
