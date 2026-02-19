import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Left Side: Navigation */}
            <Sidebar />

            {/* Right Side: Content */}
            <div style={{
                flex: 1,
                padding: '40px',
                overflowY: 'auto',
                backgroundColor: '#f5f6fa',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
