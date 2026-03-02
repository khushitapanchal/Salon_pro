from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import time

print("STEP 1: Creating Engine...")
start = time.time()
engine = create_engine("sqlite:///:memory:")
print(f"DONE ({(time.time()-start):.2f}s)")

print("STEP 2: Creating Base...")
start = time.time()
Base = declarative_base()
print(f"DONE ({(time.time()-start):.2f}s)")

print("STEP 3: Creating SessionLocal...")
start = time.time()
SessionLocal = sessionmaker(bind=engine)
print(f"DONE ({(time.time()-start):.2f}s)")

print("ALL STEPS COMPLETED SUCCESSFULLY")
