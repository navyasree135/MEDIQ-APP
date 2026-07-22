from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models import User, UserRole, Patient, LabTest
from backend.schemas.lab_test import LabTestResponse, LabTestCreate

router = APIRouter(prefix="/lab_tests", tags=["lab_tests"])


@router.get("", response_model=list[LabTestResponse])
def get_my_lab_tests(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Lab tests are only available for patient accounts",
        )
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile missing")

    return db.query(LabTest).filter(LabTest.patient_id == patient.id).all()


@router.post("", response_model=LabTestResponse)
def create_lab_test(
    payload: LabTestCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile missing")

    lab_test = LabTest(
        patient_id=patient.id,
        test_name=payload.test_name,
        lab_name=payload.lab_name,
        order_date=payload.order_date,
        status=payload.status,
        file_name=payload.file_name,
    )
    db.add(lab_test)
    db.commit()
    db.refresh(lab_test)
    return lab_test


@router.post("/for-patient/{patient_id}", response_model=LabTestResponse)
def doctor_create_lab_test(
    patient_id: int,
    payload: LabTestCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    """Doctor records a lab test report for a specific patient."""
    if user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can create lab test records for patients",
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    lab_test = LabTest(
        patient_id=patient_id,
        test_name=payload.test_name,
        lab_name=payload.lab_name,
        order_date=payload.order_date,
        status=payload.status,
        file_name=payload.file_name,
    )
    db.add(lab_test)
    db.commit()
    db.refresh(lab_test)
    return lab_test


@router.get("/patient/{patient_id}", response_model=list[LabTestResponse])
def get_patient_lab_tests(
    patient_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can view patient records",
        )
    return db.query(LabTest).filter(LabTest.patient_id == patient_id).all()
