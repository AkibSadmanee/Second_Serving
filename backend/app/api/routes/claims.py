from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

import app.crud as crud
from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.claim import can_cancel_claim
from app.models.user import User
from app.schemas.claim import ClaimOut

router = APIRouter(prefix="/claims", tags=["claims"])


@router.get("", response_model=list[ClaimOut])
async def list_claims(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    claims = await crud.get_claims_for_user(db, current_user.id)
    result = []
    for c in claims:
        out = ClaimOut.model_validate(c)
        if c.donation:
            from app.schemas.donation import DonationOut
            d_out = DonationOut.model_validate(c.donation).model_dump()
            if c.donation.donor:
                d_out["donor"] = c.donation.donor.organization_name or c.donation.donor.contact_name
            out.donation = d_out
        result.append(out)
    return result


@router.delete("/{claim_id}")
async def cancel_claim(
    claim_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    claim = await crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.claimer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your claim")
    if not can_cancel_claim(claim):
        raise HTTPException(status_code=403, detail="Cancellation window has expired (5 minutes)")
    await crud.cancel_claim(db, claim)
    return {"message": "Claim cancelled"}
