"""
MediQ API Load Testing Script (Locust)
=====================================
Simulates concurrent user requests against the FastAPI backend endpoints
to monitor performance under concurrent load.
"""
# pyrefly: ignore [missing-import]
from locust import HttpUser, task, between

class MediQLoadTestUser(HttpUser):
    """Simulates a patient client calling the backend API."""
    
    # Wait between 1 and 3 seconds between tasks
    wait_time = between(1.0, 3.0)
    
    token = None
    headers = {}
    
    def on_start(self):
        """Called when a virtual user starts; authenticates and caches the JWT token."""
        # Create a test account or try logging in with seeded test account
        self.login()

    def login(self):
        """Helper to login user and extract token."""
        payload = {
            "username": "dr.thorne@mediq.com", # Default seeded doctor for testing
            "password": "password123"
        }
        try:
            response = self.client.post(
                "/auth/login",
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=5
            )
            if response.status_code == 200:
                self.token = response.json().get("access_token")
                self.headers = {"Authorization": f"Bearer {self.token}"}
        except Exception:
            pass # Fall back to unauthenticated health requests if backend is unreachable

    @task(3)
    def test_health_check(self):
        """Simulate pinging the health check endpoint."""
        self.client.get("/health", timeout=5)

    @task(2)
    def test_list_doctors(self):
        """Simulate checking the doctor directory."""
        if self.token:
            self.client.get("/doctors", headers=self.headers, timeout=5)
        else:
            self.client.get("/", timeout=5)

    @task(1)
    def test_triage_analysis(self):
        """Simulate sending a triage symptom query."""
        if self.token:
            payload = {"symptoms": "I have minor body pain and fatigue."}
            self.client.post("/triage/analyze", json=payload, headers=self.headers, timeout=5)
        else:
            self.client.get("/", timeout=5)
