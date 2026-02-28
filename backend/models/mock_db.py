"""In-memory mock database. Replace with SQLAlchemy when real DB is ready."""

import uuid
from datetime import datetime, timezone
from typing import Optional


class MockDatabase:
    def __init__(self):
        self.users: dict[str, dict] = {}
        self.sessions: dict[str, dict] = {}
        self.transcripts: dict[str, list[dict]] = {}
        # Phase 2: pronunciation + grammar analysis results
        self.pronunciation_assessments: dict[str, dict] = {}  # keyed by session_id
        self.grammar_errors: dict[str, list[dict]] = {}       # keyed by session_id
        # Phase 2: BKT knowledge tracking
        self.skills: dict[str, dict] = {}                     # keyed by skill_id
        self.knowledge_states: dict[str, dict] = {}           # keyed by f"{user_id}:{skill_id}"
        self._init_default_skills()

    # --- User operations ---
    def create_user(self, email: str, password_hash: str, name: str) -> dict:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        user = {
            "id": user_id,
            "email": email,
            "password_hash": password_hash,
            "name": name,
            "created_at": now,
        }
        self.users[user_id] = user
        return user

    def get_user_by_email(self, email: str) -> Optional[dict]:
        for user in self.users.values():
            if user["email"] == email:
                return user
        return None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        return self.users.get(user_id)

    def update_password_hash(self, user_id: str, password_hash: str) -> bool:
        user = self.users.get(user_id)
        if user:
            user["password_hash"] = password_hash
            return True
        return False

    # --- Session operations ---
    def create_session(self, user_id: str, mode: str) -> dict:
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        session = {
            "id": session_id,
            "user_id": user_id,
            "mode": mode,
            "started_at": now,
            "ended_at": None,
            "status": "active",
        }
        self.sessions[session_id] = session
        self.transcripts[session_id] = []
        return session

    def get_sessions_by_user(self, user_id: str) -> list[dict]:
        result = []
        for session in self.sessions.values():
            if session["user_id"] == user_id:
                s = {**session}
                s["message_count"] = len(self.transcripts.get(session["id"], []))
                result.append(s)
        return sorted(result, key=lambda x: x["started_at"], reverse=True)

    def get_session(self, session_id: str) -> Optional[dict]:
        return self.sessions.get(session_id)

    def end_session(self, session_id: str) -> Optional[dict]:
        session = self.sessions.get(session_id)
        if session:
            session["ended_at"] = datetime.now(timezone.utc).isoformat()
            session["status"] = "completed"
        return session

    # --- Transcript operations ---
    def add_transcript(self, session_id: str, role: str, content: str) -> dict:
        transcript_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        entry = {
            "id": transcript_id,
            "role": role,
            "content": content,
            "timestamp": now,
        }
        if session_id not in self.transcripts:
            self.transcripts[session_id] = []
        self.transcripts[session_id].append(entry)
        return entry

    def get_transcripts(self, session_id: str) -> list[dict]:
        return self.transcripts.get(session_id, [])

    def _init_default_skills(self):
        """Seed a fixed skill taxonomy used by BKT."""
        default_skills = [
            ("article_usage",     "Articles (a/an/the)",         "grammar"),
            ("verb_tense_past",   "Past Tense",                  "grammar"),
            ("verb_tense_present","Present Tense",               "grammar"),
            ("subject_verb_agreement", "Subject-Verb Agreement", "grammar"),
            ("preposition",       "Prepositions",                "grammar"),
            ("vowel_sounds",      "Vowel Sounds",                "pronunciation"),
            ("consonant_clusters","Consonant Clusters",          "pronunciation"),
            ("word_stress",       "Word Stress",                 "pronunciation"),
            ("linking_sounds",    "Linking / Connected Speech",  "pronunciation"),
            ("th_sounds",         "TH Sounds (θ / ð)",           "pronunciation"),
        ]
        for skill_id, name, category in default_skills:
            self.skills[skill_id] = {
                "id": skill_id,
                "name": name,
                "category": category,
            }

    # --- Phase 2: Pronunciation assessment operations ---

    def save_pronunciation_assessment(
        self,
        session_id: str,
        overall_score: float,
        phoneme_alignment: list[dict],
        elsa_response: Optional[dict] = None,
    ) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "overall_score": overall_score,
            "phoneme_alignment": phoneme_alignment,
            "elsa_response": elsa_response,
            "created_at": now,
        }
        self.pronunciation_assessments[session_id] = record
        return record

    def get_pronunciation_assessment(self, session_id: str) -> Optional[dict]:
        return self.pronunciation_assessments.get(session_id)

    # --- Phase 2: Grammar error operations ---

    def save_grammar_errors(self, session_id: str, errors: list[dict]) -> list[dict]:
        now = datetime.now(timezone.utc).isoformat()
        records = []
        for err in errors:
            record = {
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "skill_tag": err.get("skill_tag", ""),
                "original": err.get("original", ""),
                "corrected": err.get("corrected", ""),
                "error_type": err.get("error_type", ""),
                "created_at": now,
            }
            records.append(record)
        self.grammar_errors[session_id] = records
        return records

    def get_grammar_errors(self, session_id: str) -> list[dict]:
        return self.grammar_errors.get(session_id, [])

    # --- Phase 2: Knowledge state operations ---

    def get_skills(self) -> list[dict]:
        return list(self.skills.values())

    def get_knowledge_state(self, user_id: str, skill_id: str) -> Optional[dict]:
        return self.knowledge_states.get(f"{user_id}:{skill_id}")

    def get_all_knowledge_states(self, user_id: str) -> list[dict]:
        prefix = f"{user_id}:"
        return [v for k, v in self.knowledge_states.items() if k.startswith(prefix)]

    def upsert_knowledge_state(
        self, user_id: str, skill_id: str, p_mastery: float
    ) -> dict:
        key = f"{user_id}:{skill_id}"
        now = datetime.now(timezone.utc).isoformat()
        existing = self.knowledge_states.get(key)
        if existing:
            existing["p_mastery"] = p_mastery
            existing["updated_at"] = now
            return existing
        skill = self.skills.get(skill_id, {})
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "skill_id": skill_id,
            "skill_name": skill.get("name", skill_id),
            "skill_category": skill.get("category", "unknown"),
            "p_mastery": p_mastery,
            "updated_at": now,
        }
        self.knowledge_states[key] = record
        return record


# Conditional singleton: use MockDatabase in dev, RealDatabase in production
from config import settings

if settings.USE_MOCK_DB:
    db = MockDatabase()
else:
    from models.real_db import RealDatabase
    db = RealDatabase()
