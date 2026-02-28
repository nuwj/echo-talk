import base64

from fastapi import APIRouter, Depends, HTTPException, status

from config import settings
from dependencies import get_current_user
from models.mock_db import db
from schemas.conversation import ChatRequest, ChatResponse
from services.llm_service import BaseLLMService, MockLLMService, RealLLMService, ENGLISH_COACH_PROMPT
from services.tts_service import BaseTTSService, MockTTSService, RealTTSService

router = APIRouter(prefix="/conversation", tags=["conversation"])


def get_llm_service() -> BaseLLMService:
    if settings.USE_MOCK_LLM:
        return MockLLMService()
    return RealLLMService(
        api_key=settings.SILICONFLOW_API_KEY,
        provider=settings.DEFAULT_LLM_PROVIDER,
        model=settings.DEFAULT_LLM_MODEL,
    )


def get_tts_service() -> BaseTTSService:
    if settings.USE_MOCK_TTS:
        return MockTTSService()
    return RealTTSService(api_key=settings.CARTESIA_API_KEY)


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),
    llm: BaseLLMService = Depends(get_llm_service),
    tts: BaseTTSService = Depends(get_tts_service),
):
    # Validate session
    session = db.get_session(req.session_id)
    if not session or session["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    if session["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Session is not active"
        )

    # Store user message
    db.add_transcript(req.session_id, "user", req.message)

    # Build message history for LLM
    transcripts = db.get_transcripts(req.session_id)
    messages = [{"role": t["role"], "content": t["content"]} for t in transcripts]

    # Get LLM response
    reply = await llm.chat(messages, system_prompt=ENGLISH_COACH_PROMPT)

    # Store AI response
    ai_transcript = db.add_transcript(req.session_id, "assistant", reply)

    # Generate TTS audio
    audio_base64 = None
    audio_bytes = await tts.synthesize(reply)
    if audio_bytes:
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    return ChatResponse(
        reply=reply,
        audio_base64=audio_base64,
        transcript_id=ai_transcript["id"],
    )
