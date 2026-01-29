from datetime import datetime
from typing import Optional
from config import db
from models import UpdateUserRequest, UserStats  # <-- Import corretti

def get_user_profile(uid: str) -> Optional[dict]:  # <-- Restituisce dict
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return None
    return doc.to_dict()

def update_user_profile(uid: str, payload: UpdateUserRequest) -> Optional[dict]:
    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        return get_user_profile(uid)
    updates["updated_at"] = datetime.utcnow().isoformat()
    doc_ref.update(updates)
    return get_user_profile(uid)

def get_user_stats(uid: str) -> Optional[UserStats]:
    doc = db.collection("user_stats").document(uid).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    return UserStats(**data)

def increment_user_stats_after_match(
    uid: str,
    goals_scored: int,
    goals_conceded: int,
    result: str,  # 'win' | 'loss' | 'draw'
):
    doc_ref = db.collection("user_stats").document(uid)
    doc = doc_ref.get()
    if not doc.exists:
        stats = UserStats(uid=uid)
    else:
        stats = UserStats(**doc.to_dict())
    stats.total_matches += 1
    stats.goals_scored += goals_scored
    stats.goals_conceded += goals_conceded
    if result == "win":
        stats.wins += 1
    elif result == "loss":
        stats.losses += 1
    elif result == "draw":
        stats.draws += 1
    stats.last_match_at = datetime.utcnow()
    doc_ref.set(stats.dict())