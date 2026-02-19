import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Welcome, {user.full_name || 'Patient'}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Profile Card */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#4a90e2' }}>Profile Details</h3>
                    <p><strong>Aadhaar Number:</strong> {user.aadhaar_number}</p>
                    <p><strong>Age:</strong> {user.age || 'N/A'}</p>
                    <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
                    <Link to="/profile">
                        <button style={{ marginTop: '20px', background: '#4a90e2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit Profile</button>
                    </Link>
                </div>

                {/* QR Code Card */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#4a90e2' }}>Your Health Card</h3>
                    {user.qr_code_image ? (
                        <img
                            src={user.qr_code_image.startsWith('http') ? user.qr_code_image : `http://127.0.0.1:8000${user.qr_code_image}`}
                            alt="Health Card QR"
                            style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                        />
                    ) : (
                        <p style={{ color: '#888' }}>QR Code not generated yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
