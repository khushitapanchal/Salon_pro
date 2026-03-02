import time
import sys

def test_lib(lib_name):
    try:
        start = time.time()
        print(f"Importing {lib_name}...", end="", flush=True)
        __import__(lib_name)
        print(f" SUCCESS ({time.time() - start:.2f}s)")
    except Exception as e:
        print(f" FAILED: {lib_name} - {e}")

libs = ["psycopg2", "fastapi", "bcrypt", "jose", "sqlalchemy"]
for lib in libs:
    test_lib(lib)
