from __future__ import annotations
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    role: str = "beneficiary"  # contributor | beneficiary
    email: EmailStr
    password: str
    contact_name: str
    phone: str
    institution_type: Optional[str] = None
    organization_name: Optional[str] = None

    # Contributor
    address: Optional[str] = None
    city: Optional[str] = None
    additional_info: Optional[str] = None

    # Beneficiary
    address_city: Optional[str] = None
    dietary_restrictions: List[str] = []
    refrigerator: Optional[bool] = None
    freezer: Optional[bool] = None
    dry_storage: Optional[bool] = None
    no_reliable_storage: Optional[bool] = None


class UserUpdate(BaseModel):
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    address_city: Optional[str] = None
    additional_info: Optional[str] = None


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    email: str
    role: str
    contact_name: str
    phone: Optional[str] = None
    institution_type: Optional[str] = None
    organization_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    address_city: Optional[str] = None
    additional_info: Optional[str] = None
    dietary_restrictions: List[str] = []
    refrigerator_storage: Optional[bool] = None
    freezer_storage: Optional[bool] = None
    dry_storage: Optional[bool] = None
    no_reliable_storage: Optional[bool] = None
    created_at: Optional[datetime] = None
    is_active: bool = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(Token):
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
