from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
from pathlib import Path

from models import (
    RegisterWithEmailRequest,
    RegisterWithNicknameRequest,
    LoginWithEmailRequest,
    LoginWithNicknameRequest,
    UserResponse,
    UpdateUserRequest,
    MatchCreateRequest,
    MatchResponse,
)

from auth_service import (
    register_with_email,  # <--- CAMBIATO
    register_with_nickname,  # <--- CAMBIATO
    login_with_email,
    login_with_nickname,
)

from user_service import (
    get_user_by_uid,
    update_user_profile,
    get_user_stats,
)

from match_service import (
    create_match,
    get_match_by_id,
    get_matches_by_status,
)

# ====
# Inizializzazione FastAPI
# ====

app = FastAPI(
    title="PenaltyHub API",
    description="Backend per l'app di scommesse e calcio",
    version="1.0.0"
)

# ====
# CORS Middleware - Permette al frontend di chiamare il backend
# ====

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permette tutte le origini (per sviluppo/test)
    allow_credentials=True,
    allow_methods=["*"],  # Permette tutti i metodi HTTP (GET, POST, PUT, DELETE, ecc.)
    allow_headers=["*"],  # Permette tutti gli header
)

# ====
# API Status endpoint (spostato da "/" a "/api")
# ====

@app.get("/api")
def api_status():
    return {
        "message": "PenaltyHub API is running!",
        "docs": "/docs",
        "version": "1.0.0"
    }

# ====
# AUTH ENDPOINTS
# ====

@app.post("/auth/register/email", response_model=UserResponse)
async def register_email(req: RegisterWithEmailRequest):
    """
    Registrazione con email + password.
    Genera automaticamente nickname#tag se non forniti.
    """
    try:
        user_data = register_with_email(req)  # <--- CAMBIATO
        return user_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/register/nickname", response_model=UserResponse)
async def register_nickname(req: RegisterWithNicknameRequest):
    """
    Registrazione con nickname#tag + password (senza email).
    """
    try:
        user_data = register_with_nickname(req)  # <--- CAMBIATO
        return user_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/login/email", response_model=UserResponse)
async def login_email(req: LoginWithEmailRequest):
    """
    Login con email + password.
    """
    try:
        user_data = login_with_email(req)  # <--- CAMBIATO
        return user_data
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/auth/login/nickname", response_model=UserResponse)
async def login_nickname(req: LoginWithNicknameRequest):
    """
    Login con nickname#tag + password.
    """
    try:
        user_data = login_with_nickname(req)  # <--- CAMBIATO
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return user_data
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# ====
# USER ENDPOINTS
# ====

@app.get("/users/{uid}", response_model=UserResponse)
async def get_user(uid: str):
    """
    Ottieni i dati di un utente tramite UID.
    """
    try:
        user_data = get_user_by_uid(uid)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        return user_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/users/{uid}", response_model=UserResponse)
async def update_user(uid: str, req: UpdateUserRequest):
    """
    Aggiorna il profilo di un utente.
    """
    try:
        updated_user = update_user_profile(uid, req.dict(exclude_unset=True))
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/{uid}/stats")
async def get_stats(uid: str):
    """
    Ottieni le statistiche di un utente.
    """
    try:
        stats = get_user_stats(uid)
        if not stats:
            raise HTTPException(status_code=404, detail="Stats not found")
        return stats
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ====
# MATCH ENDPOINTS
# ====

@app.post("/matches", response_model=MatchResponse)
async def create_new_match(req: MatchCreateRequest):
    """
    Crea una nuova partita.
    """
    try:
        match_data = create_match(
            home_team=req.home_team,
            away_team=req.away_team,
            start_time=req.start_time,
            league=req.league
        )
        return match_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/matches/{match_id}", response_model=MatchResponse)
async def get_match(match_id: str):
    """
    Ottieni i dettagli di una partita tramite ID.
    """
    try:
        match_data = get_match_by_id(match_id)
        if not match_data:
            raise HTTPException(status_code=404, detail="Match not found")
        return match_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/matches")
async def list_matches(status: Optional[str] = None):
    """
    Lista tutte le partite, opzionalmente filtrate per status.
    Status possibili: scheduled, live, finished
    """
    try:
        matches = get_matches_by_status(status)
        return {"matches": matches}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ====
# Health Check
# ====

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is healthy"}


# ====
# Serve Frontend Static Files
# ====

dist_path = Path(__file__).parent / "dist"

if dist_path.exists() and (dist_path / "index.html").exists():

    app.mount("/assets", StaticFiles(directory=str(dist_path / "assets"), html=True), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):

        if full_path in ["health", "api", "docs", "openapi.json", "redoc"]:
            raise HTTPException(status_code=404)

        if full_path.startswith("auth") or full_path.startswith("users") or full_path.startswith("matches"):
            raise HTTPException(status_code=404)

        file_path = dist_path / full_path
        if file_path.is_file():
            return FileResponse(file_path)

        return FileResponse(dist_path / "index.html")
else:

    @app.get("/")
    def frontend_not_built():
        return {
            "error": "Frontend not built",
            "message": "The dist folder does not exist. Run 'npm run build' to build the frontend.",
            "dist_path": str(dist_path),
            "exists": dist_path.exists()
        }