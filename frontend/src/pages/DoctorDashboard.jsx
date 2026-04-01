import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';

const DoctorDashboard = () => {
    const { logout } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/medical/appointments/')
            .then(res => {
                setAppointments(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch schedule", err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#2c3e50' }}>Doctor Portal</h1>
                <button onClick={logout} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
            </div>
            
            <div style={{ marginTop: '40px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h3 style={{ color: '#4a90e2', marginBottom: '15px' }}>Scan Patient QR Code</h3>
                <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Scan a patient's Health Card QR to securely access their medical history and upload new prescriptions.</p>
                <Link to="/scanner">
                    <button style={{ background: '#4a90e2', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        📷 Open Camera Scanner
                    </button>
                </Link>
            </div>
            
            <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', marginBottom: '20px' }}>Your Upcoming Schedule</h3>
                
                {loading ? (
                    <p style={{ color: '#7f8c8d' }}>Loading your schedule...</p>
                ) : appointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {appointments.map(app => (
                            <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #2ecc71' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.1rem' }}>Patient: {app.patient_name || 'Unknown Patient'}</h4>
                                    <p style={{ margin: 0, color: '#95a5a6' }}>
                                        {new Date(app.appointment_date + 'T' + app.appointment_time).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <span style={{ background: '#e8f8f5', color: '#2ecc71', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {app.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#7f8c8d', fontStyle: 'italic', marginTop: '10px' }}>No upcoming appointments scheduled for today.</p>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
