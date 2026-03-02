from fastapi import FastAPI
from app import database
app = FastAPI()
@app.get("/")
def read_root(): return {"Hello": "World", "DB": "Imported"}
