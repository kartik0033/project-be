import React, { useState, useEffect } from 'react';
import api from '../api';

const Records = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', file: null });

    useEffect(() => {
        fetchRecords();
    }, []);

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
        setUploading(true);
        setError('');
        setSuccess('');
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('file', formData.file);
        try {
            await api.post('/medical/records/', data);
            setSuccess('Record uploaded successfully!');
            setShowUpload(false);
            setFormData({ title: '', description: '', file: null });
            fetchRecords();
        } catch (err) {
            setError('Upload failed. Please try again.');
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

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '1.8rem' }}>🗂️ My Medical Records</h1>
                <button
                    id="upload-record-btn"
                    onClick={() => { setShowUpload(true); setError(''); setSuccess(''); }}
                    style={{
                        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
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
                                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                                <th style={{ padding: '14px 20px', textAlign: 'center', color: '#555', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((rec, idx) => (
                                <tr key={rec.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? 'white' : '#fafafa', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 20px', fontSize: '1.6rem' }}>{getFileIcon(rec.file)}</td>
                                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#2c3e50' }}>{rec.title}</td>
                                    <td style={{ padding: '16px 20px', color: '#7f8c8d', fontSize: '0.9rem' }}>{rec.description || <span style={{ color: '#ccc', fontStyle: 'italic' }}>No description</span>}</td>
                                    <td style={{ padding: '16px 20px', color: '#7f8c8d', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{formatDate(rec.date_uploaded)}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <a
                                                href={rec.file.startsWith('http') ? rec.file : `http://127.0.0.1:8000${rec.file}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    padding: '6px 14px', background: '#dcfce7', color: '#4ade80',
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
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 24px 0', color: '#2c3e50', fontSize: '1.3rem' }}>📤 Upload Medical Record</h3>

                        {error && <div style={{ background: '#fadbd8', color: '#c0392b', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>⚠️ {error}</div>}

                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>Title *</label>
                                <input
                                    id="record-title"
                                    type="text"
                                    placeholder="e.g. Blood Test Report"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                />
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
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#555', fontSize: '0.9rem' }}>File * (PDF, Image, Doc)</label>
                                <input
                                    id="record-file"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
                                        padding: '10px 24px', background: uploading ? '#aaa' : 'linear-gradient(135deg, #4ade80, #22c55e)',
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
