from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.models.appointment import Appointment
    from backend.models.user import User


class Doctor(Base):
    __tablename__ = "doctors"
    __table_args__ = (Index("ix_doctors_specialty", "specialty"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255))
    clinic_address: Mapped[str | None] = mapped_column(String(500))
    clinic_lat: Mapped[float | None] = mapped_column(Float)
    clinic_lng: Mapped[float | None] = mapped_column(Float)
    consultation_fee: Mapped[float | None] = mapped_column(Float, default=2400.0)
    practice_timings: Mapped[str | None] = mapped_column(String(255), default="09:00 AM - 05:00 PM")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    appointments: Mapped[list["Appointment"]] = relationship(back_populates="doctor", cascade="all, delete-orphan")
    user: Mapped["User"] = relationship(back_populates="doctor")
