from __future__ import annotations
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DonationCreate(BaseModel):
    name: str
    quantity: str
    location: str
    pickup_time: datetime
    description: Optional[str] = None
    image_emoji: str = "🍽️"
    diet_types: List[str] = []
    allergens: List[str] = []
    storage_type: Optional[str] = None


class DonationUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[str] = None
    location: Optional[str] = None
    pickup_time: Optional[datetime] = None
    description: Optional[str] = None
    image_emoji: Optional[str] = None
    diet_types: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    storage_type: Optional[str] = None


class DonationOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    donor_id: str
    donor: Optional[str] = None  # filled in from relationship
    name: str
    quantity: str
    location: str
    pickup_time: datetime
    description: Optional[str] = None
    image_emoji: str
    diet_types: List[str] = []
    allergens: List[str] = []
    storage_type: Optional[str] = None
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_expired: bool = False
    is_claimed: bool = False
