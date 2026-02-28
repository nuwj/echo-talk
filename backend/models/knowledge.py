"""Pydantic schemas for knowledge tracking (BKT)."""

from pydantic import BaseModel


class Skill(BaseModel):
    id: str
    name: str
    category: str  # "grammar" | "pronunciation"


class KnowledgeState(BaseModel):
    id: str
    user_id: str
    skill_id: str
    skill_name: str
    skill_category: str
    p_mastery: float
    updated_at: str
