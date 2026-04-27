import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TAB_STYLE = (active) => ({
    padding: '10px 22px', borderRadius: '10px', border: 'none',
    background: active ? '#2563eb' : '#f1f5f9',
    color: active ? 'white' : '#475569',
    fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem'
});

const CARD = { background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };

const StatusBadge = ({ status }) => {
    const colors = { Pending: ['#fef3c7','#92400e'], Confirmed: ['#dcfce7','#166534'], Completed: ['#eff6ff','#1d4ed8'], Cancelled: ['#fee2e2','#991b1b'] };
    const [bg, color] = colors[status] || ['#f1f5f9','#475569'];
    return <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: bg, color }}>{status}</span>;
};

const DoctorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientRecords, setPatientRecords] = useState([]);
    const [patientPrescriptions, setPatientPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Prescription form state
    const [rxForm, setRxForm] = useState({ diagnosis: '', notes: '', appointment: '', items: [{ medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }] });
    const [rxMsg, setRxMsg] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [apptRes, patientsRes] = await Promise.all([
                api.get('/medical/appointments/'),
                api.get('/medical/doctor/patients/')
            ]);
            setAppointments(apptRes.data);
            setPatients(patientsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleStatusUpdate = async (id, status) => {
        await api.patch(`/medical/appointments/${id}/`, { status });
        fetchAll();
    };

    const selectPatient = async (patient) => {
        setSelectedPatient(patient);
        setActiveTab('patient-detail');
        try {
            const [recRes, rxRes] = await Promise.all([
                api.get(`/medical/records/?patient=${patient.patient_id}`),
                api.get(`/medical/prescriptions/?patient=${patient.patient_id}`)
            ]);
            setPatientRecords(recRes.data);
            setPatientPrescriptions(rxRes.data);
        } catch (e) { console.error(e); }
    };

    const addRxItem = () => setRxForm(f => ({ ...f, items: [...f.items, { medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }] }));
    const removeRxItem = (i) => setRxForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
    const updateRxItem = (i, field, val) => setRxForm(f => { const items = [...f.items]; items[i][field] = val; return { ...f, items }; });

    const submitPrescription = async (e) => {
        e.preventDefault();
        setRxMsg('');
        try {
            await api.post('/medical/prescriptions/', { ...rxForm, patient: selectedPatient.patient_id });
            setRxMsg('✅ Prescription saved successfully!');
            setRxForm({ diagnosis: '', notes: '', appointment: '', items: [{ medicine_name: '', dosage: '', frequency: 'OD', duration: '', instructions: '' }] });
            const rxRes = await api.get(`/medical/prescriptions/?patient=${selectedPatient.patient_id}`);
            setPatientPrescriptions(rxRes.data);
        } catch (e) {
            setRxMsg('❌ Failed to save prescription.');
        }
    };

    const pending = appointments.filter(a => a.status === 'Pending').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.aadhaar.includes(searchQuery));

    const INPUT = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' };
    const LABEL = { display: 'block', marginBottom: '7px', fontWeight: '600', color: '#475569', fontSize: '0.88rem' };

    return (
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
                    {[['overview','🏠 Overview'], ['patients','👥 Patients'], ['appointments','📅 Schedule'], ['scanner','📷 Scanner']].map(([tab, label]) => (
                        <button key={tab} style={TAB_STYLE(activeTab === tab)} onClick={() => { if (tab === 'scanner') navigate('/scanner'); else setActiveTab(tab); }}>{label}</button>
                    ))}
                    <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '10px 18px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '35px 30px' }}>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div>
                        <h1 style={{ color: '#1e293b', fontWeight: '800', fontSize: '2rem', marginBottom: '30px' }}>Good Morning, Dr. {user?.full_name?.split(' ')[0]}! 👋</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                            {[
                                { label: 'Total Patients', value: patients.length, icon: '👥', color: '#3b82f6' },
                                { label: 'Pending', value: pending, icon: '⏳', color: '#f59e0b' },
                                { label: 'Confirmed', value: confirmed, icon: '✅', color: '#10b981' },
                                { label: 'Total Appointments', value: appointments.length, icon: '📅', color: '#8b5cf6' },
                            ].map(w => (
                                <div key={w.label} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ background: `${w.color}15`, padding: '14px', borderRadius: '14px', fontSize: '1.5rem' }}>{w.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{w.label}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e293b' }}>{w.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Appointments */}
                        <div style={CARD}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontWeight: '800' }}>Recent Appointment Requests</h3>
                            {appointments.filter(a => a.status === 'Pending').slice(0, 5).map(app => (
                                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{app.patient_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📅 {app.appointment_date} at {app.appointment_time}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <StatusBadge status={app.status} />
                                        <button onClick={() => handleStatusUpdate(app.id, 'Confirmed')} style={{ padding: '6px 14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Accept</button>
                                        <button onClick={() => handleStatusUpdate(app.id, 'Cancelled')} style={{ padding: '6px 14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Decline</button>
                                    </div>
                                </div>
                            ))}
                            {appointments.filter(a => a.status === 'Pending').length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No pending requests.</p>}
                        </div>
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div>
                        <h2 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '25px' }}>👥 My Patients</h2>
                        <div style={{ ...CARD, marginBottom: '25px' }}>
                            <input placeholder="🔍 Search by name or Aadhaar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...INPUT, fontSize: '1rem' }} />
                        </div>
                        {loading ? <p>Loading...</p> : filteredPatients.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No patients found.</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {filteredPatients.map(p => (
                                    <div key={p.patient_id} style={{ ...CARD, cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        onClick={() => selectPatient(p)}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div style={{ width: '55px', height: '55px', borderRadius: '50%', overflow: 'hidden', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {p.profile_picture ? <img src={p.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.8rem' }}>👤</span>}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.05rem' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Aadhaar: {p.aadhaar} • Age: {p.age}</div>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                                    {p.blood_group && <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>🩸 {p.blood_group}</span>}
                                                    {p.chronic_conditions && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>⚕️ {p.chronic_conditions.substring(0, 20)}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '12px', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right' }}>View Full Profile →</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* PATIENT DETAIL TAB */}
                {activeTab === 'patient-detail' && selectedPatient && (
                    <div>
                        <button onClick={() => setActiveTab('patients')} style={{ marginBottom: '20px', background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>← Back to Patients</button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', marginBottom: '25px' }}>
                            <div style={CARD}>
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden' }}>
                                        {selectedPatient.profile_picture ? <img src={selectedPatient.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2.5rem' }}>👤</span>}
                                    </div>
                                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>{selectedPatient.name}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Aadhaar: {selectedPatient.aadhaar}</div>
                                </div>
                                {[['Age', selectedPatient.age + ' years'], ['Gender', selectedPatient.gender === 'M' ? 'Male' : selectedPatient.gender === 'F' ? 'Female' : 'Other'], ['Blood Group', selectedPatient.blood_group || 'N/A'], ['Mobile', selectedPatient.mobile], ['Allergies', selectedPatient.allergies || 'None'], ['Conditions', selectedPatient.chronic_conditions || 'None']].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 'bold' }}>{k}</span>
                                        <span style={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: '500', maxWidth: '60%', textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Prescription Form */}
                            <div style={CARD}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontWeight: '800' }}>💊 Write Prescription</h3>
                                <form onSubmit={submitPrescription}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{ gridColumn: '1/-1' }}>
                                            <label style={LABEL}>Diagnosis</label>
                                            <input value={rxForm.diagnosis} onChange={e => setRxForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Viral fever" style={INPUT} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <label style={{ ...LABEL, margin: 0 }}>Medicines</label>
                                            <button type="button" onClick={addRxItem} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>+ Add Medicine</button>
                                        </div>
                                        {rxForm.items.map((item, i) => (
                                            <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                                                    <input placeholder="Medicine name" value={item.medicine_name} onChange={e => updateRxItem(i, 'medicine_name', e.target.value)} style={INPUT} required />
                                                    <input placeholder="Dosage (e.g. 500mg)" value={item.dosage} onChange={e => updateRxItem(i, 'dosage', e.target.value)} style={INPUT} required />
                                                    <select value={item.frequency} onChange={e => updateRxItem(i, 'frequency', e.target.value)} style={INPUT}>
                                                        {[['OD','Once/day'],['BD','Twice/day'],['TDS','3x/day'],['QID','4x/day'],['SOS','As needed']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                                                    </select>
                                                    <input placeholder="Duration (e.g. 5 days)" value={item.duration} onChange={e => updateRxItem(i, 'duration', e.target.value)} style={INPUT} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <input placeholder="Special instructions (e.g. After food)" value={item.instructions} onChange={e => updateRxItem(i, 'instructions', e.target.value)} style={{ ...INPUT, flex: 1 }} />
                                                    {rxForm.items.length > 1 && <button type="button" onClick={() => removeRxItem(i)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={LABEL}>Doctor's Notes</label>
                                        <textarea value={rxForm.notes} onChange={e => setRxForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes or advice..." rows={3} style={{ ...INPUT, resize: 'vertical' }} />
                                    </div>
                                    {rxMsg && <div style={{ padding: '12px', borderRadius: '10px', background: rxMsg.includes('✅') ? '#dcfce7' : '#fee2e2', color: rxMsg.includes('✅') ? '#166534' : '#991b1b', marginBottom: '15px', fontWeight: 'bold' }}>{rxMsg}</div>}
                                    <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>💾 Save Prescription</button>
                                </form>
                            </div>
                        </div>

                        {/* Patient Records & Past Prescriptions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div style={CARD}>
                                <h3 style={{ margin: '0 0 18px 0', color: '#1e293b', fontWeight: '800' }}>📄 Medical Records</h3>
                                {patientRecords.length === 0 ? <p style={{ color: '#94a3b8' }}>No records uploaded.</p> : patientRecords.map(r => (
                                    <div key={r.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📋</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{r.title}</div>
                                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.report_type_name} • {new Date(r.date_uploaded).toLocaleDateString()}</div>
                                        </div>
                                        {r.file && <a href={`http://127.0.0.1:8000${r.file}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.85rem' }}>View</a>}
                                    </div>
                                ))}
                            </div>
                            <div style={CARD}>
                                <h3 style={{ margin: '0 0 18px 0', color: '#1e293b', fontWeight: '800' }}>💊 Past Prescriptions</h3>
                                {patientPrescriptions.length === 0 ? <p style={{ color: '#94a3b8' }}>No prescriptions yet.</p> : patientPrescriptions.map(rx => (
                                    <div key={rx.id} style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{rx.diagnosis || 'General'}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(rx.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {rx.items.map((item, i) => (
                                            <div key={i} style={{ fontSize: '0.85rem', color: '#475569', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                                                💊 <strong>{item.medicine_name}</strong> — {item.dosage} • {item.frequency_display} • {item.duration}
                                            </div>
                                        ))}
                                        {rx.notes && <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>📝 {rx.notes}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* APPOINTMENTS TAB */}
                {activeTab === 'appointments' && (
                    <div>
                        <h2 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '25px' }}>📅 Appointment Schedule</h2>
                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => {
                            const filtered = appointments.filter(a => a.status === status);
                            if (filtered.length === 0) return null;
                            return (
                                <div key={status} style={{ ...CARD, marginBottom: '25px' }}>
                                    <h3 style={{ margin: '0 0 18px 0', color: '#1e293b' }}><StatusBadge status={status} /> <span style={{ marginLeft: '10px' }}>{status} ({filtered.length})</span></h3>
                                    {filtered.map(app => (
                                        <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{app.patient_name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📅 {app.appointment_date} at {app.appointment_time}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {app.status === 'Pending' && <>
                                                    <button onClick={() => handleStatusUpdate(app.id, 'Confirmed')} style={{ padding: '7px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Accept</button>
                                                    <button onClick={() => handleStatusUpdate(app.id, 'Cancelled')} style={{ padding: '7px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Decline</button>
                                                </>}
                                                {app.status === 'Confirmed' && <button onClick={() => handleStatusUpdate(app.id, 'Completed')} style={{ padding: '7px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Mark Done</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
