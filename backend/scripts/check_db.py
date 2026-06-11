import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.core.config import get_settings
from backend.core.database import SessionLocal
from backend.models.user import User

def main():
    settings = get_settings()
    print("Database URL:", settings.database_url)
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
    except Exception as e:
        print("Error connecting/querying database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    main()
