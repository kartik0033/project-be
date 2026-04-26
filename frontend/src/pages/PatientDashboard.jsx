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

            {/* Digital ID Card Section - Scaled Down for Dashboard */}
            <div style={{ background: '#3170d6', borderRadius: '20px', padding: '25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(49, 112, 214, 0.3)', marginBottom: '35px', position: 'relative', overflow: 'hidden' }}>
                {/* Background Pattern */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div style={{ position: 'absolute', top: '-80px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                
                <div style={{ display: 'flex', gap: '25px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#ffffff', border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.15)' }}>
                            {user?.profile_picture ? (
                                <img src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2.8rem', color: '#94a3b8' }}>👤</span>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>{user?.full_name || 'Your Name'}</h2>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>{user?.age ? `${user.age} yrs` : 'Age'} • {user?.gender === 'M' ? 'Male' : user?.gender === 'F' ? 'Female' : 'Other'}</span>
                            {user?.blood_group && <span style={{ background: 'rgba(239,68,68,0.3)', color: '#fee2e2', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(239,68,68,0.4)' }}>🩸 {user.blood_group}</span>}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '25px' }}>
                            <div>
                                <p style={{ margin: '0 0 3px 0', fontSize: '0.65rem', color: '#e2e8f0', fontWeight: 'bold', letterSpacing: '1px' }}>AADHAAR ID</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '1px', color: '#ffffff' }}>{user?.aadhaar_number}</span>
                                    <span style={{ background: '#10b981', color: 'white', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold' }}>VERIFIED</span>
                                </div>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 3px 0', fontSize: '0.65rem', color: '#e2e8f0', fontWeight: 'bold', letterSpacing: '1px' }}>MOBILE</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.5px', color: '#ffffff' }}>{user?.mobile_number || 'N/A'}</span>
                                    <span style={{ background: '#10b981', color: 'white', fontSize: '0.55rem', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold' }}>VERIFIED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1, boxShadow: '0 8px 20px rgba(0,0,0,0.3)', width: '120px', height: '120px', flexShrink: 0 }}>
                    {user?.qr_code_image ? (
                        <img src={user.qr_code_image.startsWith('http') ? user.qr_code_image : `http://127.0.0.1:8000${user.qr_code_image}`} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', borderRadius: '8px', fontSize: '0.8rem' }}>No QR</div>
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
