import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [profile, setProfile] = useState(null);
    const [meds, setMeds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Handle promises individually to prevent one 404 (like Profile) from breaking the whole dashboard
                const [apptsRes, recordsRes, profRes, medsRes] = await Promise.allSettled([
                    api.get('/medical/appointments/'),
                    api.get('/medical/records/'),
                    api.get('/profile/'),
                    api.get('/medical/medications/')
                ]);

                if (apptsRes.status === 'fulfilled') setAppointments(apptsRes.value.data.slice(0, 3));
                if (recordsRes.status === 'fulfilled') setRecords(recordsRes.value.data.slice(0, 3));
                if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
                if (medsRes.status === 'fulfilled') setMeds(medsRes.value.data);

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

    if (!user || loading) return <div className="loading" style={{ height: '100vh' }}><h3>Loading Intelligence...</h3></div>;

    const ActionCard = ({ to, title, icon, desc }) => (
        <Link to={to} className="action-card">
            <div className="action-icon">{icon}</div>
            <div className="action-title">{title}</div>
            <div className="action-desc">{desc}</div>
        </Link>
    );

    const PulseWidget = ({ label, value, unit, icon, color }) => (
        <div className="pulse-widget">
            <div className="pulse-icon" style={{ background: `${color}15`, color: color }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
                    {value} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#94a3b8' }}>{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* Health Pulse Row */}
            <div className="pulse-grid">
                <PulseWidget 
                    label="Medication" 
                    value={`${meds.reduce((acc, m) => acc + m.today_logs?.length || 0, 0)}/${meds.reduce((acc, m) => acc + (m.timings?.split(',').length || 0), 0)}`} 
                    unit="Taken" 
                    icon="💊" 
                    color="#3b82f6" 
                />
                <PulseWidget label="Blood Group" value={profile?.blood_group || 'N/A'} icon="🩸" color="#ef4444" />
                <PulseWidget label="Heart Rate" value="72" unit="bpm" icon="💓" color="#ec4899" />
                <PulseWidget label="Weight" value={profile?.weight || '—'} unit={profile?.weight ? 'kg' : ''} icon="⚖️" color="#10b981" />
            </div>

            {/* Digital ID Card Section */}
            <div className="digital-id-card">
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        {profile?.profile_picture ? (
                            <img src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `http://127.0.0.1:8000${profile.profile_picture}`} alt="Profile" className="profile-avatar" />
                        ) : (
                            <div className="avatar-placeholder">👤</div>
                        )}
                    </div>
                    
                    <div className="profile-info">
                        <h2>{profile?.full_name || 'Set Up Profile'}</h2>
                        
                        <div className="profile-tags">
                            <span className="tag">{profile?.age ? `${profile.age} yrs` : 'Age'} • {profile?.gender === 'M' ? 'Male' : profile?.gender === 'F' ? 'Female' : 'Other'}</span>
                            {profile?.blood_group && <span className="tag blood-group">🩸 {profile.blood_group}</span>}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '35px', marginTop: '10px' }}>
                            <div>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', letterSpacing: '1px' }}>AADHAAR ID</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px' }}>{user?.aadhaar_number}</span>
                                    <span style={{ background: '#10b981', color: 'white', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>VERIFIED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="qr-code-box">
                    {user?.qr_code_image ? (
                        <img src={user.qr_code_image.startsWith('http') ? user.qr_code_image : `http://127.0.0.1:8000${user.qr_code_image}`} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' }}>No QR</div>
                    )}
                </div>
            </div>

            {/* Quick Actions Hub */}
            <div className="action-grid">
                <ActionCard to="/appointments" title="Book Visit" icon="📅" desc="Schedule new visit" />
                <ActionCard to="/medication-tracker" title="Medicine" icon="💊" desc="Track your doses" />
                <ActionCard to="/records" title="Vault" icon="🔒" desc="Manage records" />
                <ActionCard to="/ai-summarizer" title="AI Audit" icon="✨" desc="Smart analysis" />
            </div>

            {/* AI Wellness Tip Banner */}
            <div className="wellness-tip">
                <div style={{ fontSize: '1.8rem' }}>✨</div>
                <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500', lineHeight: '1.5' }}>
                    <strong style={{ color: '#3b82f6' }}>AI Insight:</strong> Keep hydrated! Drink at least 8 glasses of water today to improve focus and energy levels.
                </div>
            </div>

            {/* Previews Grid */}
            <div className="previews-grid">
                <div className="preview-card">
                    <div className="preview-header">
                        <h3>Calendar</h3>
                        <Link to="/appointments" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>See all →</Link>
                    </div>
                    {appointments.length > 0 ? appointments.map(app => (
                        <div key={app.id} className="list-item">
                            <div className="list-icon-box date">
                                <div className="month">{new Date(app.appointment_date).toLocaleString('default', { month: 'short' })}</div>
                                <div className="day">{new Date(app.appointment_date).getDate()}</div>
                            </div>
                            <div className="list-text">
                                <h4>{app.doctor_name || 'Medical Specialist'}</h4>
                                <p>{app.appointment_time} • {app.status}</p>
                            </div>
                        </div>
                    )) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No upcoming events.</p>}
                </div>

                <div className="preview-card">
                    <div className="preview-header">
                        <h3>Recent Logs</h3>
                        <Link to="/records" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Locker →</Link>
                    </div>
                    {records.length > 0 ? records.map(rec => (
                        <div key={rec.id} className="list-item">
                            <div className="list-icon-box" style={{ fontSize: '1.8rem' }}>📄</div>
                            <div className="list-text">
                                <h4>{rec.title}</h4>
                                <p>Added on {new Date(rec.date_uploaded).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )) : <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Your locker is empty.</p>}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;

