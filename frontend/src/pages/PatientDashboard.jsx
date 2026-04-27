import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';


const PatientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [apptsRes, recordsRes, profRes] = await Promise.all([
                    api.get('/medical/appointments/'),
                    api.get('/medical/records/'),
                    api.get('/profile/')
                ]);
                setAppointments(apptsRes.data.slice(0, 3)); 
                setRecords(recordsRes.data.slice(0, 3));
                setProfile(profRes.data);
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

    if (!user) return <div>Loading Intelligence...</div>;

    const ActionCard = ({ to, title, icon, color, desc }) => (
        <Link to={to} style={{ textDecoration: 'none', flex: 1, minWidth: '150px' }}>
            <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '20px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                border: `1px solid #f1f5f9`,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
            >
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>{title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</div>
            </div>
        </Link>
    );

    const PulseWidget = ({ label, value, unit, icon, color }) => (
        <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '24px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        }}>
            <div style={{ background: `${color}15`, padding: '12px', borderRadius: '15px', fontSize: '1.5rem', color: color }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' }}>
                    {value} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#94a3b8' }}>{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Header with Wellness Tip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', gap: '30px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ color: '#1e293b', fontSize: '2.2rem', margin: '0 0 5px 0', fontWeight: '800' }}>Hello, {profile?.full_name?.split(' ')[0] || 'User'}! 👋</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Here is your health snapshot for today.</p>
                </div>
                
                <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', padding: '15px 25px', borderRadius: '18px', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '15px', maxWidth: '400px' }}>
                    <div style={{ fontSize: '1.5rem' }}>💡</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: '500', lineHeight: '1.5' }}>
                        <strong>AI Wellness Tip:</strong> Drink at least 8 glasses of water today to improve your focus and energy levels.
                    </div>
                </div>
            </div>

            {/* Health Pulse Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <PulseWidget label="Blood Group" value={profile?.blood_group || 'N/A'} icon="🩸" color="#ef4444" />
                <PulseWidget label="Heart Rate" value="72" unit="bpm" icon="💓" color="#ec4899" />
                <PulseWidget label="Height" value="175" unit="cm" icon="📏" color="#3b82f6" />
                <PulseWidget label="Weight" value="68" unit="kg" icon="⚖️" color="#10b981" />
            </div>

            {/* Digital ID Card Section - Restored previous style/alignment */}
            <div style={{ 
                background: '#3170d6', 
                borderRadius: '20px', 
                padding: '25px', 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                boxShadow: '0 10px 25px rgba(49, 112, 214, 0.3)', 
                marginBottom: '35px', 
                position: 'relative', 
                overflow: 'hidden' 
            }}>
                {/* Background Pattern */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div style={{ position: 'absolute', top: '-80px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                
                <div style={{ display: 'flex', gap: '25px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#ffffff', border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.15)' }}>
                            {profile?.profile_picture ? (
                                <img src={profile.profile_picture.startsWith('http') ? profile.profile_picture : `http://127.0.0.1:8000${profile.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2.8rem', color: '#94a3b8' }}>👤</span>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>{profile?.full_name || 'Your Name'}</h2>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>{profile?.age ? `${profile.age} yrs` : 'Age'} • {profile?.gender === 'M' ? 'Male' : profile?.gender === 'F' ? 'Female' : 'Other'}</span>
                            {profile?.blood_group && <span style={{ background: 'rgba(239,68,68,0.3)', color: '#fee2e2', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(239,68,68,0.4)' }}>🩸 {profile.blood_group}</span>}
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

            {/* Quick Actions Hub - Moved to its own row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <ActionCard to="/appointments" title="Book Visit" icon="📅" desc="Schedule new visit" />
                <ActionCard to="/records" title="Vault" icon="🔒" desc="Manage records" />
                <ActionCard to="/ai-summarizer" title="AI Audit" icon="✨" desc="Smart analysis" />
                <ActionCard to="/profile" title="Profile" icon="⚙️" desc="Edit details" />
            </div>

            {/* Previews Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Calendar</h3>
                        <Link to="/appointments" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>See all →</Link>
                    </div>
                    {appointments.length > 0 ? appointments.map(app => (
                        <div key={app.id} style={{ display: 'flex', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '15px', marginBottom: '15px', alignItems: 'center' }}>
                            <div style={{ background: 'white', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 'bold' }}>{new Date(app.appointment_date).toLocaleString('default', { month: 'short' })}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{new Date(app.appointment_date).getDate()}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{app.doctor_name || 'Medical Specialist'}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.appointment_time} • {app.status}</div>
                            </div>
                        </div>
                    )) : <p style={{ color: '#94a3b8', textAlign: 'center' }}>No upcoming events.</p>}
                </div>

                <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>Recent Logs</h3>
                        <Link to="/records" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>Locker →</Link>
                    </div>
                    {records.length > 0 ? records.map(rec => (
                        <div key={rec.id} style={{ display: 'flex', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '15px', marginBottom: '15px', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.5rem', background: '#fff', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>📄</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{rec.title}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Added on {new Date(rec.date_uploaded).toLocaleDateString()}</div>
                            </div>
                        </div>
                    )) : <p style={{ color: '#94a3b8', textAlign: 'center' }}>Your locker is empty.</p>}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
