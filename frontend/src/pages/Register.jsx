import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        aadhaar_number: '',
        mobile_number: '',
        password: ''
    });
    const [otp, setOtp] = useState('');
    const [debugOtp, setDebugOtp] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/send-otp/', {
                aadhaar_number: formData.aadhaar_number,
                mobile_number: formData.mobile_number
            });
            if (res.data.debug_otp) {
                setDebugOtp(res.data.debug_otp);
            }
            setStep(2);
            setError('');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const errorMessages = Object.values(err.response.data).flat();
                setError(errorMessages.join(', '));
            } else {
                setError('Failed to send OTP. Please try again.');
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/register/', { ...formData, otp });
            navigate('/login');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const errorMessages = Object.values(err.response.data).flat();
                setError(errorMessages.join(', '));
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Patient Registration</h2>
                {error && <div className="error">{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <input
                            type="text"
                            name="aadhaar_number"
                            placeholder="Aadhaar Number"
                            value={formData.aadhaar_number}
                            onChange={handleChange}
                            required
                            pattern="\d{12}"
                            minLength="12"
                            maxLength="12"
                            title="Aadhaar number must be exactly 12 digits"
                        />
                        <input
                            type="text"
                            name="mobile_number"
                            placeholder="Mobile Number"
                            value={formData.mobile_number}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button type="submit">Send OTP</button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister}>
                        {debugOtp && <div className="success">Debug OTP: {debugOtp}</div>}
                        <p style={{ marginBottom: '15px', color: '#666' }}>Enter OTP sent to {formData.mobile_number}</p>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit">Verify & Register</button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ marginTop: '10px', background: 'none', color: '#666', fontWeight: 'normal', textDecoration: 'underline' }}
                        >
                            Back
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                    <p>Already have an account? <a href="/login" style={{ color: '#4ade80' }}>Login here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
