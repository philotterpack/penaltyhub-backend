from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ====
# AUTH MODELS
# ====

class RegisterWithEmailRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    nickname: Optional[str] = None
    tag: Optional[str] = None

class RegisterWithNicknameRequest(BaseModel):
    nickname: str = Field(..., min_length=3, max_length=20)
    tag: str = Field(..., min_length=4, max_length=4)
    password: str = Field(..., min_length=6)

class LoginWithEmailRequest(BaseModel):
    email: EmailStr
    password: str

class LoginWithNicknameRequest(BaseModel):
    nickname: str
    tag: str
    password: str

class UserResponse(BaseModel):
    uid: str
    email: Optional[str] = None
    nickname: str
    tag: str
    status: str = "active"
    created_at: str

# ====
# USER MODELS
# ====

class UpdateUserRequest(BaseModel):
    nickname: Optional[str] = None
    tag: Optional[str] = None
    status: Optional[str] = None

class UserStats(BaseModel):
    uid: str
    total_matches: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    goals_scored: int = 0
    goals_conceded: int = 0
    clean_sheets: int = 0
    last_match_at: Optional[datetime] = None

# ====
# MATCH MODELS
# ====

class MatchCreateRequest(BaseModel):
    home_team: str
    away_team: str
    start_time: str  # ISO 8601 format
    league: Optional[str] = None
    players: Optional[List[str]] = None

class MatchResponse(BaseModel):
    match_id: str
    home_team: str
    away_team: str
    start_time: str
    status: str  # scheduled, live, finished
    home_score: int = 0
    away_score: int = 0
    league: Optional[str] = None
    created_at: str

class Match(BaseModel):
    match_id: str
    home_team: str
    away_team: str
    start_time: str
    end_time: Optional[str] = None
    status: str  # scheduled, live, finished
    home_score: int = 0
    away_score: int = 0
    players: Optional[List[str]] = None
    created_at: str
    updated_at: str

class MatchStats(BaseModel):
    match_id: str
    events: List[Dict[str, Any]] = []
    possession_home: Optional[float] = None
    possession_away: Optional[float] = None
    shots_home: Optional[int] = None
    shots_away: Optional[int] = None
    corners_home: Optional[int] = None
    corners_away: Optional[int] = None

# ====
# BET MODELS (opzionale, per future implementazioni)
# ====

class BetCreateRequest(BaseModel):
    match_id: str
    uid: str
    bet_type: str  # es. "1X2", "over_under", "both_teams_score"
    prediction: str
    stake: float

class BetResponse(BaseModel):
    bet_id: str
    match_id: str
    uid: str
    bet_type: str
    prediction: str
    stake: float
    status: str  # pending, won, lost
    created_at: str