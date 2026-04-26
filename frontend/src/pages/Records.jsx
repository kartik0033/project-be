import React, { useState, useEffect } from 'react';
import api from '../api';


const Records = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', file: null, report_time: '', provider_facility: '', report_type: '' });

    const [categories, setCategories] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [isOtherFacility, setIsOtherFacility] = useState(false);
    const [customFacilityName, setCustomFacilityName] = useState('');

    useEffect(() => {
        fetchRecords();
        fetchOptions();
    }, []);

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

    const fetchRecords = async () => {
        try {
            const res = await api.get('/medical/records/');
            setRecords(res.data);
        } catch (err) {
            setError('Failed to load medical records.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            setError('Please select a file to upload.');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (formData.file.size > maxSize) {
            setError('File size must be less than 5MB.');
            return;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(formData.file.type)) {
            setError('Only PDF, JPG, and PNG files are allowed.');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');
        let finalFacilityId = formData.provider_facility;
        if (isOtherFacility && customFacilityName) {
            try {
                const res = await api.post('/medical/facilities/', { name: customFacilityName, facility_type: 'Other' });
                finalFacilityId = res.data.id;
                // Add to local list so it shows next time
                setFacilities([...facilities, res.data]);
            } catch (err) {
                setError('Failed to create custom facility.');
                setUploading(false);
                return;
            }
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        if (formData.report_type) data.append('report_type', formData.report_type);
        if (formData.report_time) {
            const isoTime = new Date(formData.report_time).toISOString();
            data.append('report_time', isoTime);
        }
        if (finalFacilityId) data.append('provider_facility', finalFacilityId);
        data.append('file', formData.file);
        try {
            await api.post('/medical/records/', data);
            setSuccess('Record uploaded successfully!');
            setShowUpload(false);
            setFormData({ title: '', description: '', file: null, report_time: '', provider_facility: '', report_type: '' });
            setIsOtherFacility(false);
            setCustomFacilityName('');
            fetchRecords();
        } catch (err) {
            console.error('Upload Error:', err.response || err);
            const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            setError(`Upload failed: ${errorDetails}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await api.delete(`/medical/records/${id}/`);
            setRecords(records.filter(r => r.id !== id));
            setSuccess('Record deleted.');
        } catch {
            setError('Failed to delete record.');
        }
    };

    const getFileIcon = (fileUrl) => {
        if (!fileUrl) return '📄';
        const ext = fileUrl.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return '📕';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
        if (['doc', 'docx'].includes(ext)) return '📝';
        return '📄';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '1.8rem' }}>🗂️ My Medical Records</h1>
                <button
                    id="upload-record-btn"
                    onClick={() => { 
                        setShowUpload(true); 
                        setError(''); 
                        setSuccess(''); 
                        setFormData(prev => ({ ...prev, report_time: getCurrentDateTimeLocal(), report_type: '', provider_facility: '' }));
                        setIsOtherFacility(false);
                        setCustomFacilityName('');
                    }}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #22c55e)',
                        color: 'white', padding: '10px 20px', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(74,144,226,0.3)', fontSize: '0.95rem'
                    }}
                >
                    + Upload Record
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div style={{ background: '#fadbd8', color: '#c0392b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #f1948a' }}>
                    ⚠️ {error}
                </div>
            )}
            {success && (
                <div style={{ background: '#d5f5e3', color: '#1e8449', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #82e0aa' }}>
                    ✅ {success}
                </div>
            )}

            {/* Records List */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                        <p>Loading records...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                        <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No medical records yet.</p>
                        <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Upload your first record to get started.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>File</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Provider</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Report Time</th>
                                <th style={{ padding: '14px 20px', textAlign: 'center', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((rec, idx) => (
                                <tr key={rec.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? 'white' : '#fafafa', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 20px', fontSize: '1.6rem' }}>{getFileIcon(rec.file)}</td>
                                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#2c3e50' }}>{rec.title}</td>
                                    <td style={{ padding: '16px 20px', color: '#7f8c8d', fontSize: '0.9rem' }}>{rec.description || <span style={{ color: '#ccc', fontStyle: 'italic' }}>No description</span>}</td>
                                    <td style={{ padding: '16px 20px', color: '#7f8c8d', fontSize: '0.9rem' }}>{rec.provider_facility_name || <span style={{ color: '#ccc', fontStyle: 'italic' }}>-</span>}</td>
                                    <td style={{ padding: '16px 20px', color: '#7f8c8d', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{rec.report_time ? formatDateTime(rec.report_time) : formatDate(rec.date_uploaded)}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <a
                                                href={rec.file.startsWith('http') ? rec.file : `http://127.0.0.1:8000${rec.file}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    padding: '6px 14px', background: '#dcfce7', color: '#3b82f6',
                                                    borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600'
                                                }}
                                            >
                                                View
                                            </a>
                                            <button
                                                onClick={() => handleDelete(rec.id)}
                                                style={{
                                                    padding: '6px 14px', background: '#fdecea', color: '#e74c3c',
                                                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 24px 0', color: '#2c3e50', fontSize: '1.3rem' }}>📤 Upload Medical Record</h3>

                        {error && <div style={{ background: '#fadbd8', color: '#c0392b', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>⚠️ {error}</div>}

                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Report Type *</label>
                                <select
                                    value={formData.report_type}
                                    onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'white' }}
                                >
                                    <option value="" disabled>Select Report Type</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Title *</label>
                                <input
                                    id="record-title"
                                    type="text"
                                    autoComplete="off"
                                    list="title-suggestions"
                                    placeholder="Enter report name (e.g., Blood Test, Chest X-ray)"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                />
                                {formData.report_type && categories.find(c => c.id == formData.report_type)?.suggestions?.length > 0 && (
                                    <datalist id="title-suggestions">
                                        {categories.find(c => c.id == formData.report_type).suggestions.map(sugg => (
                                            <option key={sugg.id} value={sugg.suggested_title} />
                                        ))}
                                    </datalist>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    id="record-description"
                                    placeholder="Optional notes..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Report Time</label>
                                <input
                                    id="record-report-time"
                                    type="datetime-local"
                                    value={formData.report_time}
                                    onChange={(e) => setFormData({ ...formData, report_time: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Provider / Facility</label>
                                {!isOtherFacility ? (
                                    <select
                                        value={formData.provider_facility}
                                        onChange={(e) => {
                                            if (e.target.value === 'other') {
                                                setIsOtherFacility(true);
                                                setFormData({ ...formData, provider_facility: '' });
                                            } else {
                                                setFormData({ ...formData, provider_facility: e.target.value });
                                            }
                                        }}
                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'white' }}
                                    >
                                        <option value="">Select Facility</option>
                                        {facilities.map(fac => <option key={fac.id} value={fac.id}>{fac.name}</option>)}
                                        <option value="other">+ Add New Facility (Other)</option>
                                    </select>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter facility name"
                                            value={customFacilityName}
                                            onChange={(e) => setCustomFacilityName(e.target.value)}
                                            style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                            required
                                        />
                                        <button type="button" onClick={() => { setIsOtherFacility(false); setCustomFacilityName(''); }} style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid #ccc', background: '#f9f9f9', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>File * (PDF, JPG, PNG - Max 5MB)</label>
                                <input
                                    id="record-file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1px dashed #ccc', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', cursor: 'pointer' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowUpload(false); setError(''); }}
                                    style={{ padding: '10px 20px', background: '#eee', color: '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{
                                        padding: '10px 24px', background: uploading ? '#aaa' : 'linear-gradient(135deg, #3b82f6, #22c55e)',
                                        color: 'white', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600'
                                    }}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Records;
