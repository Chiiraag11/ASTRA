# ASTRA Security Platform

Fake banking APK detector and URL phishing analyzer.
Full-stack: React/TypeScript/Vite frontend + FastAPI/Python backend.

---

## Project Structure

```
astra-platform/
├── frontend/               # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── pages/          # LandingPage, ScanSelection, ScanResults, FinalVerdict
│   │   ├── context/        # ScanContext (global scan state)
│   │   ├── services/       # api.ts (backend calls), auth.ts
│   │   └── components/     # Header, Button, ProtectedRoute
│   └── vite.config.ts      # Proxies /scan-apk and /scan-url to :8000
│
└── backend/                # FastAPI + Python
    ├── main.py             # App entry point
    ├── routers/
    │   ├── apk.py          # POST /scan-apk
    │   └── url.py          # POST /scan-url
    ├── core/
    │   ├── extractor.py    # Androguard metadata extraction
    │   ├── risk_engine.py  # Rule-based risk scoring (0–100)
    │   └── url_analyzer.py # URL phishing detection
    └── requirements.txt
```

---

## Quick Start

### 1. Backend

```bash
cd astra-platform/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd astra-platform/frontend

npm install
npm run dev
```

Frontend runs at: http://localhost:5173

> The Vite dev server proxies `/scan-apk`, `/scan-url`, and `/health` to `:8000` automatically.

---

## API Endpoints

### `GET /health`
Health check.
```json
{ "status": "ok", "service": "ASTRA Security API", "version": "2.0.0" }
```

### `POST /scan-apk`
Upload an APK file for analysis.

**Request:** `multipart/form-data` with field `file` (.apk)

**Response:**
```json
{
  "success": true,
  "metadata": {
    "file_name": "app.apk",
    "app_name": "My App",
    "package_name": "com.example.app",
    "version_name": "1.0",
    "min_sdk": "21",
    "target_sdk": "34",
    "permissions": ["android.permission.INTERNET", ...],
    "activities": [...],
    "services": [...],
    "receivers": [...],
    "providers": [...],
    "signatures": ["3082..."],
    "main_activity": "com.example.MainActivity"
  },
  "risk": {
    "risk_score": 87,
    "verdict": "Malicious",
    "flags": ["Dangerous permission: READ_SMS (+25)", ...],
    "permission_score": 65,
    "package_score": 15,
    "signature_score": 0,
    "behavior_score": 7,
    "dangerous_permissions": ["android.permission.READ_SMS", ...]
  }
}
```

### `POST /scan-url`
Analyze a URL for phishing indicators.

**Request:** `{ "url": "https://example.com" }`

**Response:**
```json
{
  "success": true,
  "url": "http://fake-bank.xyz/login",
  "malicious": true,
  "risk_score": 65,
  "verdict": "Malicious",
  "flags": ["Not using HTTPS (+15)", "Suspicious TLD '.xyz' (+20)", ...]
}
```

---

## Dependencies

### Backend (`requirements.txt`)
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
python-multipart==0.0.9
pydantic==2.7.4
androguard==3.4.0
```

> **Note:** `androguard` requires `lxml` and `pyOpenSSL`. If installation fails:
> ```bash
> pip install androguard --pre
> # or
> pip install git+https://github.com/androguard/androguard.git
> ```

### Frontend
All dependencies are in `package.json`. Key packages:
- `react` + `react-dom` + `react-router-dom`
- `framer-motion` (animations)
- `lucide-react` (icons)
- `tailwindcss` + `vite` (build tooling)

---

## Risk Scoring

The risk engine assigns points (0–100) across four dimensions:

| Category         | Max Score | Examples |
|-----------------|-----------|---------|
| Permissions     | 80        | READ_SMS (+25), SYSTEM_ALERT_WINDOW (+20) |
| Package/Name    | 40        | Banking keyword impersonation (+15) |
| Signatures      | 25        | No signature found (+25) |
| Behavior        | 40        | SMS service detected (+15) |

**Verdict thresholds:**
- `0–34` → **Safe**
- `35–64` → **Suspicious**
- `65–100` → **Malicious**

---

## Dangerous Permissions Detected

```
READ_SMS, RECEIVE_SMS, SEND_SMS
SYSTEM_ALERT_WINDOW
BIND_ACCESSIBILITY_SERVICE
READ_CONTACTS, WRITE_CONTACTS
READ_CALL_LOG
REQUEST_INSTALL_PACKAGES
READ_PHONE_STATE, READ_PHONE_NUMBERS
RECORD_AUDIO, CAMERA
ACCESS_BACKGROUND_LOCATION
```

---

## Environment Variables

No environment variables are required for basic operation.

For production deployment, set:
```env
# frontend/.env
VITE_API_URL=https://your-api-domain.com

# backend/.env
ALLOWED_ORIGINS=https://your-frontend-domain.com
MAX_UPLOAD_SIZE_MB=200
```

---

## Production Deployment

### Backend (with gunicorn)
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend (static build)
```bash
npm run build
# Serve the dist/ folder with nginx, Vercel, or Netlify
```

### Docker (optional)
```bash
# Backend
docker build -f Dockerfile.backend -t astra-backend .
docker run -p 8000:8000 astra-backend

# Frontend
docker build -f Dockerfile.frontend -t astra-frontend .
docker run -p 5173:80 astra-frontend
```
