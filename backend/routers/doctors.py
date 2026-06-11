from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models import Appointment, AppointmentStatus, Doctor, User
from backend.schemas.doctor import DoctorResponse, DoctorUpdate

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("/me", response_model=DoctorResponse)
def get_my_doctor_profile(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if not getattr(user, "doctor", None):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor profile is only available for doctor accounts")
    return user.doctor


@router.patch("/me", response_model=DoctorResponse)
def update_my_doctor_profile(
    payload: DoctorUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if not getattr(user, "doctor", None):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Doctor profile is only available for doctor accounts")
    doctor = user.doctor
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doctor, key, value)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.get("/availability", response_model=list[dict])
def get_doctor_availability(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    specialty: str | None = None,
):
    doctors_query = db.query(Doctor)
    if specialty:
        doctors_query = doctors_query.filter(Doctor.specialty.ilike(f"%{specialty}%"))

    doctors = doctors_query.order_by(Doctor.full_name.asc()).all()
    now = datetime.now()
    availability: list[dict] = []

    for index, doctor in enumerate(doctors):
        upcoming = (
            db.query(Appointment)
            .filter(
                Appointment.doctor_id == doctor.id,
                Appointment.scheduled_at >= now,
                Appointment.status != AppointmentStatus.CANCELLED,
            )
            .order_by(Appointment.scheduled_at.asc())
            .limit(3)
            .all()
        )
        booked_slots = [appt.scheduled_at.isoformat() for appt in upcoming]

        # If no bookings exist yet, suggest a near-term placeholder slot for UX continuity.
        earliest_slot = booked_slots[0] if booked_slots else (now + timedelta(days=1, hours=index)).isoformat()

        availability.append(
            {
                "doctor_id": doctor.id,
                "doctor_name": doctor.full_name,
                "specialty": doctor.specialty,
                "location": doctor.location,
                "clinic_address": doctor.clinic_address,
                "clinic_lat": doctor.clinic_lat,
                "clinic_lng": doctor.clinic_lng,
                "slot": earliest_slot,
                "booked_slots": booked_slots,
            }
        )

    return availability


@router.get("", response_model=list[DoctorResponse])
def list_doctors(db: Annotated[Session, Depends(get_db)]):
    from backend.models import Doctor

    return db.query(Doctor).all()
