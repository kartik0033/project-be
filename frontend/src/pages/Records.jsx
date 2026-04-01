import React from 'react';

const Records = () => {
    return (
        <div>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>My Medical Records</h1>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#888' }}>No medical records uploaded yet.</p>
                {/* Future implementation: File upload and list display */}
                <button style={{ marginTop: '20px', background: '#4a90e2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Upload New Record
                </button>
            </div>
        </div>
    );
};

export default Records;
