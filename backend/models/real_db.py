"""PostgreSQL-backed database using SQLAlchemy, matching MockDatabase API."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from database import SessionLocal
from models.db_models import (
    UserModel, SessionModel, TranscriptModel,
    PronunciationAssessmentModel, GrammarErrorModel,
    SkillModel, KnowledgeStateModel,
)


class RealDatabase:
    """Drop-in replacement for MockDatabase backed by PostgreSQL."""

    # --- User operations ---

    def create_user(self, email: str, password_hash: str, name: str) -> dict:
        with SessionLocal() as session:
            user = UserModel(
                id=str(uuid.uuid4()),
                email=email,
                password_hash=password_hash,
                name=name,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user.to_dict()

    def get_user_by_email(self, email: str) -> Optional[dict]:
        with SessionLocal() as session:
            user = session.query(UserModel).filter(UserModel.email == email).first()
            return user.to_dict() if user else None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        with SessionLocal() as session:
            user = session.get(UserModel, user_id)
            return user.to_dict() if user else None

    # --- Session operations ---

    def create_session(self, user_id: str, mode: str) -> dict:
        with SessionLocal() as session:
            sess = SessionModel(
                id=str(uuid.uuid4()),
                user_id=user_id,
                mode=mode,
            )
            session.add(sess)
            session.commit()
            session.refresh(sess)
            return sess.to_dict()

    def get_sessions_by_user(self, user_id: str) -> list[dict]:
        with SessionLocal() as session:
            rows = (
                session.query(SessionModel)
                .filter(SessionModel.user_id == user_id)
                .order_by(SessionModel.started_at.desc())
                .all()
            )
            result = []
            for s in rows:
                d = s.to_dict()
                count = (
                    session.query(TranscriptModel)
                    .filter(TranscriptModel.session_id == s.id)
                    .count()
                )
                d["message_count"] = count
                result.append(d)
            return result

    def get_session(self, session_id: str) -> Optional[dict]:
        with SessionLocal() as session:
            sess = session.get(SessionModel, session_id)
            return sess.to_dict() if sess else None

    def end_session(self, session_id: str) -> Optional[dict]:
        with SessionLocal() as session:
            sess = session.get(SessionModel, session_id)
            if sess:
                sess.ended_at = datetime.now(timezone.utc)
                sess.status = "completed"
                session.commit()
                session.refresh(sess)
                return sess.to_dict()
            return None

    # --- Transcript operations ---

    def add_transcript(self, session_id: str, role: str, content: str) -> dict:
        with SessionLocal() as session:
            entry = TranscriptModel(
                id=str(uuid.uuid4()),
                session_id=session_id,
                role=role,
                content=content,
            )
            session.add(entry)
            session.commit()
            session.refresh(entry)
            return entry.to_dict()

    def get_transcripts(self, session_id: str) -> list[dict]:
        with SessionLocal() as session:
            rows = (
                session.query(TranscriptModel)
                .filter(TranscriptModel.session_id == session_id)
                .order_by(TranscriptModel.timestamp.asc())
                .all()
            )
            return [r.to_dict() for r in rows]

    # --- Pronunciation assessment operations ---

    def save_pronunciation_assessment(
        self,
        session_id: str,
        overall_score: float,
        phoneme_alignment: list[dict],
        elsa_response: Optional[dict] = None,
    ) -> dict:
        with SessionLocal() as session:
            # Upsert: replace existing assessment for this session
            existing = (
                session.query(PronunciationAssessmentModel)
                .filter(PronunciationAssessmentModel.session_id == session_id)
                .first()
            )
            if existing:
                existing.overall_score = overall_score
                existing.phoneme_alignment = phoneme_alignment
                existing.elsa_response = elsa_response
                existing.created_at = datetime.now(timezone.utc)
                session.commit()
                session.refresh(existing)
                return existing.to_dict()

            record = PronunciationAssessmentModel(
                id=str(uuid.uuid4()),
                session_id=session_id,
                overall_score=overall_score,
                phoneme_alignment=phoneme_alignment,
                elsa_response=elsa_response,
            )
            session.add(record)
            session.commit()
            session.refresh(record)
            return record.to_dict()

    def get_pronunciation_assessment(self, session_id: str) -> Optional[dict]:
        with SessionLocal() as session:
            record = (
                session.query(PronunciationAssessmentModel)
                .filter(PronunciationAssessmentModel.session_id == session_id)
                .first()
            )
            return record.to_dict() if record else None

    # --- Grammar error operations ---

    def save_grammar_errors(self, session_id: str, errors: list[dict]) -> list[dict]:
        with SessionLocal() as session:
            # Remove old errors for this session
            session.query(GrammarErrorModel).filter(
                GrammarErrorModel.session_id == session_id
            ).delete()

            records = []
            for err in errors:
                record = GrammarErrorModel(
                    id=str(uuid.uuid4()),
                    session_id=session_id,
                    skill_tag=err.get("skill_tag", ""),
                    original=err.get("original", ""),
                    corrected=err.get("corrected", ""),
                    error_type=err.get("error_type", ""),
                )
                session.add(record)
                records.append(record)
            session.commit()
            return [r.to_dict() for r in records]

    def get_grammar_errors(self, session_id: str) -> list[dict]:
        with SessionLocal() as session:
            rows = (
                session.query(GrammarErrorModel)
                .filter(GrammarErrorModel.session_id == session_id)
                .all()
            )
            return [r.to_dict() for r in rows]

    # --- Knowledge state operations ---

    def get_skills(self) -> list[dict]:
        with SessionLocal() as session:
            rows = session.query(SkillModel).all()
            return [r.to_dict() for r in rows]

    def get_knowledge_state(self, user_id: str, skill_id: str) -> Optional[dict]:
        with SessionLocal() as session:
            row = (
                session.query(KnowledgeStateModel)
                .filter(
                    KnowledgeStateModel.user_id == user_id,
                    KnowledgeStateModel.skill_id == skill_id,
                )
                .first()
            )
            return row.to_dict() if row else None

    def get_all_knowledge_states(self, user_id: str) -> list[dict]:
        with SessionLocal() as session:
            rows = (
                session.query(KnowledgeStateModel)
                .filter(KnowledgeStateModel.user_id == user_id)
                .all()
            )
            return [r.to_dict() for r in rows]

    def upsert_knowledge_state(
        self, user_id: str, skill_id: str, p_mastery: float
    ) -> dict:
        with SessionLocal() as session:
            row = (
                session.query(KnowledgeStateModel)
                .filter(
                    KnowledgeStateModel.user_id == user_id,
                    KnowledgeStateModel.skill_id == skill_id,
                )
                .first()
            )
            if row:
                row.p_mastery = p_mastery
                session.commit()
                session.refresh(row)
                return row.to_dict()

            # Get skill info for the dict response
            skill = session.get(SkillModel, skill_id)
            row = KnowledgeStateModel(
                user_id=user_id,
                skill_id=skill_id,
                p_mastery=p_mastery,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return row.to_dict(skill)
