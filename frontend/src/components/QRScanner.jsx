import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 300, height: 300 },
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                rememberLastUsedCamera: true
            },
            false
        );

        scanner.render(async (decodedText) => {
            try {
                setLoading(true);
                scanner.clear();
                // Securely query medical records with the scanned token
                const res = await api.post('/medical/scan/', { qr_token: decodedText });
                // Pass Data directly to PatientView
                navigate('/patient-view', { state: { patientData: res.data } });
            } catch (err) {
                setLoading(false);
                setError(err.response?.data?.error || 'Failed to scan QR Code. Ensure you are scanning a valid Health Card.');
            }
        }, (errorMessage) => {
            // Suppress standard decode errors
        });

        return () => {
             scanner.clear().catch(error => console.error("Scanner clear failed", error));
        };
    }, []);

    return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Scan Patient Health Card</h2>
            {error && <div style={{ color: '#e74c3c', background: '#fadbd8', padding: '10px', borderRadius: '5px', marginBottom: '20px', display: 'inline-block' }}>{error}</div>}
            
            {loading ? (
                <div style={{ margin: '50px 0', fontSize: '1.2rem', color: '#4ade80' }}>Fetching Secure Records...</div>
            ) : (
                <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}></div>
            )}
            
            <button 
                onClick={() => navigate('/doctor-dashboard')} 
                style={{ marginTop: '30px', padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', background: 'white', cursor: 'pointer' }}
            >
                Cancel & Go Back
            </button>
        </div>
    );
};

export default QRScanner;
