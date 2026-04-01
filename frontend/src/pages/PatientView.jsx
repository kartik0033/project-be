import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PatientView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const patientData = location.state?.patientData;

    if (!patientData) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2 style={{ color: '#e74c3c' }}>Session Expired or No Patient Data Found</h2>
                <button onClick={() => navigate('/doctor-dashboard')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ecf0f1', paddingBottom: '20px' }}>
                <div>
                    <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Patient: {patientData.name}</h1>
                    <p style={{ color: '#7f8c8d', margin: 0 }}>Aadhaar Number: **** **** {patientData.aadhaar.substring(patientData.aadhaar.length - 4)}</p>
                </div>
                <button onClick={() => navigate('/doctor-dashboard')} style={{ padding: '10px 20px', background: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Close File</button>
            </div>
            
            <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Medical History ({patientData.records ? patientData.records.length : 0} Records)</h3>
                
                {patientData.records && patientData.records.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {patientData.records.map((rec, i) => (
                            <div key={i} style={{ background: '#f8f9fa', borderLeft: '4px solid #4a90e2', padding: '20px', borderRadius: '4px' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{rec.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0 0 10px 0' }}>{new Date(rec.date_uploaded).toLocaleString()}</p>
                                <p style={{ margin: 0 }}>{rec.description || 'No description provided.'}</p>
                                {rec.file && (
                                    <a href={`http://127.0.0.1:8000${rec.file}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#4a90e2', textDecoration: 'none', fontWeight: 'bold' }}>
                                        View Attached Document
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ background: '#f8f9fa', padding: '30px', textAlign: 'center', borderRadius: '8px', color: '#7f8c8d' }}>
                        Patient has no prior medical records in the system.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '40px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <h3 style={{ color: '#4a90e2', marginBottom: '15px' }}>Add Clinical Note / Prescription</h3>
                <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Securely upload a new prescription or lab report to this patient's permanent record.</p>
                <button style={{ background: '#2ecc71', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    + Upload New Record
                </button>
            </div>
        </div>
    );
};

export default PatientView;
