import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MedicineInput from '../components/MedicineInput';
import PrescriptionPrint from '../components/PrescriptionPrint';

const CARD = { background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const INPUT = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' };
const LABEL = { display: 'block', marginBottom: '7px', fontWeight: '600', color: '#475569', fontSize: '0.88rem' };

const TAB_STYLE = (active) => ({
    padding: '10px 22px', borderRadius: '10px', border: 'none',
    background: active ? '#2563eb' : '#f1f5f9',
    color: active ? 'white' : '#475569',
    fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem'
});

const StatusBadge = ({ status }) => {
    const colors = { Pending: ['#fef3c7', '#92400e'], Confirmed: ['#dcfce7', '#166534'], Completed: ['#eff6ff', '#1d4ed8'], Cancelled: ['#fee2e2', '#991b1b'] };
    const [bg, color] = colors[status] || ['#f1f5f9', '#475569'];
    return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: bg, color }}>{status}</span>;
};

const DoctorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
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
            setRxMsg('✅ Prescription saved!');
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
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

            {/* Top Nav */}
            <div style={{ background: 'white', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#2563eb', color: 'white', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🩺</div>
                    <div>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>Dr. {user?.full_name || 'Doctor'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{user?.specialization || 'Medical Practitioner'}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[['overview', '🏠 Overview'], ['manage', '👥 Manage Patients'], ['scanner', '📷 Scanner']].map(([tab, label]) => (
                        <button key={tab} style={TAB_STYLE(activeTab === tab)} onClick={() => { if (tab === 'scanner') navigate('/scanner'); else { setActiveTab(tab); setSelectedAppt(null); } }}>{label}</button>
                    ))}
                    <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '10px 18px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                </div>
            </div>

            <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '35px 30px' }}>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div>
                        <h1 style={{ color: '#1e293b', fontWeight: '800', fontSize: '2rem', marginBottom: '30px' }}>Good day, Dr. {user?.full_name?.split(' ')[0]}! 👋</h1>

                        {/* Stat Widgets */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                            {[
                                { label: 'Total Appointments', value: appointments.length, icon: '📅', color: '#8b5cf6' },
                                { label: 'Pending', value: pending, icon: '⏳', color: '#f59e0b' },
                                { label: 'Confirmed', value: confirmed, icon: '✅', color: '#10b981' },
                                { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, icon: '🏁', color: '#3b82f6' },
                            ].map(w => (
                                <div key={w.label} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ background: `${w.color}18`, padding: '14px', borderRadius: '14px', fontSize: '1.5rem' }}>{w.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{w.label}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e293b' }}>{w.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pending Requests */}
                        <div style={CARD}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>⏳ Pending Appointment Requests</h3>
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>{pending} pending</span>
                            </div>
                            {appointments.filter(a => a.status === 'Pending').length === 0
                                ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No pending requests 🎉</p>
                                : appointments.filter(a => a.status === 'Pending').map(app => (
                                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fffbeb', borderRadius: '14px', marginBottom: '12px', border: '1px solid #fde68a' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.05rem' }}>{app.patient_name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '3px' }}>📅 {app.appointment_date} at {app.appointment_time}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleStatusUpdate(app.id, 'Confirmed')} style={{ padding: '8px 18px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✓ Accept</button>
                                            <button onClick={() => handleStatusUpdate(app.id, 'Cancelled')} style={{ padding: '8px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Decline</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* MANAGE PATIENTS TAB */}
                {activeTab === 'manage' && (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedAppt ? '360px 1fr' : '1fr', gap: '25px', alignItems: 'start' }}>

                        {/* LEFT — Confirmed Appointment List */}
                        <div>
                            <h2 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '20px', fontSize: '1.4rem' }}>👥 Confirmed Patients</h2>
                            {loading ? <p>Loading...</p> : confirmedAppts.length === 0
                                ? <div style={{ ...CARD, textAlign: 'center', color: '#94a3b8' }}>No confirmed appointments yet.</div>
                                : confirmedAppts.map(app => (
                                    <div key={app.id}
                                        onClick={() => selectAppointment(app)}
                                        style={{ ...CARD, marginBottom: '14px', cursor: 'pointer', border: selectedAppt?.id === app.id ? '2px solid #2563eb' : '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseOver={e => { if (selectedAppt?.id !== app.id) e.currentTarget.style.borderColor = '#93c5fd'; }}
                                        onMouseOut={e => { if (selectedAppt?.id !== app.id) e.currentTarget.style.borderColor = '#f1f5f9'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '45px', height: '45px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>👤</div>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{app.patient_name}</div>
                                                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>📅 {app.appointment_date} · {app.appointment_time}</div>
                                                </div>
                                            </div>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        {selectedAppt?.id !== app.id && <div style={{ marginTop: '12px', fontSize: '0.82rem', color: '#3b82f6', fontWeight: 'bold' }}>Click to manage →</div>}
                                    </div>
                                ))
                            }
                        </div>

                        {/* RIGHT — Patient Management Panel */}
                        {selectedAppt && (
                            <div>
                                {/* Header */}
                                <div style={{ ...CARD, marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ margin: '0 0 4px 0', color: '#1e293b', fontWeight: '800', fontSize: '1.5rem' }}>{selectedAppt.patient_name}</h2>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>📅 {selectedAppt.appointment_date} at {selectedAppt.appointment_time}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <StatusBadge status={selectedAppt.status} />
                                            {selectedAppt.status === 'Confirmed' && (
                                                <button onClick={() => handleStatusUpdate(selectedAppt.id, 'Completed')}
                                                    style={{ padding: '9px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    🏁 Mark as Completed
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Records */}
                                <div style={{ ...CARD, marginBottom: '20px' }}>
                                    <h3 style={{ margin: '0 0 18px 0', color: '#1e293b', fontWeight: '800' }}>📄 Patient's Medical Records</h3>
                                    {patientRecords.length === 0
                                        ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No records uploaded by this patient.</p>
                                        : patientRecords.map(r => (
                                            <div key={r.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.5rem' }}>📋</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{r.title}</div>
                                                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.report_type_name || 'Report'} · {new Date(r.date_uploaded).toLocaleDateString()}</div>
                                                </div>
                                                {r.file && <a href={`http://127.0.0.1:8000${r.file}`} target="_blank" rel="noreferrer" style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}>View</a>}
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Prescription Form */}
                                <div style={{ ...CARD, marginBottom: '20px' }}>
                                    <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontWeight: '800' }}>💊 Write Prescription</h3>
                                    <form onSubmit={submitPrescription}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={LABEL}>Diagnosis</label>
                                            <input value={rxForm.diagnosis} onChange={e => setRxForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Viral fever, Hypertension" style={INPUT} />
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <label style={{ ...LABEL, margin: 0 }}>Medicines</label>
                                                <button type="button" onClick={addRxItem} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>+ Add Medicine</button>
                                            </div>
                                            {rxForm.items.map((item, i) => (
                                                <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                                                        <MedicineInput value={item.medicine_name} onChange={val => updateRxItem(i, 'medicine_name', val)} placeholder="Type medicine name..." />
                                                        <input placeholder="Dosage (e.g. 500mg)" value={item.dosage} onChange={e => updateRxItem(i, 'dosage', e.target.value)} style={INPUT} required />
                                                        <select value={item.frequency} onChange={e => updateRxItem(i, 'frequency', e.target.value)} style={INPUT}>
                                                            {[['OD', 'Once/day'], ['BD', 'Twice/day'], ['TDS', '3×/day'], ['QID', '4×/day'], ['SOS', 'As needed']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                                        </select>
                                                        <input placeholder="Duration (e.g. 5 days)" value={item.duration} onChange={e => updateRxItem(i, 'duration', e.target.value)} style={INPUT} />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input placeholder="Instructions (e.g. After food)" value={item.instructions} onChange={e => updateRxItem(i, 'instructions', e.target.value)} style={{ ...INPUT, flex: 1 }} />
                                                        {rxForm.items.length > 1 && <button type="button" onClick={() => removeRxItem(i)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginBottom: '18px' }}>
                                            <label style={LABEL}>Doctor's Notes</label>
                                            <textarea value={rxForm.notes} onChange={e => setRxForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional advice, follow-up instructions..." rows={3} style={{ ...INPUT, resize: 'vertical' }} />
                                        </div>

                                        {rxMsg && <div style={{ padding: '12px', borderRadius: '10px', background: rxMsg.includes('✅') ? '#dcfce7' : '#fee2e2', color: rxMsg.includes('✅') ? '#166534' : '#991b1b', marginBottom: '15px', fontWeight: 'bold' }}>{rxMsg}</div>}

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>💾 Save Prescription</button>
                                            <button type="button" onClick={() => setPrintRx({ ...rxForm, created_at: new Date() })} style={{ background: '#f1f5f9', color: '#475569', padding: '12px 24px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>👁️ Preview</button>
                                        </div>
                                    </form>
                                </div>

                                {/* Past Prescriptions */}
                                {patientPrescriptions.length > 0 && (
                                    <div style={CARD}>
                                        <h3 style={{ margin: '0 0 18px 0', color: '#1e293b', fontWeight: '800' }}>📜 Previous Prescriptions</h3>
                                        {patientPrescriptions.map(rx => (
                                            <div key={rx.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{rx.diagnosis || 'General'}</span>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(rx.created_at).toLocaleDateString()}</span>
                                                        <button onClick={() => setPrintRx(rx)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>🖨️ Print</button>
                                                    </div>
                                                </div>
                                                {rx.items.map((item, i) => (
                                                    <div key={i} style={{ fontSize: '0.85rem', color: '#475569', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                        💊 <strong>{item.medicine_name}</strong> — {item.dosage} · {item.frequency_display} · {item.duration}
                                                    </div>
                                                ))}
                                                {rx.notes && <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>📝 {rx.notes}</div>}
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
