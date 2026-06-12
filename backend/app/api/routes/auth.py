import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

import app.crud as crud
from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.user import ForgotPasswordRequest, LoginResponse, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

UPLOAD_DIR = Path("uploads/proof_of_address")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ── Login ──────────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await crud.get_user_by_email(db, form.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    from app.core.security import verify_password
    if not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


# ── Register (JSON — beneficiary) ─────────────────────────────────────────
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_json(data: UserCreate, db: AsyncSession = Depends(get_db)):
    if await crud.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    data.role = "beneficiary"
    user = await crud.create_user(db, data)
    return UserOut.model_validate(user)


# ── Register (multipart — contributor with file upload) ───────────────────
@router.post("/register/contributor", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_contributor(
    role: str = Form("contributor"),
    institution_type: str = Form(...),
    organization_name: str = Form(...),
    contact_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    additional_info: str = Form(""),
    proof_of_address: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    if await crud.get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")

    proof_path = None
    if proof_of_address and proof_of_address.filename:
        ext = Path(proof_of_address.filename).suffix
        dest = UPLOAD_DIR / f"{email.replace('@','_at_')}{ext}"
        with dest.open("wb") as f:
            shutil.copyfileobj(proof_of_address.file, f)
        proof_path = str(dest)

    data = UserCreate(
        role=role,
        institution_type=institution_type,
        organization_name=organization_name,
        contact_name=contact_name,
        email=email,
        password=password,
        phone=phone,
        address=address,
        city=city,
        additional_info=additional_info,
    )
    user = await crud.create_user(db, data, proof_path=proof_path)
    return UserOut.model_validate(user)


# ── Forgot password ────────────────────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    # In production: send reset email. Here we just confirm receipt.
    await crud.get_user_by_email(db, body.email)  # no-op; don't reveal existence
    return {"message": "If that email is registered, a reset link has been sent."}
