from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    audio_base64: Optional[str] = None
    transcript_id: str


class TTSRequest(BaseModel):
    text: str
    voice: str = "default"
