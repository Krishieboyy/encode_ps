# INGREDIENT COPILOT — RUN LOCALLY (Windows / Mac / Linux)

## Repo structure
```
ingredients-copilot/
  backend/
  frontend/
```

## Prerequisites
1) **Python**: Use **Python 3.12.x** (recommended)  
   - Windows: check versions with: `py -0p`  
   - Any OS: check version with: `python --version`

2) **Node.js**: Install **Node.js LTS** (includes npm)  
   - Check: `node -v`  
   - Check: `npm -v`

**IMPORTANT:** Do NOT commit / upload these folders:
- `frontend/node_modules/`
- `backend/.venv/`  
(Use `.gitignore`)

---

## A) Backend (FastAPI) — Start server

### Windows (PowerShell)
1) Open PowerShell in the repo root (`ingredients-copilot`), then:
```powershell
cd backend
```

2) Create venv using Python 3.12:
```powershell
py -3.12 -m venv .venv
```

3) Activate venv:
```powershell
.\.venv\Scripts\Activate.ps1
```

If activation is blocked, run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again:
```powershell
.\.venv\Scripts\Activate.ps1
```

4) Install dependencies:
```powershell
py -m pip install -U pip setuptools wheel
py -m pip install -r requirements.txt
```

5) Run backend:
```powershell
py -m uvicorn main:app --reload --port 8000
```

Backend URLs:
- Health: `http://localhost:8000/health`
- Swagger: `http://localhost:8000/docs`

**KEEP THIS TERMINAL RUNNING.**

---

### macOS / Linux (bash/zsh)
1) Open terminal in repo root, then:
```bash
cd backend
```

2) Create venv:
```bash
python3.12 -m venv .venv
```

3) Activate venv:
```bash
source .venv/bin/activate
```

4) Install dependencies:
```bash
python -m pip install -U pip setuptools wheel
python -m pip install -r requirements.txt
```

5) Run backend:
```bash
python -m uvicorn main:app --reload --port 8000
```

**KEEP THIS TERMINAL RUNNING.**

---

## B) Frontend (Next.js) — Start UI

Open a **SECOND terminal** in the repo root.

1) Go to frontend:
```bash
cd frontend
```

2) Install packages:
```bash
npm install
```

3) Run dev server:
```bash
npm run dev
```

Frontend URL:
- `http://localhost:3000`

Start page:
- `http://localhost:3000/scan`

---

## C) Optional: Frontend env config

By default the frontend calls the backend at:
- `http://localhost:8000`

If your backend runs on a different port, create:
- `frontend/.env.local`

With:
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Then restart frontend (`Ctrl+C`, then `npm run dev`).

---

## D) Common fixes

1) **"npm is not recognized" (Windows)**  
- Install Node.js LTS, restart VS Code/terminal, then:
```powershell
node -v
npm -v
```

2) **Python install errors on Windows (pydantic-core/orjson build failures)**  
- Ensure your venv was created with Python 3.12:
```powershell
py -3.12 -m venv .venv
```

3) **Next.js error: Can't resolve '../styles/globals.css'**  
- Ensure file exists at:
  - `frontend/styles/globals.css`
- Or update import in:
  - `frontend/pages/_app.js`

4) **Backend error: No module named 'routers.analyze'**  
- Ensure these files exist:
  - `backend/routers/analyze.py`
  - `backend/routers/chat.py`
- Ensure packages:
  - `backend/routers/__init__.py`
  - `backend/services/__init__.py`

---

## E) Stop servers
- Backend terminal: `Ctrl + C`
- Frontend terminal: `Ctrl + C`
