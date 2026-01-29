import os
import json
from typing import Optional

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore


# ============================================================
# 1. Inizializzazione credenziali Firebase
# ============================================================

firebase_creds_json: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_JSON")

if firebase_creds_json:
    # Produzione: credenziali da variabile d'ambiente
    cred_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(cred_dict)
else:
    # Sviluppo locale: file JSON
    cred = credentials.Certificate("serviceaccountkey.json")


# ============================================================
# 2. Inizializza l'app Firebase
# ============================================================

if not firebase_admin._apps:
    firebase_app = firebase_admin.initialize_app(cred)
else:
    firebase_app = firebase_admin.get_app()


# ============================================================
# 3. Client Firestore
# ============================================================

db = firestore.client(app=firebase_app)


# ============================================================
# 4. Helper per auth
# ============================================================

def get_firebase_auth():
    return firebase_auth