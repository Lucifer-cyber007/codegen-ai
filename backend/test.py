import requests
import json

# Test storing a solution
response = requests.post(
    "http://localhost:8000/api/code/store_solution",
    json={
        "problem_id": "test_001",
        "prompt": "Write a hello world function",
        "code": "def hello():\n    print('Hello World!')",
        "status": "passed",
        "fix_method": "manual"
    }
)

print("Response:", response.json())