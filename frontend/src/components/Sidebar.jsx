import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper to check active state
    const isActive = (path) => location.pathname === path;

    return (
        <div style={{
            width: '250px',
            background: 'linear-gradient(180deg, #4a90e2 0%, #005c97 100%)',
            color: 'white',
            height: '100vh',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ marginBottom: '40px', fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Health Card</h2>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                <Link to="/dashboard" style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    transition: 'background 0.3s'
                }}>
                    Dashboard
                </Link>
                <Link to="/profile" style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/profile') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    transition: 'background 0.3s'
                }}>
                    Profile
                </Link>
                <Link to="/records" style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/records') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    transition: 'background 0.3s'
                }}>
                    My Records
                </Link>
                <Link to="/appointments" style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/appointments') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    transition: 'background 0.3s'
                }}>
                    Appointments
                </Link>
            </nav>

            <button
                onClick={handleLogout}
                style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,0,0,0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
