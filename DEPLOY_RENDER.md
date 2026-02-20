# 🚀 Guida al Deployment su Render - PenaltyHub

## 📋 Panoramica

Questa guida ti aiuterà a deployare PenaltyHub su Render in modo che i tuoi amici possano accedere all'applicazione tramite un unico link.

Il progetto è configurato per:
- **Backend FastAPI** che gestisce le API
- **Frontend React+Vite** servito direttamente dal backend
- **Database Firebase** per l'autenticazione e i dati

## 🔧 Prerequisiti

1. **Account Render**: Crea un account gratuito su [render.com](https://render.com)
2. **Repository Git**: Il codice deve essere su GitHub, GitLab o Bitbucket
3. **Firebase Credentials**: File `firebase-key.json` o `serviceaccountkey.json`

## 📝 Step 1: Preparare il Progetto

### 1.1 Verifica che tutti i file siano aggiornati

Assicurati di avere questi file nel tuo progetto:
- ✅ `main.py` - Backend FastAPI con serving dei file statici
- ✅ `render.yaml` - Configurazione del deploy
- ✅ `requirements.txt` - Dipendenze Python
- ✅ `package.json` - Dipendenze Node.js
- ✅ `firebase-key.json` - Credenziali Firebase

### 1.2 Verifica il file `.gitignore`

Assicurati che questi file NON siano nel `.gitignore`:
```
render.yaml
requirements.txt
package.json
```

Ma che questi file SIANO nel `.gitignore`:
```
firebase-key.json
serviceaccountkey.json
.env
dist/
node_modules/
```

## 🔑 Step 2: Configurare Firebase su Render

### 2.1 Converti le credenziali Firebase in una stringa

Le credenziali Firebase devono essere passate come variabile d'ambiente. Usa questo comando:

**Su Windows (PowerShell):**
```powershell
Get-Content firebase-key.json | ConvertTo-Json -Compress | Set-Clipboard
```

**Su Mac/Linux:**
```bash
cat firebase-key.json | jq -c '.' | pbcopy
```

Questo copia il contenuto del file Firebase in formato JSON compresso negli appunti.

## 🌐 Step 3: Deploy su Render

### 3.1 Crea un nuovo Web Service

1. Vai su [dashboard.render.com](https://dashboard.render.com)
2. Clicca su **"New +"** → **"Web Service"**
3. Connetti il tuo repository GitHub/GitLab
4. Seleziona il repository `penaltyhub`

### 3.2 Configura il Web Service

Compila i campi come segue:

| Campo | Valore |
|-------|--------|
| **Name** | `penaltyhub` (o il nome che preferisci) |
| **Region** | `Frankfurt (EU Central)` o la regione più vicina |
| **Branch** | `main` (o il branch che usi) |
| **Runtime** | `Python 3` |
| **Build Command** | Lascia vuoto (usa il comando da render.yaml) |
| **Start Command** | Lascia vuoto (usa il comando da render.yaml) |

### 3.3 Imposta le variabili d'ambiente

Nella sezione **Environment Variables**, aggiungi:

| Key | Value |
|-----|-------|
| `FIREBASE_CREDENTIALS_JSON` | Incolla il JSON copiato al Step 2.1 |
| `PYTHON_VERSION` | `3.11.9` |
| `NODE_VERSION` | `20` |

### 3.4 Piano di fatturazione

- Seleziona il piano **Free** (0€/mese) per iniziare
- Il piano gratuito è sufficiente per testare con gli amici
- Nota: il servizio gratuito si spegne dopo 15 minuti di inattività

### 3.5 Avvia il Deploy

1. Clicca su **"Create Web Service"**
2. Render inizierà il build del progetto
3. Puoi vedere i log in tempo reale

## ⏱️ Step 4: Attendere il Completamento

Il processo di build include:
1. ✅ Installazione dipendenze Python (`pip install`)
2. ✅ Installazione dipendenze Node.js (`npm install`)
3. ✅ Build del frontend React (`npm run build`)
4. ✅ Avvio del server FastAPI

Il primo deploy può richiedere **5-10 minuti**.

## 🎉 Step 5: Ottenere il Link

Una volta completato il deploy:

1. Troverai il tuo URL nella dashboard Render
2. Sarà simile a: `https://penaltyhub.onrender.com`
3. **Questo è il link da condividere con i tuoi amici!**

## 🧪 Step 6: Testare l'Applicazione

Apri il link nel browser e verifica:

- ✅ La landing page si carica correttamente
- ✅ La registrazione funziona
- ✅ Il login funziona
- ✅ Il backend risponde alle chiamate API

Test API diretti:
- `https://tuo-app.onrender.com/` → Messaggio di benvenuto
- `https://tuo-app.onrender.com/health` → Status ok
- `https://tuo-app.onrender.com/docs` → Documentazione API

## 🔄 Aggiornamenti Futuri

Ogni volta che fai `git push` sul branch principale:
1. Render rileverà automaticamente le modifiche
2. Avvierà un nuovo deploy
3. L'applicazione sarà aggiornata automaticamente

Per deployare manualmente:
- Vai nella dashboard Render
- Clicca su **"Manual Deploy"** → **"Deploy latest commit"**

## ⚠️ Problemi Comuni

### Il sito non si carica

**Problema**: Errore 404 o schermata bianca

**Soluzione**:
1. Controlla i log su Render
2. Verifica che il build sia completato con successo
3. Controlla che la cartella `dist` sia stata creata

### Errori Firebase

**Problema**: Errori di autenticazione o "Firebase not initialized"

**Soluzione**:
1. Verifica che `FIREBASE_CREDENTIALS_JSON` sia configurato correttamente
2. Il JSON deve essere **una singola riga** senza spazi
3. Riavvia il servizio su Render dopo aver modificato le variabili

### Il servizio è lento

**Problema**: Il primo caricamento impiega molto tempo

**Soluzione**:
- È normale con il piano gratuito
- Il servizio si "sveglia" dopo 15 minuti di inattività
- Considera un upgrade al piano Starter ($7/mese) per avere il servizio sempre attivo

### Build fallisce

**Problema**: Errori durante `npm install` o `npm run build`

**Soluzione**:
1. Verifica che `package.json` sia presente nel root del progetto
2. Controlla che tutte le dipendenze siano corrette
3. Testa il build localmente: `npm install && npm run build`

## 📊 Monitoraggio

### Visualizza i Log

1. Vai nella dashboard Render
2. Seleziona il tuo servizio
3. Clicca su **"Logs"**
4. Vedi i log in tempo reale

### Metriche

- **CPU Usage**: Utilizzo del processore
- **Memory**: Memoria utilizzata
- **Bandwidth**: Traffico in/out

## 🔒 Sicurezza

### Variabili d'Ambiente

- ✅ **MAI** committare `firebase-key.json` su Git
- ✅ Usa sempre le variabili d'ambiente per le credenziali
- ✅ Ruota le credenziali periodicamente

### CORS

Il backend è già configurato con CORS aperto (`allow_origins=["*"]`).

Per produzione, considera di limitare le origini:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tuo-app.onrender.com"],
    ...
)
```

## 💡 Suggerimenti

1. **Dominio Personalizzato**: Su Render puoi collegare un dominio custom (es. `penaltyhub.it`)
2. **SSL Automatico**: Render fornisce HTTPS gratuito
3. **CD/CI**: Render si integra automaticamente con GitHub per deploy continui
4. **Scaling**: Puoi fare upgrade del piano per avere più risorse

## 📞 Supporto

Se hai problemi:
1. Controlla i log su Render
2. Verifica la documentazione: [docs.render.com](https://docs.render.com)
3. Testa localmente prima di deployare

## ✅ Checklist Finale

Prima di condividere il link con i tuoi amici:

- [ ] Il sito si carica correttamente
- [ ] La registrazione funziona
- [ ] Il login funziona
- [ ] Le API rispondono correttamente
- [ ] I dati vengono salvati su Firebase
- [ ] Non ci sono errori nei log

---

## 🎮 Buon Divertimento!

Ora puoi condividere il link `https://tuo-app.onrender.com` con i tuoi amici e iniziare a usare PenaltyHub!

⚽ **PenaltyHub - Locker Room Elite** ⚽
