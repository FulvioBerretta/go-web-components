import os

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from passlib.context import CryptContext
from tinydb import TinyDB, Query

# Create the 'db' directory if it doesn't exist
os.makedirs("db", exist_ok=True)

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# TinyDB setup
db = TinyDB('db/users.json')
User = Query()

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Helper Functions ---
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# --- Routes ---

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/register", response_class=HTMLResponse)
async def register_user(request: Request, username: str = Form(...), password: str = Form(...)):
    if db.search(User.username == username):
        return templates.TemplateResponse("register.html", {"request": request, "error": "Username already exists"})

    hashed_pass = hash_password(password)
    db.insert({"username": username, "hashed_password": hashed_pass})
    return templates.TemplateResponse("success.html", {"request": request, "message": "Registration successful! You can now log in."})

@app.get("/login", response_class=HTMLResponse)
async def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login", response_class=HTMLResponse)
async def login_user(request: Request, username: str = Form(...), password: str = Form(...)):
    user = db.search(User.username == username)
    if not user:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid username or password"})

    user_data = user[0]
    if not verify_password(password, user_data["hashed_password"]):
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid username or password"})

    # For now, a simple success page. We'll add sessions later.
    return templates.TemplateResponse("success.html", {"request": request, "message": f"Welcome, {username}! You are logged in."})
