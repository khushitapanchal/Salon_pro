import sys
import os
import time

# Add current dir to path
sys.path.append(os.getcwd())

print("Testing route imports one by one...")

routes = ["auth", "customers", "services", "appointments", "dashboard", "users"]
for r in routes:
    try:
        start = time.time()
        print(f"Importing app.routes.{r}...", end="", flush=True)
        mod = __import__(f"app.routes.{r}", fromlist=["router"])
        print(f" SUCCESS ({time.time() - start:.2f}s)")
    except Exception as e:
        print(f" FAILED: {e}")
