"""
Pytest configuration and client fixtures for MediQ API Testing.
"""
import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Set environment to test
os.environ["ENVIRONMENT"] = "test"
# Force database URL to a test sqlite file
TEST_DB_URL = "sqlite:///./test_api.db"
os.environ["DATABASE_URL"] = TEST_DB_URL

from backend.main import app
from backend.core.database import Base, get_db
from backend.models import User, UserRole, Doctor
from backend.core.security import hash_password

# Setup test DB engine
engine_test = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
SessionTesting = sessionmaker(bind=engine_test, autocommit=False, autoflush=False)

def override_get_db():
    db = SessionTesting()
    try:
        yield db
    finally:
        db.close()

# Apply dependency override
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create database tables and seed test data."""
    # Ensure starting clean
    if os.path.exists("./test_api.db"):
        try:
            os.remove("./test_api.db")
        except Exception:
            pass
            
    Base.metadata.create_all(bind=engine_test)
    
    # Seed doctors
    db = SessionTesting()
    try:
        seed_data = [
            ("dr.test_thorne@mediq.com", "Dr. Julian Thorne Test", "Senior Cardiologist", "Saint Mary's Hospital"),
            ("dr.test_chen@mediq.com", "Dr. Michael Chen Test", "Pediatric Specialist", "North Plaza Wing")
        ]
        for email, name, specialty, loc in seed_data:
            user = User(email=email, hashed_password=hash_password("password123"), role=UserRole.DOCTOR)
            db.add(user)
            db.flush()
            doc = Doctor(user_id=user.id, full_name=name, specialty=specialty, location=loc)
            db.add(doc)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
        
    yield
    
    # Cleanup after test session
    if os.path.exists("./test_api.db"):
        try:
            os.remove("./test_api.db")
        except Exception:
            pass

@pytest.fixture(scope="module")
def client():
    """Expose FastAPI TestClient."""
    with TestClient(app) as c:
        yield c
