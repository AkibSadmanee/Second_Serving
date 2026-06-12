from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response

from app.api.deps import get_current_user
from app.photo_card import generate_contribution_card

router = APIRouter(prefix="/card", tags=["card"])


@router.get("/contribution")
async def contribution_card(
    restaurant_name: str = Query(...),
    meals_donated:   str = Query(...),
    _user=Depends(get_current_user),
):
    png_bytes = generate_contribution_card(restaurant_name, meals_donated)
    return Response(content=png_bytes, media_type="image/png")
