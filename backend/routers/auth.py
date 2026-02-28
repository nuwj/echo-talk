from fastapi import APIRouter, HTTPException, status

from dependencies import create_access_token, hash_password, verify_password, get_current_user
from fastapi import Depends
from models.mock_db import db
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse, ChangePasswordRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    existing = db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    password_hash = hash_password(req.password)
    user = db.create_user(email=req.email, password_hash=password_hash, name=req.name)
    token = create_access_token(user["id"])

    return TokenResponse(
        user=UserResponse(**{k: user[k] for k in ("id", "email", "name", "created_at")}),
        access_token=token,
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = db.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user["id"])

    return TokenResponse(
        user=UserResponse(**{k: user[k] for k in ("id", "email", "name", "created_at")}),
        access_token=token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        **{k: current_user[k] for k in ("id", "email", "name", "created_at")}
    )


@router.put("/password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    if not verify_password(req.current_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    new_hash = hash_password(req.new_password)
    db.update_password_hash(current_user["id"], new_hash)
    return {"message": "Password updated"}
