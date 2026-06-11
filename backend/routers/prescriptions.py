from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models import User, UserRole, Patient, Prescription
from backend.schemas.prescription import PrescriptionResponse, PrescriptionCreate

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


@router.get("", response_model=list[PrescriptionResponse])
def get_my_prescriptions(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Prescriptions are only available for patient accounts",
        )
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile missing")

    return db.query(Prescription).filter(Prescription.patient_id == patient.id).all()


@router.post("", response_model=PrescriptionResponse)
def create_prescription(
    payload: PrescriptionCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile missing")

    prescription = Prescription(
        patient_id=patient.id,
        doctor_name=payload.doctor_name,
        specialty=payload.specialty,
        hospital=payload.hospital,
        date=payload.date,
        image_url=payload.image_url,
        medicines_json=payload.medicines_json,
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription


@router.get("/patient/{patient_id}", response_model=list[PrescriptionResponse])
def get_patient_prescriptions(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can view patient records",
        )
    return db.query(Prescription).filter(Prescription.patient_id == patient_id).all()
