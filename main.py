
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from models import (
    RegisterWithEmailRequest,
    LoginWithEmailRequest,
    LoginWithNicknameRequest,
    AuthResponse,
    UserProfile,
    UpdateUserProfileRequest,
    UserStats,
    MatchCreateRequest,
    Match,
    MatchStats,
)
from auth_service import (
    register_with_email,
    login_with_email,
    login_with_nickname,
)
from user_service import (
    get_user_profile,
    update_user_profile,
    get_user_stats,
)
from match_service import (
    create_match,
    get_match,
    get_match_stats,
    update_match_score_and_status,
)

app = FastAPI(title="PenaltyHub Backend")

# Configura CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- AUTH ROUTES ---------
@app.post("/auth/register", response_model=AuthResponse)
def register_user(data: RegisterWithEmailRequest):
    try:
        return register_with_email(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login/email", response_model=AuthResponse)
def login_user_email(data: LoginWithEmailRequest):
    try:
        return login_with_email(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login/nickname", response_model=AuthResponse)
def login_user_nickname(data: LoginWithNicknameRequest):
    res = login_with_nickname(data)
    if not res:
        raise HTTPException(status_code=404, detail="Nickname+tag non trovati")
    return res

# --------- USER ROUTES ---------
@app.get("/users/{uid}", response_model=UserProfile)
def api_get_user_profile(uid: str):
    profile = get_user_profile(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    return profile

@app.patch("/users/{uid}", response_model=UserProfile)
def api_update_user_profile(uid: str, payload: UpdateUserProfileRequest):
    profile = update_user_profile(uid, payload)
    if not profile:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    return profile

@app.get("/users/{uid}/stats", response_model=UserStats)
def api_get_user_stats(uid: str):
    stats = get_user_stats(uid)
    if not stats:
        raise HTTPException(status_code=404, detail="Statistiche non trovate")
    return stats

# --------- MATCH ROUTES ---------
@app.post("/matches", response_model=Match)
def api_create_match(payload: MatchCreateRequest):
    return create_match(payload)

@app.get("/matches/{match_id}", response_model=Match)
def api_get_match(match_id: str):
    match = get_match(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Partita non trovata")
    return match

@app.get("/matches/{match_id}/stats", response_model=MatchStats)
def api_get_match_stats(match_id: str):
    stats = get_match_stats(match_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Statistiche partita non trovate")
    return stats

@app.put("/matches/{match_id}/score", response_model=Match)
def api_update_match_score(
    match_id: str,
    home_score: int,
    away_score: int,
    status: Optional[str] = None,
):
    match = update_match_score_and_status(
        match_id=match_id,
        home_score=home_score,
        away_score=away_score,
        status=status,
    )
    if not match:
        raise HTTPException(status_code=404, detail="Partita non trovata")
    return match
