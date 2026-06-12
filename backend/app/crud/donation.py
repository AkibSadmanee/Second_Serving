from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.donation import Donation
from app.schemas.donation import DonationCreate, DonationUpdate


async def create_donation(db: AsyncSession, donor_id: str, data: DonationCreate) -> Donation:
    donation = Donation(donor_id=donor_id, **data.model_dump())
    db.add(donation)
    await db.commit()
    await db.refresh(donation)
    return donation


async def get_donations(db: AsyncSession) -> list[Donation]:
    result = await db.execute(
        select(Donation)
        .where(Donation.is_expired == False)
        .options(selectinload(Donation.donor))
        .order_by(Donation.created_at.desc())
    )
    donations = result.scalars().all()
    # Attach donor name for convenience
    for d in donations:
        d.donor_name = d.donor.organization_name or d.donor.contact_name if d.donor else "Unknown"
    return donations


async def get_donation(db: AsyncSession, donation_id: str) -> Donation | None:
    result = await db.execute(
        select(Donation)
        .where(Donation.id == donation_id)
        .options(selectinload(Donation.donor))
    )
    return result.scalar_one_or_none()


async def get_expired_donations(db: AsyncSession) -> list[Donation]:
    result = await db.execute(
        select(Donation)
        .where(Donation.is_expired == True)
        .options(selectinload(Donation.donor))
        .order_by(Donation.expires_at.desc())
    )
    return result.scalars().all()


async def update_donation(db: AsyncSession, donation: Donation, data: DonationUpdate) -> Donation:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(donation, field, value)
    await db.commit()
    await db.refresh(donation)
    return donation


async def delete_donation(db: AsyncSession, donation: Donation) -> None:
    await db.delete(donation)
    await db.commit()


def _within_five_minutes(dt: datetime) -> bool:
    elapsed = datetime.now(timezone.utc) - dt.replace(tzinfo=timezone.utc)
    return elapsed.total_seconds() <= 300


def can_edit_donation(donation: Donation) -> bool:
    return _within_five_minutes(donation.created_at) or not donation.is_claimed


def can_delete_donation(donation: Donation) -> bool:
    return _within_five_minutes(donation.created_at) or not donation.is_claimed
