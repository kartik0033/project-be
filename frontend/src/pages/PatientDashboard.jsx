import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [apptsRes, recordsRes] = await Promise.all([
                    api.get('/medical/appointments/'),
                    api.get('/medical/records/')
                ]);
                setAppointments(apptsRes.data.slice(0, 3)); // Get top 3
                setRecords(recordsRes.data.slice(0, 3));    // Get top 3
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Welcome, {user.full_name || 'Patient'}</h1>

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <Link to="/appointments" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#3b82f6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(59,130,246,0.3)' }}>
                        📅 Book New Appointment
                    </button>
                </Link>
                <Link to="/records" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#10b981', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(16,185,129,0.3)' }}>
                        📤 Upload Medical Record
                    </button>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Profile Card */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#3b82f6', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Profile Details</span>
                        <Link to="/profile" style={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'none', fontWeight: 'normal' }}>Edit ✎</Link>
                    </h3>
                    <p><strong>Aadhaar Number:</strong> {user.aadhaar_number}</p>
                    <p><strong>Age:</strong> {user.age || 'N/A'}</p>
                    <p><strong>Gender:</strong> {user.gender || 'N/A'}</p>
                    <p><strong>Address:</strong> {user.address || 'N/A'}</p>
                </div>

                {/* QR Code Card */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#3b82f6' }}>Your Health Card</h3>
                    {user.qr_code_image ? (
                        <img
                            src={user.qr_code_image.startsWith('http') ? user.qr_code_image : `http://127.0.0.1:8000${user.qr_code_image}`}
                            alt="Health Card QR"
                            style={{ width: '180px', height: '180px', objectFit: 'contain' }}
                        />
                    ) : (
                        <p style={{ color: '#888' }}>QR Code not generated yet.</p>
                    )}
                </div>
            </div>

            {/* Dashboard Previews Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                
                {/* Appointments Preview */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#3b82f6', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Upcoming Appointments</span>
                        <Link to="/appointments" style={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'none', fontWeight: 'normal' }}>View All →</Link>
                    </h3>
                    {loading ? <p>Loading...</p> : appointments.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {appointments.map(app => (
                                <li key={app.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f3f4f6' }}>
                                    <strong>{app.doctor_name || 'Doctor'}</strong>
                                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
                                        {new Date(app.appointment_date + 'T' + app.appointment_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#9ca3af' }}>No upcoming appointments.</p>
                    )}
                </div>

                {/* Records Preview */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#3b82f6', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Recent Medical Records</span>
                        <Link to="/records" style={{ fontSize: '0.9rem', color: '#6b7280', textDecoration: 'none', fontWeight: 'normal' }}>View All →</Link>
                    </h3>
                    {loading ? <p>Loading...</p> : records.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {records.map(rec => (
                                <li key={rec.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f3f4f6' }}>
                                    <strong>{rec.title}</strong>
                                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
                                        Uploaded: {new Date(rec.date_uploaded).toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#9ca3af' }}>No recent medical records.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PatientDashboard;
