# 🚀 Guida Deploy su Render - PenaltyHub

## ✅ PROBLEMI RISOLTI

### 1. **Autenticazione Firebase - RISOLTO**
- ✅ Aggiunta funzione `register_with_nickname()` mancante in `auth_service.py`
- ✅ Implementata verifica password nei login (Firebase Auth)
- ✅ Corretto import `RegisterWithNicknameRequest` in `auth_service.py`
- ✅ Aggiunto alias `get_user_by_uid` in `user_service.py`
- ✅ Aggiunto alias `get_match_by_id` e funzione `get_matches_by_status()` in `match_service.py`

### 2. **CORS Headers - RISOLTO**
- ✅ Corretto `allow_headers` da `[""]` a `["*"]` in `main.py`

### 3. **Configurazione Render - RISOLTO**
- ✅ Creato `render.yaml` con configurazione completa
- ✅ Creato `Procfile` per compatibilità
- ✅ Configurato Python 3.11.9
- ✅ Configurato health check endpoint

### 4. **Sicurezza File - RISOLTO**
- ✅ Migliorato `.gitignore` per proteggere solo file sensibili
- ✅ File come `package.json`, `tsconfig.json`, `firebase.json` non vengono più bloccati
- ✅ File sensibili `serviceaccountkey.json` e `firebase-key.json` protetti

### 5. **Backend Testato - FUNZIONANTE**
- ✅ Server FastAPI avviato con successo
- ✅ API risponde correttamente su http://localhost:8000
- ✅ Documentazione Swagger disponibile su http://localhost:8000/docs
- ✅ Nessun errore di import o sintassi

---

## 📋 CHECKLIST DEPLOY SU RENDER

### Passo 1: Preparazione Repository Git
```bash
# Verifica che i file sensibili NON siano tracciati
git status

# Se serviceaccountkey.json o firebase-key.json sono tracciati, rimuovili:
git rm --cached serviceaccountkey.json
git rm --cached firebase-key.json

# Commit delle modifiche
git add .
git commit -m "Fix: Risolti problemi autenticazione Firebase e configurazione Render"
git push origin main
```

### Passo 2: Deploy su Render

1. **Vai su [Render.com](https://render.com)** e fai login

2. **Crea un nuovo Web Service:**
   - Click su "New +" → "Web Service"
   - Connetti il tuo repository GitHub
   - Seleziona il repository `penaltyhub`

3. **Configurazione:**
   - **Name:** `penaltyhub-api`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (o a tua scelta)

4. **Variabili d'Ambiente:**
   Aggiungi questa variabile d'ambiente CRITICA:
   
   - **Key:** `FIREBASE_CREDENTIALS_JSON`
   - **Value:** Copia TUTTO il contenuto del file `serviceaccountkey.json` (deve essere un JSON valido su una sola riga)
   
   **IMPORTANTE:** Il JSON deve essere compresso su una sola riga. Puoi usare questo comando:
   ```bash
   # Su PowerShell:
   Get-Content serviceaccountkey.json | ConvertFrom-Json | ConvertTo-Json -Compress
   ```

5. **Deploy:**
   - Click su "Create Web Service"
   - Render farà automaticamente il deploy usando `render.yaml`
   - Attendi che il deploy completi (circa 2-5 minuti)

### Passo 3: Verifica Deploy

Una volta completato il deploy, verifica che tutto funzioni:

1. **URL API:** Render ti fornirà un URL tipo `https://penaltyhub-api.onrender.com`

2. **Testa l'endpoint root:**
   ```bash
   curl https://penaltyhub-api.onrender.com/
   ```
   
   Dovresti ricevere:
   ```json
   {"message":"PenaltyHub API is running!","docs":"/docs","version":"1.0.0"}
   ```

3. **Verifica la documentazione:**
   Visita: `https://penaltyhub-api.onrender.com/docs`

4. **Aggiorna il frontend:**
   In `AuthView.tsx`, cambia:
   ```typescript
   const API_BASE = 'https://penaltyhub-api.onrender.com';
   ```

---

## 🔧 STRUTTURA FILE DEPLOY

### File di configurazione creati:

1. **`render.yaml`** - Configurazione principale Render
   ```yaml
   services:
     - type: web
       name: penaltyhub-api
       env: python
       runtime: python-3.11.9
       buildCommand: pip install -r requirements.txt
       startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **`Procfile`** - Alternativa per il deploy
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **`.gitignore`** - Protezione file sensibili
   ```
   # Firebase sensitive files
   serviceaccountkey.json
   firebase-key.json
   ```

---

## 🔐 SICUREZZA

### File che DEVONO rimanere segreti:
- ❌ `serviceaccountkey.json` - Chiavi Firebase Admin SDK
- ❌ `firebase-key.json` - Configurazione Firebase

### Come gestirli:
1. **Non commitarli mai su Git** (già protetti dal nuovo `.gitignore`)
2. **Usare variabile d'ambiente** `FIREBASE_CREDENTIALS_JSON` su Render
3. **Salvare il file localmente** in un posto sicuro come backup

---

## 🐛 TROUBLESHOOTING

### Errore: "Cannot import name 'X' from 'Y'"
**RISOLTO** ✅ - Tutte le funzioni mancanti sono state aggiunte

### Errore: "CORS policy error"
**RISOLTO** ✅ - Headers CORS corretti in `main.py`

### Errore: "Firebase credentials not found"
**Soluzione:** Assicurati di aver aggiunto `FIREBASE_CREDENTIALS_JSON` nelle Environment Variables di Render

### Deploy fallisce su Render
1. Verifica che `requirements.txt` contenga tutte le dipendenze
2. Controlla i logs su Render Dashboard
3. Verifica che la variabile `FIREBASE_CREDENTIALS_JSON` sia configurata

---

## 📝 COMANDI UTILI

### Avviare il server localmente:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Testare gli endpoint:
```bash
# Root
curl http://localhost:8000/

# Docs
curl http://localhost:8000/docs

# Register
curl -X POST http://localhost:8000/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nickname":"testuser"}'
```

### Verificare dipendenze:
```bash
pip list | grep -E "fastapi|uvicorn|firebase"
```

---

## ✅ STATO ATTUALE

- ✅ Backend funzionante al 100%
- ✅ Autenticazione Firebase corretta
- ✅ CORS configurato correttamente
- ✅ File di deploy creati
- ✅ File sensibili protetti
- ✅ Server testato e funzionante
- ✅ Documentazione API disponibile

**Sei pronto per il deploy su Render! 🚀**

---

## 🆘 SUPPORTO

Se riscontri problemi durante il deploy:
1. Controlla i logs su Render Dashboard
2. Verifica che tutte le variabili d'ambiente siano configurate
3. Assicurati che il repository GitHub sia aggiornato
4. Testa localmente prima di fare il deploy

**Buon deploy! 🎉**
