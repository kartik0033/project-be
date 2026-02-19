import React, { useState, useContext, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import './Auth.css';

const Login = () => {
    const [method, setMethod] = useState('password'); // 'password' or 'qr'
    const [formData, setFormData] = useState({ aadhaar_number: '', password: '' });
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/login/', formData);
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid Credentials');
        }
    };

    useEffect(() => {
        if (method === 'qr') {
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
                    navigate('/dashboard');
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
    }, [method]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login</h2>
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

                {error && <div className="error">{error}</div>}

                {method === 'password' ? (
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Aadhaar Number"
                            value={formData.aadhaar_number}
                            onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })}
                            required
                            pattern="\d{12}"
                            minLength="12"
                            maxLength="12"
                            title="Aadhaar number must be exactly 12 digits"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                ) : (
                    <div className="qr-container">
                        <div id="reader" width="300px"></div>
                        <p>Scan your unique QR code to login</p>
                    </div>
                )}

                <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                    <p>Don't have an account? <a href="/register" style={{ color: '#4a90e2' }}>Register here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
