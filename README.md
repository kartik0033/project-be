
# Patient Health System 🏥

A secure, digital health record management system featuring QR code-based patient identification and OTP-authenticated access.

![Status](https://img.shields.io/badge/Status-Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

-   **Secure Authentication**: OTP-based registration and login using Twilio.
-   **QR Code Identity**: Unique QR code generated for every patient for instant profile access.
-   **Role-Based Access**: Secure dashboard for patients to view their medical history.
-   **Data Security**:
    -   Aadhaar number hashing (SHA-256) for privacy.
    -   OTP expiry (5 mins) and rate limiting (3 attempts).
    -   JWT validation for API requests.

## 🛠️ Tech Stack

-   **Frontend**: React.js, Vite, TailwindCSS (assumed/optional), Axios
-   **Backend**: Django, Django Rest Framework (DRF)
-   **Database**: SQLite (Dev), PostgreSQL (Prod ready)
-   **Tools**: Twilio (SMS), QRCode (Python lib)

## 📂 Project Structure

```bash
project-BE/
├── backend/            # Django API Server
│   ├── accounts/       # Auth & User Logic
│   ├── patient_health_system/ # Config
│   └── media/          # Generated QR Codes
├── frontend/           # React Client
│   ├── src/
│   │   ├── components/
│   │   └── pages/
```

## ⚡ Quick Start

### Prerequisites
-   Node.js & npm
-   Python 3.10+
-   Twilio Account (for OTPs)

### Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create and activate virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    Create a `.env` file in `test/backend` and add:
    ```ini
    TWILIO_ACCOUNT_SID='your_sid'
    TWILIO_AUTH_TOKEN='your_token'
    TWILIO_PHONE_NUMBER='your_number'
    ```
5.  Run Migrations & Server:
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```

### Frontend Setup

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 🔒 Security Note

This project handles sensitive data (Aadhaar). In a real-world deployment:
-   Ensure `DEBUG=False` in Django settings.
-   Use HTTPS.
-   Store Aadhaar hashes, never plain text (Already implemented in models).

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit changes (`git commit -m 'Add AmazingFeature'`).
4.  Push to branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
