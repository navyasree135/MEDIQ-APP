from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.models.patient import Patient

class LabTest(Base):
    __tablename__ = "lab_tests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    lab_name: Mapped[str] = mapped_column(String(255), nullable=False)
    order_date: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "PENDING", "COMPLETED"
    file_name: Mapped[str | None] = mapped_column(String(255), default=None, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)

    patient: Mapped["Patient"] = relationship(back_populates="lab_tests")
