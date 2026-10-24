# MedSync - Unified Smart Healthcare & Medication Coordination Platform

MedSync is a next-generation healthcare coordination ecosystem designed to bridge patients, physicians, and clinical clinics seamlessly. It combines AI-driven health triage, real-time clinical radar doctor discovery, verified medical record sharing, smart medication scheduling, and role-based portal access.

---

## 🌟 Key Features

- **Dual-Role Medical Portal**: Tailored workspaces for Patients (health records, vitals, appointments, prescriptions) and Doctors (patient lookup, consent-based clinical charts, treatment notes, prescriptions).
- **Interactive Clinical Radar & Find Doctors**: 
  - Real-time GPS device telemetry with Haversine distance calculations.
  - Interactive radar sweep visualization displaying nearby verified clinics and doctors within chosen radii (1 km – 25 km).
  - OpenStreetMap & Google Maps fallback for street-level reverse geocoding and one-click turn-by-turn navigation.
- **AI Health Assistant (MedSync Bot)**:
  - Clinical symptom triage and preliminary health guidance.
  - Patient context-aware responses with quick action prompts.
- **Smart Medication Management**:
  - Daily dosage tracking, adherence analytics, and refill reminders.
  - One-click dose logging with timestamped history.
- **Patient Consent & Security Manager**:
  - Granular patient-controlled access permissions (Active / Pending / Revoked).
  - Full audit trails of medical chart access.
- **Appointments & Teleconsultation Scheduling**:
  - Instant doctor booking with specialty and date/time selection.
- **Emergency Medical SOS**:
  - One-click emergency dispatch card with rapid ambulance/helpline triggers.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Modern Responsive CSS3 (Glassmorphism, CSS variables, CSS grid/flexbox)
- **Icons**: Lucide React
- **Authentication**: Firebase Auth (Google OAuth & Email/Password) + Local Session fallback
- **Geocoding & Maps**: Geolocation API, OpenStreetMap Nominatim, Google Maps Platform

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Server**: Uvicorn ASGI
- **Database**: SQLite3 (`healthcare.db`) with automatic schema initialization & seeding
- **Validation**: Pydantic v2
- **CORS**: Configured for local & cross-origin communication

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **Python**: 3.10+ ([Download](https://www.python.org/))
- **Git**

### Automated Launch (Windows)
Double-click `start.bat` or run:
```powershell
.\start.ps1
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API and interactive Swagger documentation will be available at:
- **API Base**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Open your browser at:
- **Web App**: `http://localhost:5173`

---

## 📂 Project Structure

```text
healthcare/
├── backend/
│   ├── main.py              # FastAPI app, REST endpoints & SQLite DB logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Tabs (Dashboard, Doctors, Appointments, etc.)
│   │   ├── firebase/        # Firebase Auth & Firestore client
│   │   ├── services/        # Google Maps & Geocoding services
│   │   ├── App.jsx          # Root application component
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
├── start.bat                # 1-click startup script (cmd)
├── start.ps1                # 1-click startup script (PowerShell)
├── MedSync_Project_Presentation.pptx # Project Presentation Slides
└── README.md
```

---

## 🔒 License
This project is licensed under the MIT License.
