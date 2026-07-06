"""
MediQ Backend API Router Tests
==============================
Contains integration tests for the FastAPI backend endpoints using FastAPI TestClient.
"""
import pytest

class TestMediQBackendAPI:
    """API Integration tests for the MediQ FastAPI backend."""
    
    # Store token and data across tests in this module
    patient_token = None
    patient_email = "api_patient_test@mediq.com"
    patient_password = "SecurePassword123!"
    
    def test_api_health_check(self, client):
        """TC-001: Verify that the API health check endpoint returns 200 OK."""
        response = client.get("/health")
        # In case the health route has a specific endpoint, or check root "/"
        if response.status_code != 200:
            response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json() or "status" in response.json()

    def test_patient_registration_success(self, client):
        """TC-002: Verify that a patient can register successfully."""
        signup_payload = {
            "email": self.patient_email,
            "password": self.patient_password,
            "full_name": "API Patient Test",
            "role": "patient"
        }
        response = client.post("/auth/signup", json=signup_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == self.patient_email
        assert data["role"] == "patient"
        assert "id" in data

    def test_registration_duplicate_email_fails(self, client):
        """TC-003: Verify duplicate registration attempts are blocked."""
        signup_payload = {
            "email": self.patient_email,
            "password": self.patient_password,
            "full_name": "API Patient Test Duplicate",
            "role": "patient"
        }
        response = client.post("/auth/signup", json=signup_payload)
        # Should return 400 Bad Request or similar error
        assert response.status_code >= 400

    def test_login_success_generates_token(self, client):
        """TC-004: Verify valid credentials return a JWT access token."""
        login_data = {
            "username": self.patient_email,
            "password": self.patient_password
        }
        response = client.post(
            "/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        TestMediQBackendAPI.patient_token = data["access_token"]

    def test_login_invalid_password_fails(self, client):
        """TC-005: Verify invalid login password attempts are rejected."""
        login_data = {
            "username": self.patient_email,
            "password": "WrongPassword!"
        }
        response = client.post(
            "/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 401 # Unauthorized

    def test_verify_auth_token(self, client):
        """TC-006: Verify that the JWT verify route validates the logged-in user."""
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = client.get("/auth/verify", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == self.patient_email

    def test_get_doctors_directory(self, client):
        """TC-007: Verify fetching list of seeded doctor profiles."""
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = client.get("/doctors", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        assert any(doc["full_name"] == "Dr. Julian Thorne Test" for doc in data)

    def test_analyze_symptoms_routine(self, client):
        """TC-008: Verify that symptoms triage analysis operates correctly."""
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        payload = {"symptoms": "Mild cough and slight runny nose for one day"}
        response = client.post("/triage/analyze", json=payload, headers=headers)
        
        # Test may return routine, or if LLM config is unavailable it will fall back gracefully
        assert response.status_code == 200
        data = response.json()
        assert "urgency" in data
        assert "rationale" in data

    def test_book_appointment_slot(self, client):
        """TC-009: Verify booking an appointment slot successfully."""
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        
        # Fetch doctors to get id
        doctors_resp = client.get("/doctors", headers=headers)
        doc_id = doctors_resp.json()[0]["id"]
        
        booking_payload = {
            "doctor_id": doc_id,
            "date": "2026-08-15",
            "time_slot": "10:00 AM - 10:30 AM"
        }
        
        response = client.post("/appointments/book", json=booking_payload, headers=headers)
        # Verify result status
        assert response.status_code in (200, 201)
        data = response.json()
        assert data["doctor_id"] == doc_id
        assert data["time_slot"] == "10:00 AM - 10:30 AM"

    def test_fetch_appointments_schedule(self, client):
        """TC-010: Verify retrieving patient's scheduled appointments list."""
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = client.get("/appointments/my-schedule", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
