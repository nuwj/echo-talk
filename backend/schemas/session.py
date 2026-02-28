from pydantic import BaseModel
from typing import Literal, Optional


class SessionCreate(BaseModel):
    mode: Literal["conversation", "pronunciation", "scenario"] = "conversation"


class TranscriptEntry(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    timestamp: str


class SessionResponse(BaseModel):
    id: str
    user_id: str
    mode: str
    started_at: str
    ended_at: Optional[str] = None
    status: Literal["active", "completed"] = "active"
    transcripts: list[TranscriptEntry] = []
    message_count: int = 0


class SessionSummary(BaseModel):
    id: str
    mode: str
    started_at: str
    ended_at: Optional[str] = None
    status: str
    message_count: int = 0
