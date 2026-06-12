import json
import tempfile
import os

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])

DIET_OPTIONS = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten Free"]
ALLERGEN_OPTIONS = ["Dairy", "Eggs", "Peanuts", "Tree Nuts", "Soy", "Gluten", "Shellfish"]

PARSE_SYSTEM_PROMPT = f"""You extract food donation information from a natural-language description.
Return ONLY valid JSON matching this exact shape — no markdown, no extra text:

{{
  "food_items": [
    {{
      "name": "string — food name",
      "quantity": "string — e.g. '10 trays' or '25 lbs'",
      "diet_types": ["array of matching values from: {DIET_OPTIONS}"],
      "allergens": ["array of matching values from: {ALLERGEN_OPTIONS}"]
    }}
  ]
}}

Rules:
- Split distinct food types into separate items (e.g. pizza AND pasta = 2 items).
- If portions/servings are mentioned, use that as quantity.
- Only include diet_types and allergens explicitly mentioned or strongly implied.
- If nothing matches, use empty arrays.
- Do not invent information not in the description."""


def _client() -> AsyncOpenAI:
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="OpenAI API key not configured")
    return AsyncOpenAI(api_key=settings.openai_api_key)


class ParseRequest(BaseModel):
    text: str


class FoodItem(BaseModel):
    name: str
    quantity: str
    diet_types: list[str] = []
    allergens: list[str] = []


class ParseResponse(BaseModel):
    food_items: list[FoodItem]


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe an audio recording using Whisper."""
    client = _client()

    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            result = await client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
            )
        return {"text": result.text}
    finally:
        os.unlink(tmp_path)


@router.post("/parse-donation", response_model=ParseResponse)
async def parse_donation(body: ParseRequest):
    """Parse a free-text donation description into structured food items using GPT-4.1."""
    client = _client()

    response = await client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": PARSE_SYSTEM_PROMPT},
            {"role": "user", "content": body.text},
        ],
        temperature=0,
    )

    raw = response.choices[0].message.content or "{}"
    try:
        parsed = json.loads(raw)
        return ParseResponse(**parsed)
    except (json.JSONDecodeError, Exception) as e:
        raise HTTPException(status_code=422, detail=f"Could not parse AI response: {e}")
