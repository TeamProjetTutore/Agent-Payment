import requests

BASE_URL = "http://localhost:8000"

def get_token():
    # Attempt to login to get a token, but this requires a user.
    # We'll assume there's an admin user with admin/admin or similar.
    # If not, this test might need adjustment.
    res = requests.post(f"{BASE_URL}/login", data={"username": "admin", "password": "admin"})
    if res.status_code == 200:
        return res.json().get("access_token")
    return None

def test_delete_agent():
    token = get_token()
    if not token:
        print("❌ Could not get token, skipping test.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create an agent
    agent_data = {"name": "Test Delete", "role": "Tester", "salary": 1000}
    res = requests.post(f"{BASE_URL}/agents/", json=agent_data, headers=headers)
    if res.status_code != 200:
        print(f"❌ Failed to create agent: {res.text}")
        return
    
    agent_id = res.json()["id"]
    print(f"✅ Created agent with ID: {agent_id}")

    # 2. Delete the agent
    res = requests.delete(f"{BASE_URL}/agents/{agent_id}", headers=headers)
    if res.status_code == 200:
        print(f"✅ Deleted agent with ID: {agent_id}")
    else:
        print(f"❌ Failed to delete agent: {res.text}")
        return

    # 3. Verify the agent is gone
    res = requests.get(f"{BASE_URL}/agents/", headers=headers)
    agents = res.json()
    if any(a["id"] == agent_id for a in agents):
        print(f"❌ Agent with ID {agent_id} still exists!")
    else:
        print(f"✅ Agent with ID {agent_id} is verified as deleted.")

if __name__ == "__main__":
    test_delete_agent()
