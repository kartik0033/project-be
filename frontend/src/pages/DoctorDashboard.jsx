import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const DoctorDashboard = () => {
    const { logout } = useContext(AuthContext);
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
            fetchAppointments(); // refresh
        } catch (error) {
            console.error(`Failed to update status to ${newStatus}`, error);
            alert("Could not update appointment status.");
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '2rem' }}>👨‍⚕️</span> Doctor Portal
                </h1>
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        padding: '10px 20px', 
                        background: '#fef2f2', 
                        color: '#ef4444', 
                        border: '1px solid #fca5a5', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fca5a5';
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </button>
            </div>
            
            <div style={{ marginTop: '40px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Scan Patient QR Code</h3>
                <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Scan a patient's Health Card QR to securely access their medical history and upload new prescriptions.</p>
                <Link to="/scanner">
                    <button style={{ background: '#3b82f6', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
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
                            <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #2563eb' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.1rem' }}>Patient: {app.patient_name || 'Unknown Patient'}</h4>
                                    <p style={{ margin: 0, color: '#95a5a6' }}>
                                        {new Date(app.appointment_date + 'T' + app.appointment_time).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ 
                                        padding: '6px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.85rem', 
                                        fontWeight: 'bold',
                                        background: app.status === 'Confirmed' ? '#dcfce7' : app.status === 'Pending' ? '#fef3c7' : app.status === 'Cancelled' ? '#fee2e2' : '#f0f0f0',
                                        color: app.status === 'Confirmed' ? '#166534' : app.status === 'Pending' ? '#92400e' : app.status === 'Cancelled' ? '#991b1b' : '#888'
                                    }}>
                                        {app.status}
                                    </span>
                                    
                                    {app.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleStatusUpdate(app.id, 'Confirmed')}
                                                style={{ padding: '6px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(app.id, 'Cancelled')}
                                                style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
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
