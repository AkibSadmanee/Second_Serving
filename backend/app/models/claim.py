import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Claim(Base):
    __tablename__ = "claims"

    id          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    donation_id = Column(String(36), ForeignKey("donations.id", ondelete="CASCADE"), nullable=False)
    claimer_id  = Column(String(36), ForeignKey("users.id",     ondelete="CASCADE"), nullable=False)

    claimed_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status      = Column(String(20), default="active")  # active | cancelled

    donation = relationship("Donation", back_populates="claims")
    claimer  = relationship("User",     back_populates="claims")
