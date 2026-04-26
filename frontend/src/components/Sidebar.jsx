import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{
            width: isOpen ? '250px' : '90px',
            background: '#ffffff', // White color background
            color: '#2c3e50',
            height: '100vh',
            padding: isOpen ? '20px' : '20px 10px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            position: 'relative'
        }}>
            {/* Hamburger Menu Toggle (Matching the image style) */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    cursor: 'pointer', 
                    background: '#2563eb', // Blue background from image
                    padding: '12px 10px', 
                    borderRadius: '8px',
                    color: 'white',
                    alignSelf: isOpen ? 'flex-end' : 'center',
                    marginBottom: '30px',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '3px', background: '#ffffff', marginBottom: '5px', borderRadius: '2px' }}></div>
                    <div style={{ width: '24px', height: '3px', background: '#ffffff', marginBottom: '5px', borderRadius: '2px' }}></div>
                    <div style={{ width: '16px', height: '3px', background: '#ffffff', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontSize: '10px', marginTop: '6px', fontWeight: 'bold', letterSpacing: '1px' }}>MENU</span>
            </div>

            {isOpen && <h2 style={{ marginBottom: '40px', fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', color: '#2563eb' }}>Health Card</h2>}

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, marginTop: isOpen ? '0' : '20px' }}>
                <Link to="/patient-dashboard" style={{
                    color: isActive('/patient-dashboard') ? '#2563eb' : '#475569',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/patient-dashboard') ? '#eff6ff' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: isActive('/patient-dashboard') ? '600' : '400',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'flex-start' : 'center'
                }}>
                    <span style={{ fontSize: '1.3rem', marginRight: isOpen ? '10px' : '0' }}>🏠</span>
                    {isOpen && "Dashboard"}
                </Link>

                <Link to="/profile" style={{
                    color: isActive('/profile') ? '#2563eb' : '#475569',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/profile') ? '#eff6ff' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: isActive('/profile') ? '600' : '400',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'flex-start' : 'center'
                }}>
                    <span style={{ fontSize: '1.3rem', marginRight: isOpen ? '10px' : '0' }}>👤</span>
                    {isOpen && "Profile"}
                </Link>

                <Link to="/records" style={{
                    color: isActive('/records') ? '#2563eb' : '#475569',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/records') ? '#eff6ff' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: isActive('/records') ? '600' : '400',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'flex-start' : 'center'
                }}>
                    <span style={{ fontSize: '1.3rem', marginRight: isOpen ? '10px' : '0' }}>📄</span>
                    {isOpen && "My Records"}
                </Link>

                <Link to="/appointments" style={{
                    color: isActive('/appointments') ? '#2563eb' : '#475569',
                    textDecoration: 'none',
                    padding: '12px 15px',
                    background: isActive('/appointments') ? '#eff6ff' : 'transparent',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: isActive('/appointments') ? '600' : '400',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'flex-start' : 'center'
                }}>
                    <span style={{ fontSize: '1.3rem', marginRight: isOpen ? '10px' : '0' }}>📅</span>
                    {isOpen && "Appointments"}
                </Link>
            </nav>

            <button
                onClick={handleLogout}
                style={{
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                {isOpen && "Logout"}
            </button>
        </div>
    );
};

export default Sidebar;
