from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import auth, sessions, conversation
from routers import assessment


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("EchoTalk API starting up...")
    yield
    print("EchoTalk API shutting down...")


app = FastAPI(
    title="EchoTalk API",
    description="Backend for EchoTalk AI English speaking practice system",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(conversation.router, prefix="/api")
app.include_router(assessment.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "echo-talk"}
