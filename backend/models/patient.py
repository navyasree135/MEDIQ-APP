from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.models.user import User
    from backend.models.insurance import Insurance
    from backend.models.appointment import Appointment
    from backend.models.triage_log import TriageLog
    from backend.models.prescription import Prescription
    from backend.models.lab_test import LabTest


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = (
        Index("ix_patients_user_id", "user_id", unique=True),
        Index("ix_patients_insurance_id", "insurance_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(default=None)
    phone: Mapped[str | None] = mapped_column(String(50))
    insurance_id: Mapped[int | None] = mapped_column(ForeignKey("insurance.id"))
    blood_group: Mapped[str | None] = mapped_column(String(20), default=None)
    gender: Mapped[str | None] = mapped_column(String(20), default=None)
    last_visit: Mapped[str | None] = mapped_column(String(100), default=None)
    conditions: Mapped[str | None] = mapped_column(Text, default=None)
    allergies: Mapped[str | None] = mapped_column(Text, default=None)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(255), default=None)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(50), default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="patient")
    insurance: Mapped["Insurance | None"] = relationship(back_populates="patients")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    triage_logs: Mapped[list["TriageLog"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    prescriptions: Mapped[list["Prescription"]] = relationship(back_populates="patient", cascade="all, delete-orphan")
    lab_tests: Mapped[list["LabTest"]] = relationship(back_populates="patient", cascade="all, delete-orphan")

