
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# --------- AUTH ---------
class RegisterWithEmailRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    nickname: str
    tag: Optional[str] = None  # se non lo passi, lo generiamo noi

class LoginWithEmailRequest(BaseModel):
    email: EmailStr
    password: str

class LoginWithNicknameRequest(BaseModel):
    nickname: str
    tag: str

class AuthResponse(BaseModel):
    uid: str
    email: Optional[EmailStr]
    nickname: str
    tag: str
    id_token: Optional[str] = None

# --------- USER ---------
class UserProfile(BaseModel):
    uid: str
    nickname: str
    tag: str
    email: Optional[EmailStr]
    avatar_url: Optional[str] = None
    favorite_team: Optional[str] = None
    status: str = "active"
    created_at: datetime
    updated_at: datetime

class UpdateUserProfileRequest(BaseModel):
    avatar_url: Optional[str] = None
    favorite_team: Optional[str] = None
    status: Optional[str] = None

# --------- USER STATS ---------
class UserStats(BaseModel):
    uid: str
    total_matches: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    goals_scored: int = 0
    goals_conceded: int = 0
    last_match_at: Optional[datetime] = None

# --------- MATCH & STATS ---------
class MatchCreateRequest(BaseModel):
    home_team: str
    away_team: str
    start_time: Optional[datetime] = None
    players: List[str] = []  # lista di uid

class Match(BaseModel):
    match_id: str
    home_team: str
    away_team: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    status: str
    home_score: int
    away_score: int
    players: List[str]
    created_at: datetime
    updated_at: datetime

class MatchStats(BaseModel):
    match_id: str
    events: List[Dict[str, Any]] = []
    possession_home: Optional[float] = None
    possession_away: Optional[float] = None
    shots_home: Optional[int] = None
    shots_away: Optional[int] = None
    corners_home: Optional[int] = None
    corners_away: Optional[int] = None
