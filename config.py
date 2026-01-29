import os
import json
from typing import Optional

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth, firestore


# ============================================================
# 1. Inizializzazione credenziali Firebase
#    - In locale: usa il file serviceaccountkey.json
#    - Su Render: legge dalla variabile d'ambiente FIREBASE_CREDENTIALS_JSON
# ============================================================

firebase_creds_json: Optional[str] = os.getenv("FIREBASE_CREDENTIALS_JSON")

if firebase_creds_json:
    # Siamo in produzione (es. Render): le credenziali arrivano da variabile d'ambiente
    cred_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(cred_dict)
else:
    # Siamo in locale: usa il file JSON nella cartella del progetto
    # Assicurati che il file esista SOLO in locale e sia in .gitignore
    cred = credentials.Certificate("serviceaccountkey.json")


# ============================================================
# 2. Inizializza l'app Firebase (se non è già inizializzata)
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
# 4. (Opzionale) Funzione di utilità per ottenere il client auth
# ============================================================

def get_firebase_auth():
    """
    Restituisce il modulo firebase_auth (alias firebase_admin.auth).
    È solo una comodità se vuoi iniettare dipendenze in altri file.
    """
    return firebase_auth