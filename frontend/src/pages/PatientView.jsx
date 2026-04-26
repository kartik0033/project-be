import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

const PatientView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const patientData = location.state?.patientData;
    
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [formData, setFormData] = useState({ 
        title: '', 
        description: '', 
        file: null,
        report_type: '',
        provider_facility: '',
        report_time: '',
        visible_to_patient: true
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const catRes = await api.get('/medical/categories/');
                setCategories(catRes.data);
                const facRes = await api.get('/medical/facilities/');
                setFacilities(facRes.data);
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchOptions();
    }, []);

    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file) return alert('Please select a file');
        
        setUploading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('file', formData.file);
        data.append('patient_id', patientData.patient_id);
        data.append('visible_to_patient', formData.visible_to_patient);
        if (formData.report_type) data.append('report_type', formData.report_type);
        if (formData.provider_facility) data.append('provider_facility', formData.provider_facility);
        if (formData.report_time) {
            data.append('report_time', new Date(formData.report_time).toISOString());
        }
        
        try {
            await api.post('/medical/records/', data);
            alert('Record Uploaded Successfully! Please rescan to see the new record.');
            setShowUpload(false);
            setFormData({ title: '', description: '', file: null, report_type: '', provider_facility: '', report_time: '', visible_to_patient: true });
        } catch (err) {
            console.error(err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

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
                            <div key={i} style={{ background: '#f8f9fa', borderLeft: '4px solid #3b82f6', padding: '20px', borderRadius: '4px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{rec.title}</h4>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    {rec.report_type_name && <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{rec.report_type_name}</span>}
                                    {rec.provider_facility_name && <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>🏥 {rec.provider_facility_name}</span>}
                                    {rec.visible_to_patient === false && <span style={{ background: '#fef2f2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>🔒 Internal Note</span>}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0 0 10px 0' }}>{new Date(rec.report_time || rec.date_uploaded).toLocaleString()}</p>
                                <p style={{ margin: 0, color: '#34495e' }}>{rec.description || <span style={{ color: '#ccc', fontStyle: 'italic' }}>No description provided.</span>}</p>
                                {rec.file && (
                                    <a href={`http://127.0.0.1:8000${rec.file}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
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
                <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Add Clinical Note / Prescription</h3>
                <p style={{ color: '#7f8c8d', marginBottom: '25px' }}>Securely upload a new prescription or lab report to this patient's permanent record.</p>
                <button 
                    onClick={() => {
                        setFormData(prev => ({ ...prev, report_time: getCurrentDateTimeLocal() }));
                        setShowUpload(true);
                    }}
                    style={{ background: '#2563eb', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                    + Upload New Record
                </button>
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Upload to Patient File</h3>
                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Report Type</label>
                                    <select value={formData.report_type} onChange={(e) => setFormData({...formData, report_type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', background: 'white' }}>
                                        <option value="">Select Category...</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Facility</label>
                                    <select value={formData.provider_facility} onChange={(e) => setFormData({...formData, provider_facility: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', background: 'white' }}>
                                        <option value="">Select Facility...</option>
                                        {facilities.map(fac => <option key={fac.id} value={fac.id}>{fac.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Title *</label>
                                <input type="text" list="doctor-title-suggestions" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} autoComplete="off" required placeholder="e.g. Prescription, MRI Result" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                {formData.report_type && categories.find(c => c.id == formData.report_type)?.suggestions?.length > 0 && (
                                    <datalist id="doctor-title-suggestions">
                                        {categories.find(c => c.id == formData.report_type).suggestions.map(sugg => (
                                            <option key={sugg.id} value={sugg.suggested_title} />
                                        ))}
                                    </datalist>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Date of Encounter</label>
                                    <input type="datetime-local" value={formData.report_time} onChange={(e) => setFormData({...formData, report_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>
                                        <input type="checkbox" checked={formData.visible_to_patient} onChange={(e) => setFormData({...formData, visible_to_patient: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        Visible to Patient 👁️
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Internal/Clinical Notes</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Write observations, differential diagnosis, etc." rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Attach File (PDF/Image) *</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFormData({...formData, file: e.target.files[0]})} required style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '8px', boxSizing: 'border-box', background: '#f8f9fa' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowUpload(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>Cancel</button>
                                <button type="submit" disabled={uploading} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: uploading ? '#94a3b8' : '#3b82f6', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>{uploading ? 'Uploading...' : 'Upload'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientView;
