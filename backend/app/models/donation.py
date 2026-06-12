import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Donation(Base):
    __tablename__ = "donations"

    id          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    donor_id    = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name        = Column(String(255), nullable=False)
    quantity    = Column(String(100), nullable=False)
    location    = Column(String(255), nullable=False)
    pickup_time = Column(DateTime, nullable=False)
    description = Column(Text)
    image_emoji = Column(String(10), default="🍽️")

    diet_types   = Column(JSON, default=list)
    allergens    = Column(JSON, default=list)
    storage_type = Column(String(50))

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)
    is_expired = Column(Boolean, default=False)
    is_claimed = Column(Boolean, default=False)

    donor  = relationship("User",  back_populates="donations")
    claims = relationship("Claim", back_populates="donation", cascade="all, delete-orphan")
