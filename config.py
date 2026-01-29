
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Percorso al file JSON della service account che hai scaricato da Firebase
FIREBASE_CREDENTIALS_PATH = "serviceaccountkey.json"

if not firebase_admin._apps:
    # In un ambiente reale, assicurati che il file JSON sia presente
    try:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    except Exception:
        # Fallback per inizializzazione senza file se in ambiente Cloud pre-configurato
        firebase_admin.initialize_app()

db = firestore.client()
firebase_auth = auth
