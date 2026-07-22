import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.core.config import get_settings
from backend.core.database import SessionLocal
from backend.models.user import User
from backend.models.patient import Patient

def main():
    settings = get_settings()
    print("Database URL:", settings.database_url)
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"  ID: {u.id}, Email: {u.email}, Role: {u.role}")
            
        patients = db.query(Patient).all()
        print(f"\nTotal patients: {len(patients)}")
        for p in patients:
            print(f"  ID: {p.id}, Name: {p.full_name}, Phone: {p.phone or 'N/A'}, DOB: {p.date_of_birth or 'N/A'}")
            
    except Exception as e:
        print("Error connecting/querying database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    main()

