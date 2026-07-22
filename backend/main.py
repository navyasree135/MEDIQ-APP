from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import get_settings
from backend.core.logger import configure_logging, get_logger
from backend.core.database import Base, engine
from backend.llm.provider_factory import build_llm_provider
from backend.routers.health import router as health_router
from backend.routers.auth import router as auth_router
from backend.routers.patients import router as patients_router
from backend.routers.triage import router as triage_router
from backend.routers.doctors import router as doctors_router
from backend.routers.insurance import router as insurance_router
from backend.routers.appointments import router as appointments_router
from backend.routers.chat import router as chat_router
from backend.routers.agents import router as agents_router
from backend.routers.prescriptions import router as prescriptions_router
from backend.routers.lab_tests import router as lab_tests_router

settings = get_settings()
configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application", extra={"env": settings.environment})
    Base.metadata.create_all(engine)
    
    # Auto-seed doctors
    from sqlalchemy.orm import Session
    from backend.core.security import hash_password
    from backend.models import User, UserRole, Doctor
    with Session(engine) as db:
        try:
            if db.query(Doctor).count() == 0:
                logger.info("Seeding initial doctors...")
                seed_data = [
                    ("dr.thorne@mediq.com", "Dr. Julian Thorne", "Senior Cardiologist", "Saint Mary's General Hospital, London"),
                    ("dr.jenkins@mediq.com", "Dr. Sarah Jenkins", "Senior Cardiologist", "Central Medical Center, London"),
                    ("dr.chen@mediq.com", "Dr. Michael Chen", "Pediatric Specialist", "North Wing Plaza, London"),
                ]
                for email, name, specialty, loc in seed_data:
                    user = User(email=email, hashed_password=hash_password("password123"), role=UserRole.DOCTOR)
                    db.add(user)
                    db.flush()
                    doc = Doctor(user_id=user.id, full_name=name, specialty=specialty, location=loc)
                    db.add(doc)
                db.commit()
                logger.info("Doctor seeding complete.")
            
            from sqlalchemy import text
            db.execute(text("DELETE FROM prescriptions"))
            db.execute(text("DELETE FROM lab_tests"))
            db.commit()
            logger.info("Cleared old dummy prescriptions and lab tests from database.")
        except Exception as e:
            logger.error(f"Error seeding doctors or cleaning dummy data: {e}")
            db.rollback()

    try:
        app.state.llm_provider = build_llm_provider(settings)
    except Exception as e:
        logger.warning(f"LLM provider initialization failed, disabling AI features: {e}")
        app.state.llm_provider = None
    yield
    logger.info("Shutting down application")


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(triage_router)
app.include_router(doctors_router)
app.include_router(insurance_router)
app.include_router(appointments_router)
app.include_router(chat_router)
app.include_router(agents_router)
app.include_router(prescriptions_router)
app.include_router(lab_tests_router)


@app.get("/", summary="Root")
def root() -> dict[str, str]:
    return {"message": "Autonomous Medical Triage Orchestrator backend"}
