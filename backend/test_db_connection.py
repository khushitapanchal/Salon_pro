from sqlalchemy import create_engine
import sqlalchemy
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Test connecting to 'postgres' database which always exists
DB_NAME = "postgres" # or "salon_db"
DATABASE_URL = "postgresql://postgres:Khushita%40123@127.0.0.1:5432/" + DB_NAME

print(f"Testing connection to: {DATABASE_URL}")
try:
    engine = create_engine(DATABASE_URL, connect_args={'connect_timeout': 5})
    with engine.connect() as conn:
        print(f"Successfully connected to the {DB_NAME} database!")
        result = conn.execute(sqlalchemy.text("SELECT 1"))
        print(f"Query test result: {result.scalar()}")
        
        # Now let's try to see if 'salon_db' exists
        print("Checking if 'salon_db' exists...")
        result = conn.execute(sqlalchemy.text("SELECT 1 FROM pg_database WHERE datname='salon_db'"))
        if result.first():
            print("'salon_db' exists.")
        else:
            print("'salon_db' DOES NOT exist. Creating it...")
            # We need to use autocommit to create a DB
            conn.execute(sqlalchemy.text("COMMIT"))
            conn.execute(sqlalchemy.text("CREATE DATABASE salon_db"))
            print("'salon_db' created successfully.")
            
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
