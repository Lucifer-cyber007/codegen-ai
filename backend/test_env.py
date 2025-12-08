import os
from dotenv import load_dotenv

load_dotenv()

print("Testing .env file...")
print(f"MONGODB_URL exists: {bool(os.getenv('MONGODB_URL'))}")
print(f"DATABASE_NAME: {os.getenv('DATABASE_NAME')}")
print(f"First 30 chars of URL: {os.getenv('MONGODB_URL', '')[:30]}")