import sys
import os

backend_dir = r"d:\projects\salon customer system\backend"
sys.path.insert(0, backend_dir)

try:
    from app.routes import auth
    print("Import successful")
except ImportError as e:
    print(f"Import failed: {e}")
    print(f"sys.path: {sys.path}")
