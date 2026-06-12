from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

import app.crud as crud
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.put("", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await crud.update_user(db, current_user, data)
    return UserOut.model_validate(updated)


@router.delete("")
async def delete_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await crud.delete_user(db, current_user)
    return {"message": "Account deleted"}
