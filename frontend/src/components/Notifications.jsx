import React, { useState, useEffect } from 'react';
import api from '../api';

const Notifications = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/medical/notifications/');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markRead = async (id) => {
        try {
            await api.patch(`/medical/notifications/${id}/`, { is_read: true });
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop Overlay */}
            <div 
                onClick={onClose}
                style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
                    zIndex: 999, animation: 'fadeIn 0.3s ease-out'
                }}
            />

            {/* Notification Panel */}
            <div style={{ 
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', 
                background: 'white', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)', zIndex: 1000,
                padding: '40px 30px', display: 'flex', flexDirection: 'column', 
                animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                borderLeft: '1px solid #f1f5f9'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>Health Alerts</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Recent medical and system updates</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: '#f1f5f9', border: 'none', width: '40px', height: '40px', 
                            borderRadius: '12px', fontSize: '1.2rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', color: '#64748b'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }} className="custom-scrollbar">
                    {notifications.length > 0 ? notifications.map(notif => (
                        <div key={notif.id} style={{ 
                            padding: '20px', borderRadius: '20px', marginBottom: '16px',
                            background: notif.is_read ? '#ffffff' : '#f0f7ff',
                            border: notif.is_read ? '1px solid #f1f5f9' : '1px solid #dbeafe',
                            borderLeft: `6px solid ${notif.severity === 'critical' ? '#ef4444' : notif.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }} 
                        onClick={() => markRead(notif.id)}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.05rem', marginBottom: '8px' }}>
                                {notif.severity === 'critical' ? '🚨 ' : notif.severity === 'warning' ? '⚠️ ' : 'ℹ️ '}
                                {notif.title}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{notif.message}</p>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px', fontWeight: '600' }}>
                                {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            {!notif.is_read && <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%', position: 'absolute', top: '20px', right: '20px', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}></div>}
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '100px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🔔</div>
                            <p style={{ fontWeight: '600' }}>All caught up! No new alerts.</p>
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
                `}</style>
            </div>
        </>
    );
};

export default Notifications;
