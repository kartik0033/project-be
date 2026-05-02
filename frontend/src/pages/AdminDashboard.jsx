import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [facilities, setFacilities] = useState([]);
    const [doctors, setDoctors] = useState([]);
    
    // Form States
    const [docForm, setDocForm] = useState({ email: '', password: '', full_name: '', specialization: '', contact_number: '', facility_id: '', profile_image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [docMsg, setDocMsg] = useState({ type: '', text: '' });
    const [docLoading, setDocLoading] = useState(false);

    const [facForm, setFacForm] = useState({ name: '', address: '', facility_type: 'Hospital' });
    const [facMsg, setFacMsg] = useState({ type: '', text: '' });
    const [facLoading, setFacLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [facRes, docRes] = await Promise.all([
                api.get('/medical/facilities/'),
                api.get('/medical/doctors/')
            ]);
            setFacilities(facRes.data);
            setDoctors(docRes.data);
            if (facRes.data.length > 0 && !docForm.facility_id) {
                setDocForm(f => ({ ...f, facility_id: facRes.data[0].id }));
            }
        } catch (e) {
            console.error("Failed to fetch data", e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDocSubmit = async (e) => {
        e.preventDefault();
        setDocLoading(true);
        setDocMsg({ type: '', text: '' });
        
        const formData = new FormData();
        Object.keys(docForm).forEach(key => {
            if (docForm[key]) {
                formData.append(key, docForm[key]);
            }
        });

        try {
            await api.post('/medical/admin/add-doctor/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocMsg({ type: 'success', text: 'Doctor successfully created and assigned!' });
            setDocForm({ email: '', password: '', full_name: '', specialization: '', contact_number: '', facility_id: facilities.length > 0 ? facilities[0].id : '', profile_image: null });
            setImagePreview(null);
            fetchData();
        } catch (err) {
            setDocMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create doctor.' });
        } finally {
            setDocLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDocForm({ ...docForm, profile_image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFacSubmit = async (e) => {
        e.preventDefault();
        setFacLoading(true);
        setFacMsg({ type: '', text: '' });
        try {
            await api.post('/medical/facilities/', { ...facForm, is_verified: true });
            setFacMsg({ type: 'success', text: 'Hospital added successfully!' });
            setFacForm({ name: '', address: '', facility_type: 'Hospital' });
            fetchData();
        } catch (err) {
            setFacMsg({ type: 'error', text: 'Failed to add hospital.' });
        } finally {
            setFacLoading(false);
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this doctor? Their prescriptions and appointments will be safely retained but decoupled.')) return;
        try {
            await api.delete(`/medical/doctors/${id}/`);
            fetchData();
        } catch (e) { alert('Failed to delete doctor'); }
    };

    const handleDeleteFacility = async (id) => {
        if (!window.confirm('Delete this facility? Any doctors assigned will lose their facility link.')) return;
        try {
            await api.delete(`/medical/facilities/${id}/`);
            fetchData();
        } catch (e) { alert('Failed to delete facility'); }
    };

    const location = useLocation();
    let activeTab = 'overview';
    if (location.pathname === '/admin/doctors') activeTab = 'doctors';
    if (location.pathname === '/admin/facilities') activeTab = 'facilities';

    return (
        <div className="admin-dashboard-container">
            <div className="admin-header">
                <h1>{activeTab === 'overview' ? 'Admin Overview' : activeTab === 'doctors' ? 'Manage Doctors' : 'Manage Facilities'}</h1>
                <p>Manage platform access, facilities, and personnel directory.</p>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="admin-metrics">
                    <div className="metric-card">
                        <div className="metric-icon blue">🩺</div>
                        <div className="metric-info">
                            <h3>{doctors.length}</h3>
                            <p>Total Doctors</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon green">🏥</div>
                        <div className="metric-info">
                            <h3>{facilities.length}</h3>
                            <p>Registered Facilities</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon purple">🛡️</div>
                        <div className="metric-info">
                            <h3>System Secure</h3>
                            <p>All dependencies verified</p>
                        </div>
                    </div>
                </div>
            )}

            {/* DOCTORS TAB */}
            {activeTab === 'doctors' && (
                <div className="admin-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="admin-card">
                        <h2>🩺 Onboard New Doctor</h2>
                        {docMsg.text && <div className={`msg ${docMsg.type}`}>{docMsg.text}</div>}
                        <form className="admin-form" onSubmit={handleDocSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Profile Image Section */}
                            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                                <label style={{ marginBottom: '10px' }}>Profile Image (Optional)</label>
                                <div className="image-upload-wrapper">
                                    <div className="image-preview" style={{ backgroundImage: `url(${imagePreview || '/default-avatar.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        {!imagePreview && <span className="upload-placeholder">📸</span>}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="image-upload-input" id="doc-img-upload" />
                                    <label htmlFor="doc-img-upload" className="image-upload-btn">Choose Image</label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input className="form-input" required value={docForm.full_name} onChange={e => setDocForm({...docForm, full_name: e.target.value})} placeholder="Dr. John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Specialization</label>
                                <input className="form-input" required value={docForm.specialization} onChange={e => setDocForm({...docForm, specialization: e.target.value})} placeholder="Cardiologist" />
                            </div>
                            <div className="form-group">
                                <label>Contact</label>
                                <input className="form-input" required value={docForm.contact_number} onChange={e => setDocForm({...docForm, contact_number: e.target.value})} placeholder="+1 234 567" />
                            </div>
                            <div className="form-group">
                                <label>Assign to Hospital</label>
                                <select className="form-input" required value={docForm.facility_id} onChange={e => setDocForm({...docForm, facility_id: e.target.value})}>
                                    {facilities.length === 0 && <option value="">No hospitals available</option>}
                                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name} ({f.facility_type})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Email / Username</label>
                                <input className="form-input" type="email" required value={docForm.email} onChange={e => setDocForm({...docForm, email: e.target.value})} placeholder="Email / Username" />
                            </div>
                            <div className="form-group">
                                <label>Temporary Password</label>
                                <input className="form-input" type="password" required value={docForm.password} onChange={e => setDocForm({...docForm, password: e.target.value})} placeholder="Temporary Password" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <button className="admin-btn" style={{ width: '100%' }} type="submit" disabled={docLoading || facilities.length === 0}>
                                    {docLoading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="admin-card table-card">
                        <h2>Directory</h2>
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Specialization</th>
                                        <th>Hospital</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map(d => (
                                        <tr key={d.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', backgroundImage: `url(${d.profile_image ? 'http://localhost:8000' + d.profile_image : ''})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {!d.profile_image && '🧑‍⚕️'}
                                                    </div>
                                                    <div>
                                                        <strong>Dr. {d.full_name}</strong><br/>
                                                        <small>{d.contact_number}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{d.specialization}</td>
                                            <td><span className="badge">{d.facility_name || 'Unassigned'}</span></td>
                                            <td><button className="danger-btn" onClick={() => handleDeleteDoctor(d.id)}>Revoke</button></td>
                                        </tr>
                                    ))}
                                    {doctors.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>No doctors found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* FACILITIES TAB */}
            {activeTab === 'facilities' && (
                <div className="admin-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="admin-card">
                        <h2>🏥 Register Facility</h2>
                        {facMsg.text && <div className={`msg ${facMsg.type}`}>{facMsg.text}</div>}
                        <form className="admin-form" onSubmit={handleFacSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Facility Name</label>
                                <input className="form-input" required value={facForm.name} onChange={e => setFacForm({...facForm, name: e.target.value})} placeholder="City General Hospital" />
                            </div>
                            <div className="form-group">
                                <label>Facility Type</label>
                                <select className="form-input" value={facForm.facility_type} onChange={e => setFacForm({...facForm, facility_type: e.target.value})}>
                                    <option value="Hospital">Hospital</option>
                                    <option value="Clinic">Clinic</option>
                                    <option value="Lab">Laboratory</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Address / Location</label>
                                <textarea className="form-input" rows="3" required value={facForm.address} onChange={e => setFacForm({...facForm, address: e.target.value})} placeholder="123 Health Ave..." />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <button className="admin-btn" style={{ width: '100%' }} type="submit" disabled={facLoading}>
                                    {facLoading ? 'Adding...' : 'Add Facility'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="admin-card table-card">
                        <h2>Directory</h2>
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Facility</th>
                                        <th>Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facilities.map(f => (
                                        <tr key={f.id}>
                                            <td><strong>{f.name}</strong><br/><small>{f.address}</small></td>
                                            <td><span className="badge blue">{f.facility_type}</span></td>
                                            <td><button className="danger-btn" onClick={() => handleDeleteFacility(f.id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                    {facilities.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>No facilities found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
