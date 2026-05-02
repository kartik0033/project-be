import React, { useState } from 'react';
import Notifications from './Notifications';

const Header = () => {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const userRole = sessionStorage.getItem('user_role');

    if (userRole !== 'patient') return null;

    return (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 900 }}>
            <button 
                onClick={() => setIsNotifOpen(true)}
                style={{ 
                    background: 'white', color: 'inherit', border: '1px solid #e2e8f0', width: '60px', height: '60px', 
                    borderRadius: '16px', fontSize: '1.8rem', cursor: 'pointer', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
            >
                🔔
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
            </button>

            <Notifications isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>
    );
};

export default Header;
