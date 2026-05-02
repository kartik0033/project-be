import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MedicineInput from '../components/MedicineInput';
import PrescriptionPrint from '../components/PrescriptionPrint';
import './DoctorDashboard.css';

const StatusBadge = ({ status }) => {
    const colors = { 
        Pending: { bg: '#fef3c7', color: '#92400e' }, 
        Confirmed: { bg: '#dcfce7', color: '#166534' }, 
        Completed: { bg: '#eff6ff', color: '#1d4ed8' }, 
        Cancelled: { bg: '#fee2e2', color: '#991b1b' } 
    };
    const style = colors[status] || { bg: '#f1f5f9', color: '#475569' };
    return (
        <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800', background: style.bg, color: style.color }}>
            {status}
        </span>
    );
};

const DoctorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = window.location.pathname;
    const activeTab = location.includes('doctor-manage') ? 'manage' : 'overview';
    const [appointments, setAppointments] = useState([]);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [patientRecords, setPatientRecords] = useState([]);
    const [patientPrescriptions, setPatientPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [printRx, setPrintRx] = useState(null);
    const [rxMsg, setRxMsg] = useState('');
    const [rxForm, setRxForm] = useState({
        diagnosis: '', notes: '', items: [{ medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }]
    });

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/medical/appointments/');
            setAppointments(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const selectAppointment = async (appt) => {
        setSelectedAppt(appt);
        setRxMsg('');
        setRxForm({ diagnosis: '', notes: '', items: [{ medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }] });
        try {
            const [recRes, rxRes] = await Promise.all([
                api.get(`/medical/records/?patient=${appt.patient}`),
                api.get(`/medical/prescriptions/?patient=${appt.patient}`)
            ]);
            setPatientRecords(recRes.data);
            setPatientPrescriptions(rxRes.data);
        } catch (e) { console.error(e); }
    };

    const handleStatusUpdate = async (id, status) => {
        await api.patch(`/medical/appointments/${id}/`, { status });
        fetchAppointments();
        if (selectedAppt?.id === id) setSelectedAppt(a => ({ ...a, status }));
    };

    const addRxItem = () => setRxForm(f => ({ ...f, items: [...f.items, { medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }] }));
    const removeRxItem = (i) => setRxForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
    const updateRxItem = (i, field, val) => setRxForm(f => { const items = [...f.items]; items[i][field] = val; return { ...f, items }; });

    const submitPrescription = async (e) => {
        e.preventDefault();
        setRxMsg('');
        try {
            await api.post('/medical/prescriptions/', { ...rxForm, patient: selectedAppt.patient, appointment: selectedAppt.id });
            setRxMsg('✅ Prescription saved securely!');
            setRxForm({ diagnosis: '', notes: '', items: [{ medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }] });
            const rxRes = await api.get(`/medical/prescriptions/?patient=${selectedAppt.patient}`);
            setPatientPrescriptions(rxRes.data);
        } catch (e) { setRxMsg('❌ Failed to save prescription.'); }
    };

    const pending = appointments.filter(a => a.status === 'Pending').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
    const confirmedAppts = appointments.filter(a => a.status === 'Confirmed');

    return (
        <>
        <div className="doc-dashboard-container">

            <div className="doc-content">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div>
                        <div className="doc-greeting" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: '#e2e8f0',
                                backgroundImage: `url(${user?.profile_image ? 'http://localhost:8000' + user.profile_image : ''})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.8rem',
                                border: '3px solid white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}>
                                {!user?.profile_image && '🧑‍⚕️'}
                            </div>
                            <div>
                                Good day, Dr. {user?.full_name?.split(' ')[0]}! 👋
                                <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>
                                    {user?.specialization}
                                </div>
                            </div>
                        </div>

                        {/* Stat Widgets */}
                        <div className="stat-grid">
                            {[
                                { label: 'Total Appointments', value: appointments.length, icon: '📅', color: '#8b5cf6' },
                                { label: 'Pending Requests', value: pending, icon: '⏳', color: '#f59e0b' },
                                { label: 'Confirmed Today', value: confirmed, icon: '✅', color: '#10b981' },
                                { label: 'Completed Visits', value: appointments.filter(a => a.status === 'Completed').length, icon: '🏁', color: '#3b82f6' },
                            ].map(w => (
                                <div key={w.label} className="stat-widget">
                                    <div className="stat-icon" style={{ background: `${w.color}18`, color: w.color }}>{w.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{w.label}</div>
                                        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{w.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pending Requests */}
                        <div className="doc-card">
                            <div className="doc-card-header">
                                <h3>⏳ Pending Appointment Requests</h3>
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '0.85rem' }}>{pending} pending</span>
                            </div>
                            {appointments.filter(a => a.status === 'Pending').length === 0
                                ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px', fontSize: '1.1rem', fontWeight: '600' }}>No pending requests 🎉</p>
                                : appointments.filter(a => a.status === 'Pending').map(app => (
                                    <div key={app.id} className="doc-list-item pending">
                                        <div>
                                            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{app.patient_name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '5px' }}>📅 {app.appointment_date} at {app.appointment_time}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn-accept" onClick={() => handleStatusUpdate(app.id, 'Confirmed')}>✓ Accept</button>
                                            <button className="btn-decline" onClick={() => handleStatusUpdate(app.id, 'Cancelled')}>✕ Decline</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* MANAGE PATIENTS TAB */}
                {activeTab === 'manage' && (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedAppt ? '400px 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>

                        {/* LEFT — Confirmed Appointment List */}
                        <div>
                            <h2 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '25px', fontSize: '1.5rem' }}>👥 Confirmed Patients</h2>
                            {loading ? <div className="doc-card" style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>Loading Patients...</div> : confirmedAppts.length === 0
                                ? <div className="doc-card" style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>No confirmed appointments yet.</div>
                                : confirmedAppts.map(app => (
                                    <div key={app.id} className={`doc-card doc-list-item selectable ${selectedAppt?.id === app.id ? 'selected' : ''}`} onClick={() => selectAppointment(app)} style={{ padding: '25px', marginBottom: '15px' }}>
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                    <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>👤</div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{app.patient_name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>📅 {app.appointment_date} · {app.appointment_time}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                                <StatusBadge status={app.status} />
                                                {selectedAppt?.id !== app.id && <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '800' }}>Manage →</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        {/* RIGHT — Patient Management Panel */}
                        {selectedAppt && (
                            <div>
                                {/* Header */}
                                <div className="doc-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 5px 0', color: '#1e293b', fontWeight: '800', fontSize: '1.8rem' }}>{selectedAppt.patient_name}</h2>
                                            <div style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>📅 {selectedAppt.appointment_date} at {selectedAppt.appointment_time}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <StatusBadge status={selectedAppt.status} />
                                            {selectedAppt.status === 'Confirmed' && (
                                                <button className="btn-primary" onClick={() => handleStatusUpdate(selectedAppt.id, 'Completed')}>
                                                    🏁 Mark Completed
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Records */}
                                <div className="doc-card">
                                    <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontWeight: '800', fontSize: '1.3rem' }}>📄 Medical Vault</h3>
                                    {patientRecords.length === 0
                                        ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontWeight: '600' }}>No records uploaded by this patient.</p>
                                        : patientRecords.map(r => (
                                            <div key={r.id} className="doc-list-item">
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '1.8rem' }}>📋</span>
                                                    <div>
                                                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{r.title}</div>
                                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '2px' }}>{r.report_type_name || 'Report'} · {new Date(r.date_uploaded).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                {r.file && <a href={`http://127.0.0.1:8000${r.file}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>View Document</a>}
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Prescription Form */}
                                <div className="doc-card">
                                    <h3 style={{ margin: '0 0 25px 0', color: '#1e293b', fontWeight: '800', fontSize: '1.3rem' }}>💊 Write e-Prescription</h3>
                                    <form onSubmit={submitPrescription}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label className="form-label">Diagnosis</label>
                                            <input className="form-input" value={rxForm.diagnosis} onChange={e => setRxForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Viral fever, Hypertension" />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <label className="form-label" style={{ margin: 0 }}>Medicines</label>
                                                <button type="button" onClick={addRxItem} className="btn-secondary">+ Add Medicine</button>
                                            </div>
                                            {rxForm.items.map((item, i) => (
                                                <div key={i} style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                                        <MedicineInput value={item.medicine_name} onChange={val => updateRxItem(i, 'medicine_name', val)} placeholder="Medicine name..." />
                                                        <input className="form-input" placeholder="Dosage (500mg)" value={item.dosage} onChange={e => updateRxItem(i, 'dosage', e.target.value)} required />
                                                        <select className="form-input" value={item.frequency} onChange={e => updateRxItem(i, 'frequency', e.target.value)}>
                                                            {[['OD', 'Once/day'], ['BD', 'Twice/day'], ['TDS', '3×/day'], ['QID', '4×/day'], ['SOS', 'As needed']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                                        </select>
                                                        <input className="form-input" placeholder="Duration (5 days)" value={item.duration} onChange={e => updateRxItem(i, 'duration', e.target.value)} />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                        <input className="form-input" placeholder="Instructions (e.g. After food)" value={item.instructions} onChange={e => updateRxItem(i, 'instructions', e.target.value)} style={{ flex: 1 }} />
                                                        {rxForm.items.length > 1 && <button type="button" onClick={() => removeRxItem(i)} className="btn-decline" style={{ padding: '12px 18px' }}>✕</button>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginBottom: '25px' }}>
                                            <label className="form-label">Doctor's Notes</label>
                                            <textarea className="form-input" value={rxForm.notes} onChange={e => setRxForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional advice, follow-up instructions..." rows={3} style={{ resize: 'vertical' }} />
                                        </div>

                                        {rxMsg && <div style={{ padding: '15px', borderRadius: '12px', background: rxMsg.includes('✅') ? '#dcfce7' : '#fee2e2', color: rxMsg.includes('✅') ? '#166534' : '#991b1b', marginBottom: '20px', fontWeight: '800', fontSize: '1.05rem' }}>{rxMsg}</div>}

                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <button type="submit" className="btn-primary">💾 Save Prescription</button>
                                            <button type="button" onClick={() => setPrintRx({ ...rxForm, created_at: new Date() })} className="btn-secondary">👁️ Preview / Print</button>
                                        </div>
                                    </form>
                                </div>

                                {/* Past Prescriptions */}
                                {patientPrescriptions.length > 0 && (
                                    <div className="doc-card">
                                        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontWeight: '800', fontSize: '1.3rem' }}>📜 Prescription History</h3>
                                        {patientPrescriptions.map(rx => (
                                            <div key={rx.id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                    <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{rx.diagnosis || 'General Diagnosis'}</span>
                                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>{new Date(rx.created_at).toLocaleDateString()}</span>
                                                        <button className="btn-secondary" onClick={() => setPrintRx(rx)}>🖨️ Print</button>
                                                    </div>
                                                </div>
                                                {rx.items.map((item, i) => (
                                                    <div key={i} style={{ fontSize: '0.95rem', color: '#475569', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                        💊 <strong style={{ color: '#1e293b' }}>{item.medicine_name}</strong> — {item.dosage} · {item.frequency_display} · {item.duration}
                                                    </div>
                                                ))}
                                                {rx.notes && <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b', background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>📝 <strong>Notes:</strong> {rx.notes}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {printRx && (
            <PrescriptionPrint
                prescription={printRx}
                doctor={user}
                patient={selectedAppt ? { name: selectedAppt.patient_name, aadhaar: selectedAppt.patient } : null}
                onClose={() => setPrintRx(null)}
            />
        )}
        </>
    );
};

export default DoctorDashboard;
