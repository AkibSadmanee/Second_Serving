from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

import app.crud as crud
from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.donation import can_delete_donation, can_edit_donation
from app.models.user import User
from app.schemas.donation import DonationCreate, DonationOut, DonationUpdate
from app.schemas.claim import ClaimOut

router = APIRouter(prefix="/donations", tags=["donations"])


def _serialize(donation) -> dict:
    data = {col.name: getattr(donation, col.name) for col in donation.__table__.columns}
    data["donor"] = (donation.donor.organization_name or donation.donor.contact_name) if donation.donor else None
    return DonationOut(**data).model_dump()


# ── List all active donations ──────────────────────────────────────────────
@router.get("", response_model=list[DonationOut])
async def list_donations(db: AsyncSession = Depends(get_db)):
    items = await crud.get_donations(db)
    return [_serialize(d) for d in items]


# ── Expired donations ──────────────────────────────────────────────────────
@router.get("/expired", response_model=list[DonationOut])
async def list_expired(db: AsyncSession = Depends(get_db)):
    items = await crud.get_expired_donations(db)
    return [_serialize(d) for d in items]


# ── Get single donation ────────────────────────────────────────────────────
@router.get("/{donation_id}", response_model=DonationOut)
async def get_donation(donation_id: str, db: AsyncSession = Depends(get_db)):
    donation = await crud.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return _serialize(donation)


# ── Create donation (contributors only) ───────────────────────────────────
@router.post("", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
async def create_donation(
    data: DonationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "contributor":
        raise HTTPException(status_code=403, detail="Only contributors can post donations")
    donation = await crud.create_donation(db, current_user.id, data)
    return _serialize(donation)


# ── Edit donation (5 min or unclaimed) ────────────────────────────────────
@router.put("/{donation_id}", response_model=DonationOut)
async def edit_donation(
    donation_id: str,
    data: DonationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    donation = await crud.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    if donation.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your donation")
    if not can_edit_donation(donation):
        raise HTTPException(status_code=403, detail="Editing window has expired (5 min or already claimed)")
    updated = await crud.update_donation(db, donation, data)
    return _serialize(updated)


# ── Delete donation (5 min or unclaimed) ──────────────────────────────────
@router.delete("/{donation_id}")
async def delete_donation(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    donation = await crud.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    if donation.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your donation")
    if not can_delete_donation(donation):
        raise HTTPException(status_code=403, detail="Deletion window has expired (5 min or already claimed)")
    await crud.delete_donation(db, donation)
    return {"message": "Donation deleted"}


# ── Claim a donation ───────────────────────────────────────────────────────
@router.post("/{donation_id}/claim", response_model=ClaimOut, status_code=status.HTTP_201_CREATED)
async def claim_donation(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    donation = await crud.get_donation(db, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    if donation.is_expired:
        raise HTTPException(status_code=400, detail="This donation has expired")
    if donation.donor_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot claim your own donation")
    claim = await crud.create_claim(db, donation_id, current_user.id)
    return ClaimOut.model_validate(claim)
