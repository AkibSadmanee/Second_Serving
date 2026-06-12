import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, JSON, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id              = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email           = Column(String(255), unique=True, nullable=False, index=True)
    password_hash   = Column(String(255), nullable=False)
    role            = Column(String(20), nullable=False)  # contributor | beneficiary

    # Shared
    institution_type  = Column(String(100))
    organization_name = Column(String(255))
    contact_name      = Column(String(255), nullable=False)
    phone             = Column(String(50))

    # Contributor fields
    address           = Column(String(255))
    city              = Column(String(100))
    additional_info   = Column(Text)
    proof_of_address  = Column(String(500))  # file path

    # Beneficiary fields
    address_city             = Column(String(255))
    dietary_restrictions     = Column(JSON, default=list)
    refrigerator_storage     = Column(Boolean, default=False)
    freezer_storage          = Column(Boolean, default=False)
    dry_storage              = Column(Boolean, default=False)
    no_reliable_storage      = Column(Boolean, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active  = Column(Boolean, default=True)

    donations = relationship("Donation", back_populates="donor", cascade="all, delete-orphan")
    claims    = relationship("Claim",    back_populates="claimer", cascade="all, delete-orphan")
