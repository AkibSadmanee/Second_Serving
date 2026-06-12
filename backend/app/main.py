from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import ai, auth, card, claims, donations, health, profile
from app.core.database import Base, engine
from app.models import User as _User, Donation as _Donation, Claim as _Claim  # noqa: F401 — register models


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="Second Serving API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (proof of address, etc.)
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

PREFIX = "/api"
app.include_router(health.router,    prefix=PREFIX)
app.include_router(auth.router,      prefix=PREFIX)
app.include_router(profile.router,   prefix=PREFIX)
app.include_router(donations.router, prefix=PREFIX)
app.include_router(claims.router,    prefix=PREFIX)
app.include_router(ai.router,        prefix=PREFIX)
app.include_router(card.router,      prefix=PREFIX)
