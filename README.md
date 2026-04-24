
# 🏥 Patient Health System

A full-stack digital health record management system featuring QR code-based patient identification, OTP-authenticated registration, and role-based portals for Patients and Doctors.

![Status](https://img.shields.io/badge/Status-Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Django](https://img.shields.io/badge/Backend-Django%205.2-green)
![React](https://img.shields.io/badge/Frontend-React%2019-blue)

---

## 🚀 Features

### 👤 Patient Portal
- **OTP Registration** — Mobile-based OTP verification via Twilio
- **QR Code Identity** — Unique QR code generated per patient for instant access
- **Medical Records** — Upload, view, and manage personal health records (PDF, images, docs)
- **Appointments** — Book appointments with available doctors
- **Profile Management** — Update personal details (name, age, gender, address)

### 🩺 Doctor Portal
- **Secure Login** — JWT-based authentication
- **QR Scanner** — Scan patient QR codes to instantly pull up patient records
- **Patient View** — View full patient profile and uploaded medical records
- **Appointment Management** — View and manage scheduled appointments

### 🔒 Security
- JWT token authentication (DRF SimpleJWT)
- OTP expiry (5 mins) and rate limiting (3 attempts)
- Role-based route protection (Patient vs Doctor)
- QR tokens are UUID-based — untraceable to Aadhaar directly

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios |
| **Backend** | Django 5.2, Django REST Framework |
| **Auth** | JWT (SimpleJWT), OTP via Twilio |
| **Database** | SQLite (dev) |
| **QR Code** | `qrcode` (Python) + `html5-qrcode` (React) |

---

## 📂 Project Structure

```
project-BE/
├── backend/
│   ├── accounts/              # Patient registration, OTP, QR token
│   │   ├── models.py          # Patient, PatientProfile, OTP
│   │   ├── views.py           # Register, Login, OTP, Profile APIs
│   │   └── urls.py
│   ├── medical/               # Doctors, Records, Appointments
│   │   ├── models.py          # Doctor, MedicalRecord, Appointment
│   │   ├── views.py           # ViewSets + QR Scanner API
│   │   └── urls.py
│   ├── patient_health_system/ # Django settings & root URL config
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/             # Login, Register, Dashboard, Profile,
    │   │   │                  # Records, Appointments, DoctorDashboard, PatientView
    │   ├── components/        # Sidebar, Layout, QRScanner
    │   ├── routes/            # AppRoutes (role-based protection)
    │   ├── context/           # AuthContext
    │   └── api.js             # Axios base instance
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Twilio Account (for OTP SMS) — or use `debug_otp` shown in dev mode

---

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Create `.env` file inside `backend/`:**
```ini
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
SECRET_KEY=your_django_secret_key
DEBUG=True
```

```bash
# Run migrations
python manage.py migrate

# Create a test doctor (optional)
python create_test_doctor.py

# Start server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

---

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🧪 Test Credentials

After running `python create_test_doctor.py`, a test doctor is created with:
- **Username:** `doctor` (check create_test_doctor.py for exact credentials)
- **Login via:** `/login` — use Aadhaar + password

> For patients: Register at `/register` — the OTP will be shown on screen in `DEBUG` mode (no real SMS needed for testing).

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/send-otp/` | Send OTP to mobile for registration |
| POST | `/api/register/` | Register new patient |
| POST | `/api/login/` | Login with Aadhaar + password |
| GET/PUT | `/api/profile/` | Get or update patient profile |
| GET/POST | `/api/medical/records/` | List or upload medical records |
| GET/POST | `/api/medical/appointments/` | List or book appointments |
| GET | `/api/medical/doctors/` | List all doctors |
| POST | `/api/medical/scan-qr/` | Doctor scans patient QR |

---

## 📄 License

Distributed under the MIT License.
