from __future__ import annotations
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.donation import DonationOut


class ClaimOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    donation_id: str
    claimer_id: str
    claimed_at: datetime
    status: str
    donation: Optional[DonationOut] = None
