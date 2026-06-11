import httpx

def main():
    payload = {
        "email": "testpatient@example.com",
        "password": "password123",
        "full_name": "Test Patient",
        "role": "patient"
    }
    try:
        response = httpx.post("http://127.0.0.1:8000/auth/signup", json=payload)
        print("Status code:", response.status_code)
        print("Response text:", response.text)
    except Exception as e:
        print("Error calling signup endpoint:", e)

if __name__ == "__main__":
    main()
