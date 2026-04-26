import React, { useState, useContext, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import './Auth.css';

const Login = () => {
    const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
    const [method, setMethod] = useState('password'); // 'password' or 'qr'
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Send the identifier as aadhaar_number since backend expects it for both
            const res = await api.post('/login/', {
                aadhaar_number: formData.identifier,
                password: formData.password
            });
            login(res.data);
            if (res.data.role === 'doctor') {
                navigate('/doctor-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else if (!err.response) {
                setError('Network/CORS Error: Could not connect to server.');
            } else {
                setError('Invalid Credentials');
            }
        }
    };

    useEffect(() => {
        if (role === 'patient' && method === 'qr') {
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE, Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    rememberLastUsedCamera: true
                },
        /* verbose= */ false
            );

            scanner.render(async (decodedText) => {
                try {
                    const res = await api.post('/qr-login/', { qr_token: decodedText });
                    scanner.clear();
                    login(res.data);
                    if (res.data.role === 'doctor') {
                        navigate('/doctor-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                } catch (err) {
                    setError('Invalid QR Code');
                }
            }, (errorMessage) => {
                // parse error, ignore
            });

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner", error));
            };
        }
    }, [role, method]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login</h2>

                {/* Role Switcher */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', background: '#eff6ff', borderRadius: '8px', padding: '5px' }}>
                    <button
                        className={`switch-btn ${role === 'patient' ? 'active' : ''}`}
                        onClick={() => { setRole('patient'); setMethod('password'); }}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'patient' ? '#3b82f6' : 'transparent', color: role === 'patient' ? 'white' : '#1d4ed8', textDecoration: 'none' }}
                    >
                        Patient
                    </button>
                    <button
                        className={`switch-btn ${role === 'doctor' ? 'active' : ''}`}
                        onClick={() => setRole('doctor')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', background: role === 'doctor' ? '#3b82f6' : 'transparent', color: role === 'doctor' ? 'white' : '#1d4ed8', textDecoration: 'none' }}
                    >
                        Doctor
                    </button>
                </div>

                {role === 'patient' && (
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                        <button
                            className={`switch-btn ${method === 'password' ? 'active' : ''}`}
                            onClick={() => setMethod('password')}
                        >
                            Password
                        </button>
                        <span style={{ alignSelf: 'center', color: '#ccc' }}>|</span>
                        <button
                            className={`switch-btn ${method === 'qr' ? 'active' : ''}`}
                            onClick={() => setMethod('qr')}
                        >
                            QR Code
                        </button>
                    </div>
                )}

                {error && <div className="error">{error}</div>}

                {(role === 'doctor' || (role === 'patient' && method === 'password')) ? (
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder={role === 'doctor' ? "Doctor ID / Username" : "Aadhaar Number"}
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            required
                            pattern={role === 'patient' ? "\\d{12}" : undefined}
                            minLength={role === 'patient' ? "12" : undefined}
                            maxLength={role === 'patient' ? "12" : undefined}
                            title={role === 'patient' ? "Aadhaar number must be exactly 12 digits" : "Enter your Doctor ID"}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button type="submit">Login as {role === 'doctor' ? 'Doctor' : 'Patient'}</button>
                    </form>
                ) : (
                    <div className="qr-container">
                        <div id="reader" width="300px"></div>
                        <p>Scan your unique QR code to login</p>
                    </div>
                )}

                {role === 'patient' && (
                    <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                        <p>Don't have an account? <a href="/register" style={{ color: '#1d4ed8', fontWeight: 'bold', textDecoration: 'none' }}>Register here</a></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
