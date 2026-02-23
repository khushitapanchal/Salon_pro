import traceback
try:
    from app.main import app
    app.openapi()
    print("SUCCESS")
except Exception:
    with open("err.txt", "w", encoding="utf-8") as f:
        f.write(traceback.format_exc())
    print("FAILED")
