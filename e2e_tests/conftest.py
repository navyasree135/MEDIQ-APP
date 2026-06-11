"""
Shared fixtures and configuration for MediQ E2E Selenium tests.
"""
import pytest
import time
import requests
# pyrefly: ignore [missing-import]
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:8081"
API_URL = "http://localhost:8000"

# ---------- Test credentials ----------
PATIENT_EMAIL = "e2e_patient@mediq.com"
PATIENT_PASSWORD = "TestPass123!"
PATIENT_NAME = "E2E Patient"
PATIENT_PHONE = "+1234567890"

DOCTOR_EMAIL = "dr.thorne@mediq.com"
DOCTOR_PASSWORD = "password123"

SECOND_PATIENT_EMAIL = "e2e_patient2@mediq.com"
SECOND_PATIENT_PASSWORD = "TestPass456!"
SECOND_PATIENT_NAME = "E2E Patient Two"


@pytest.fixture(scope="session")
def driver():
    """Create a Selenium WebDriver instance for the entire test session."""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1440,900")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--ignore-certificate-errors")

    service = Service(ChromeDriverManager().install())
    browser = webdriver.Chrome(service=service, options=chrome_options)
    browser.implicitly_wait(8)

    yield browser

    browser.quit()


@pytest.fixture(scope="session")
def api_session():
    """Provide a requests.Session pointed at the backend API."""
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


def ensure_patient_exists(api_session):
    """Create the E2E patient user via the API if it doesn't already exist."""
    try:
        api_session.post(
            f"{API_URL}/auth/signup",
            json={
                "full_name": PATIENT_NAME,
                "email": PATIENT_EMAIL,
                "password": PATIENT_PASSWORD,
                "role": "patient",
            },
        )
    except Exception:
        pass  # user may already exist


def get_patient_token(api_session):
    """Login as the E2E patient and return the access token."""
    resp = api_session.post(
        f"{API_URL}/auth/login",
        data={"username": PATIENT_EMAIL, "password": PATIENT_PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if resp.status_code == 200:
        return resp.json().get("access_token")
    return None


def get_doctor_token(api_session):
    """Login as the seeded doctor and return the access token."""
    resp = api_session.post(
        f"{API_URL}/auth/login",
        data={"username": DOCTOR_EMAIL, "password": DOCTOR_PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if resp.status_code == 200:
        return resp.json().get("access_token")
    return None


def wait_short():
    time.sleep(0.5)


def wait_medium():
    time.sleep(1.5)


def wait_long():
    time.sleep(3)
