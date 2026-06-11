import sys
from pathlib import Path

# Ensure project root is on sys.path
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.core.database import Base
from backend.models import User, UserRole, Patient, Prescription, LabTest
from backend.schemas.patient import PatientUpdate
from backend.schemas.prescription import PrescriptionCreate
from backend.schemas.lab_test import LabTestCreate

def main():
    print("Testing expanded database schema locally with SQLite...")
    
    # Use in-memory SQLite database for testing
    engine = create_engine("sqlite:///:memory:", future=True)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Create a dummy patient user
        user = User(email="testpatient@mediq.com", hashed_password="hashed_password", role=UserRole.PATIENT)
        db.add(user)
        db.commit()
        
        patient = Patient(full_name="Test Patient", user_id=user.id)
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
        print(f"Created patient: ID={patient.id}, Name={patient.full_name}")
        
        # 2. Update patient profile (Medical History)
        update_data = {
            "blood_group": "O+ Positive",
            "last_visit": "Oct 24, 2023",
            "conditions": "Diabetes,Hypertension",
            "allergies": "Penicillin",
            "emergency_contact_name": "Emergency Contact Name",
            "emergency_contact_phone": "+1555123456"
        }
        
        for field, value in update_data.items():
            setattr(patient, field, value)
        db.commit()
        db.refresh(patient)
        
        print("\nUpdated Patient Profile:")
        print(f"  Blood Group: {patient.blood_group}")
        print(f"  Last Visit: {patient.last_visit}")
        print(f"  Conditions: {patient.conditions}")
        print(f"  Allergies: {patient.allergies}")
        print(f"  Emergency Contact: {patient.emergency_contact_name} ({patient.emergency_contact_phone})")
        
        # 3. Create a prescription
        medicines = [
            {
                "name": "Atorvastatin 20mg",
                "instruction": "Take after dinner",
                "frequency": "1x Daily",
                "duration": "30 Days",
                "activeTime": "night",
                "dosage": "20 mg",
                "instructionText": "Take one capsule by mouth every night before bed.",
                "remaining": "30 Pills"
            }
        ]
        
        prescription = Prescription(
            patient_id=patient.id,
            doctor_name="Dr. Sarah Jenkins",
            specialty="Consultant Cardiologist",
            hospital="City General Hospital",
            date="Oct 24, 2023",
            image_url=None,
            medicines_json=json.dumps(medicines)
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        
        print("\nCreated Prescription:")
        print(f"  ID: {prescription.id}")
        print(f"  Doctor: {prescription.doctor_name}")
        print(f"  Hospital: {prescription.hospital}")
        print(f"  Meds: {prescription.medicines_json}")
        
        # 4. Create a Lab Test
        lab_test = LabTest(
            patient_id=patient.id,
            test_name="Complete Blood Count (CBC)",
            lab_name="City Diagnostic Center",
            order_date="Oct 24, 2023",
            status="PENDING"
        )
        db.add(lab_test)
        db.commit()
        db.refresh(lab_test)
        
        print("\nCreated Lab Test:")
        print(f"  ID: {lab_test.id}")
        print(f"  Test Name: {lab_test.test_name}")
        print(f"  Status: {lab_test.status}")
        
        # 5. Retrieve patient associations
        print("\nRetrieving Patient Associations:")
        print(f"  Total prescriptions: {len(patient.prescriptions)}")
        print(f"  Total lab tests: {len(patient.lab_tests)}")
        
        assert len(patient.prescriptions) == 1
        assert len(patient.lab_tests) == 1
        assert patient.blood_group == "O+ Positive"
        
        print("\nAll database schema tests PASSED successfully!")
        
    except Exception as e:
        print("\nTest failed with error:", e)
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
