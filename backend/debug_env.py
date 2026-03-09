import os
from dotenv import load_dotenv

load_dotenv(".env")
print(f"Loaded DATABASE_URL: {os.getenv('DATABASE_URL')}")
