
from datetime import datetime
from typing import Optional, List, Dict, Any
from config import db
from models import MatchCreateRequest, Match, MatchStats

def create_match(payload: MatchCreateRequest) -> Match:
    now = datetime.utcnow()
    doc_ref = db.collection("matches").document()
    match_id = doc_ref.id
    match_data = {
        "match_id": match_id,
        "home_team": payload.home_team,
        "away_team": payload.away_team,
        "start_time": payload.start_time,
        "end_time": None,
        "status": "scheduled",
        "home_score": 0,
        "away_score": 0,
        "players": payload.players,
        "created_at": now,
        "updated_at": now,
    }
    doc_ref.set(match_data)
    stats_data = {
        "match_id": match_id,
        "events": [],
        "possession_home": None,
        "possession_away": None,
        "shots_home": None,
        "shots_away": None,
        "corners_home": None,
        "corners_away": None,
    }
    db.collection("match_stats").document(match_id).set(stats_data)
    return Match(**match_data)

def get_match(match_id: str) -> Optional[Match]:
    doc = db.collection("matches").document(match_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    return Match(**data)

def update_match_score_and_status(
    match_id: str,
    home_score: int,
    away_score: int,
    status: Optional[str] = None,
    end_time: Optional[datetime] = None,
) -> Optional[Match]:
    doc_ref = db.collection("matches").document(match_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    updates = {
        "home_score": home_score,
        "away_score": away_score,
        "updated_at": datetime.utcnow(),
    }
    if status:
        updates["status"] = status
    if end_time:
        updates["end_time"] = end_time
    doc_ref.update(updates)
    return get_match(match_id)

def get_match_stats(match_id: str) -> Optional[MatchStats]:
    doc = db.collection("match_stats").document(match_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    return MatchStats(**data)
