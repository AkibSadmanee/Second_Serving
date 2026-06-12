from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.claim import Claim
from app.models.donation import Donation


async def create_claim(db: AsyncSession, donation_id: str, claimer_id: str) -> Claim:
    claim = Claim(donation_id=donation_id, claimer_id=claimer_id)
    db.add(claim)
    # Mark donation as claimed
    donation = await db.get(Donation, donation_id)
    if donation:
        donation.is_claimed = True
    await db.commit()
    await db.refresh(claim)
    return claim


async def get_claims_for_user(db: AsyncSession, user_id: str) -> list[Claim]:
    result = await db.execute(
        select(Claim)
        .where(Claim.claimer_id == user_id, Claim.status == "active")
        .options(selectinload(Claim.donation).selectinload(Donation.donor))
        .order_by(Claim.claimed_at.desc())
    )
    return result.scalars().all()


async def get_claim(db: AsyncSession, claim_id: str) -> Claim | None:
    result = await db.execute(select(Claim).where(Claim.id == claim_id))
    return result.scalar_one_or_none()


def can_cancel_claim(claim: Claim) -> bool:
    elapsed = datetime.now(timezone.utc) - claim.claimed_at.replace(tzinfo=timezone.utc)
    return elapsed.total_seconds() <= 300


async def cancel_claim(db: AsyncSession, claim: Claim) -> Claim:
    claim.status = "cancelled"
    # Unmark donation as claimed if no other active claims
    result = await db.execute(
        select(Claim).where(
            Claim.donation_id == claim.donation_id,
            Claim.status == "active",
            Claim.id != claim.id,
        )
    )
    other_active = result.scalars().first()
    if not other_active:
        donation = await db.get(Donation, claim.donation_id)
        if donation:
            donation.is_claimed = False
    await db.commit()
    await db.refresh(claim)
    return claim
