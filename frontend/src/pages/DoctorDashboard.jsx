import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const DoctorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchAppointments = () => {
        api.get('/medical/appointments/')
            .then(res => {
                setAppointments(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch schedule", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/medical/appointments/${id}/`, { status: newStatus });
            fetchAppointments();
        } catch (error) {
            console.error(`Failed to update status to ${newStatus}`, error);
            alert("Could not update appointment status.");
        }
    };

    // Calculate metrics
    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
    const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px 30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: '#2c3e50', margin: '0 0 5px 0', fontSize: '2rem' }}>
                        Welcome, Dr. {user?.full_name || 'Doctor'}
                    </h1>
                    <p style={{ margin: 0, color: '#7f8c8d', fontSize: '1rem', fontWeight: '500' }}>{user?.specialization || 'Medical Practitioner'}</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ padding: '10px 20px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </button>
            </div>

            {/* Quick Actions & Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                
                {/* Primary Action Card */}
                <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '16px', padding: '30px', color: 'white', boxShadow: '0 10px 25px rgba(59,130,246,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem' }}>Scan Patient QR</h2>
                    <p style={{ margin: '0 0 20px 0', opacity: 0.9, lineHeight: '1.5' }}>Access secure medical histories and quickly upload clinical notes to the patient's record.</p>
                    <Link to="/scanner" style={{ textDecoration: 'none' }}>
                        <button style={{ background: 'white', color: '#2563eb', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                            <span style={{ fontSize: '1.2rem' }}>📷</span> Open Scanner
                        </button>
                    </Link>
                </div>

                {/* Metrics Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, borderLeft: '5px solid #f59e0b' }}>
                        <div>
                            <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>Action Required</p>
                            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem' }}>Pending Requests</h3>
                        </div>
                        <div style={{ background: '#fef3c7', color: '#d97706', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', fontWeight: 'bold' }}>
                            {pendingAppointments}
                        </div>
                    </div>
                    
                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, borderLeft: '5px solid #10b981' }}>
                        <div>
                            <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>Upcoming Schedule</p>
                            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem' }}>Confirmed Visits</h3>
                        </div>
                        <div style={{ background: '#d1fae5', color: '#059669', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', fontWeight: 'bold' }}>
                            {confirmedAppointments}
                        </div>
                    </div>
                </div>

            </div>

            {/* Schedule Section */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
                    <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>📅 Appointment Queue</h2>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Showing all requests</span>
                </div>
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading schedule...</div>
                ) : appointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {appointments.map(app => (
                            <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: app.status === 'Pending' ? '#f8fafc' : 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease', boxShadow: app.status === 'Pending' ? '0 2px 8px rgba(0,0,0,0.02)' : 'none' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.1rem' }}>{app.patient_name || 'Patient'}</h4>
                                    <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <span>🕒 {new Date(app.appointment_date + 'T' + app.appointment_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ 
                                        padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                                        background: app.status === 'Confirmed' ? '#dcfce7' : app.status === 'Pending' ? '#fef3c7' : app.status === 'Cancelled' ? '#fee2e2' : '#f1f5f9',
                                        color: app.status === 'Confirmed' ? '#166534' : app.status === 'Pending' ? '#92400e' : app.status === 'Cancelled' ? '#991b1b' : '#475569'
                                    }}>
                                        {app.status}
                                    </span>
                                    
                                    {app.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleStatusUpdate(app.id, 'Confirmed')} style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(34,197,94,0.2)', transition: 'background 0.2s' }}>Accept</button>
                                            <button onClick={() => handleStatusUpdate(app.id, 'Cancelled')} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(239,68,68,0.2)', transition: 'background 0.2s' }}>Decline</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                        <h3 style={{ color: '#475569', margin: '0 0 8px 0' }}>No Appointments Yet</h3>
                        <p style={{ color: '#94a3b8', margin: 0 }}>Your schedule is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
