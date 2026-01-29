import random
from datetime import datetime
from typing import Optional
from firebase_admin import auth
from google.cloud.firestore_v1 import Client as FirestoreClient
from config import db, firebase_auth
from models import (
    RegisterWithEmailRequest,
    LoginWithEmailRequest,
    LoginWithNicknameRequest,
    UserResponse,  # <-- Cambiato da AuthResponse
)

def _generate_tag() -> str:
    return f"{random.randint(0, 9999):04d}"

def _nickname_tag_exists(
    db_client: FirestoreClient, nickname: str, tag: str
) -> bool:
    q = (
        db_client.collection("users")
        .where("nickname", "==", nickname)
        .where("tag", "==", tag)
        .limit(1)
    )
    docs = list(q.stream())
    return len(docs) > 0

def _generate_unique_tag_for_nickname(
    db_client: FirestoreClient, nickname: str
) -> str:
    for _ in range(50):
        candidate = _generate_tag()
        if not _nickname_tag_exists(db_client, nickname, candidate):
            return candidate
    raise RuntimeError("Impossibile generare un tag univoco per il nickname")

def register_with_email(data: RegisterWithEmailRequest) -> UserResponse:
    user_record = firebase_auth.create_user(
        email=data.email,
        password=data.password,
        display_name=data.nickname,
    )
    uid = user_record.uid

    tag = data.tag or _generate_unique_tag_for_nickname(db, data.nickname)

    now = datetime.utcnow()
    user_doc = {
        "uid": uid,
        "nickname": data.nickname,
        "tag": tag,
        "email": data.email,
        "avatar_url": None,
        "favorite_team": None,
        "status": "active",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    db.collection("users").document(uid).set(user_doc)

    stats_doc = {
        "uid": uid,
        "total_matches": 0,
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "goals_scored": 0,
        "goals_conceded": 0,
        "last_match_at": None,
    }
    db.collection("user_stats").document(uid).set(stats_doc)

    return UserResponse(
        uid=uid,
        email=data.email,
        nickname=data.nickname,
        tag=tag,
        created_at=now.isoformat(),
    )

def login_with_email(data: LoginWithEmailRequest) -> UserResponse:
    user_record = firebase_auth.get_user_by_email(data.email)
    uid = user_record.uid
    doc = db.collection("users").document(uid).get()
    
    if not doc.exists:
        nickname = user_record.display_name or "User"
        tag = _generate_unique_tag_for_nickname(db, nickname)
        now = datetime.utcnow()
        profile = {
            "uid": uid,
            "nickname": nickname,
            "tag": tag,
            "email": data.email,
            "avatar_url": None,
            "favorite_team": None,
            "status": "active",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }
        db.collection("users").document(uid).set(profile)
    else:
        profile = doc.to_dict()

    return UserResponse(
        uid=uid,
        email=profile.get("email"),
        nickname=profile.get("nickname"),
        tag=profile.get("tag"),
        created_at=profile.get("created_at"),
    )

def login_with_nickname(data: LoginWithNicknameRequest) -> Optional[UserResponse]:
    q = (
        db.collection("users")
        .where("nickname", "==", data.nickname)
        .where("tag", "==", data.tag)
        .limit(1)
    )
    docs = list(q.stream())
    if not docs:
        return None
    profile = docs[0].to_dict()
    return UserResponse(
        uid=profile["uid"],
        email=profile.get("email"),
        nickname=profile["nickname"],
        tag=profile["tag"],
        created_at=profile.get("created_at"),
    )