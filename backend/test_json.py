import json
from app.main import app
try:
    schema = app.openapi()
    print("Schema generated")
    json.dumps(schema)
    print("Schema serializable!")
except Exception as e:
    import traceback
    with open("json_err.txt", "w") as f:
        f.write(traceback.format_exc())
    print("Failed")
