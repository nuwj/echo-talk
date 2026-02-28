"""SQLAlchemy ORM models for EchoTalk."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Float, DateTime, Text, ForeignKey, UniqueConstraint, JSON, Integer
)
from sqlalchemy.orm import relationship

from database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    sessions = relationship("SessionModel", back_populates="user")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "password_hash": self.password_hash,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    mode = Column(String, nullable=False)
    started_at = Column(DateTime(timezone=True), default=_utcnow)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="active")

    user = relationship("UserModel", back_populates="sessions")
    transcripts = relationship("TranscriptModel", back_populates="session")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "mode": self.mode,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "status": self.status,
        }


class TranscriptModel(Base):
    __tablename__ = "transcripts"

    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False, index=True)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=_utcnow)

    session = relationship("SessionModel", back_populates="transcripts")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


class PronunciationAssessmentModel(Base):
    __tablename__ = "pronunciation_assessments"

    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), unique=True, nullable=False, index=True)
    overall_score = Column(Float, nullable=False)
    phoneme_alignment = Column(JSON, default=list)
    elsa_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "overall_score": self.overall_score,
            "phoneme_alignment": self.phoneme_alignment or [],
            "elsa_response": self.elsa_response,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class GrammarErrorModel(Base):
    __tablename__ = "grammar_errors"

    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False, index=True)
    skill_tag = Column(String, default="")
    original = Column(Text, default="")
    corrected = Column(Text, default="")
    error_type = Column(String, default="")
    created_at = Column(DateTime(timezone=True), default=_utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "skill_tag": self.skill_tag,
            "original": self.original,
            "corrected": self.corrected,
            "error_type": self.error_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SkillModel(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
        }


class KnowledgeStateModel(Base):
    __tablename__ = "knowledge_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id"), nullable=False)
    p_mastery = Column(Float, default=0.1)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    skill = relationship("SkillModel")

    def to_dict(self, skill: "SkillModel | None" = None) -> dict:
        s = skill or self.skill
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "skill_id": self.skill_id,
            "skill_name": s.name if s else self.skill_id,
            "skill_category": s.category if s else "unknown",
            "p_mastery": self.p_mastery,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
