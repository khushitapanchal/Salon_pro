import requests

def test_users_api():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Login
    print("Logging in...")
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"
    }
    response = requests.post(f"{base_url}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        return
    
    token = response.json()["access_token"]
    print(f"Login successful. Token: {token[:20]}...")
    
    # 2. Get me
    print("\nFetching /auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{base_url}/auth/me", headers=headers)
    print(f"Me: {response.json()}")
    
    # 3. Get users
    print("\nFetching /users...")
    response = requests.get(f"{base_url}/users", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        users = response.json()
        print(f"Found {len(users)} users:")
        for u in users:
            print(f" - {u['name']} ({u['email']}) Role: {u['role']}")
    else:
        print(f"Failed: {response.text}")

if __name__ == "__main__":
    test_users_api()
