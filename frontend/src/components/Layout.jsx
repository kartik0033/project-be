import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Left Side: Navigation */}
            <Sidebar />

            {/* Right Side: Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Header />
                <div style={{
                    flex: 1,
                    padding: '40px',
                    overflowY: 'auto',
                    backgroundColor: '#f5f6fa',
                }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
