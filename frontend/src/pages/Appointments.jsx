import React, { useState, useEffect } from 'react';
import api from '../api';

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

const SYMPTOMS = ["🤒 Fever", "🤕 Headache", "🩺 Regular Checkup", "💊 Follow-up", "🤢 Nausea", "🤧 Cold/Cough", "🦴 Joint Pain"];

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({ doctor: '', date: '', time: '', notes: '' });
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/medical/appointments/');
            setAppointments(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/medical/doctors/');
            setDoctors(res.data);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        }
    };

    const handleSymptomToggle = (symp) => {
        if (selectedSymptoms.includes(symp)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symp));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symp]);
        }
    };

    const handleBook = async (e) => {
        if (e) e.preventDefault();
        
        const finalNotes = selectedSymptoms.length > 0 
            ? `Symptoms: ${selectedSymptoms.join(', ')}. ${formData.notes}`
            : formData.notes;

        try {
            await api.post('/medical/appointments/', { 
                doctor: formData.doctor, 
                appointment_date: formData.date,
                appointment_time: formData.time + ":00", // Backend expects HH:MM:SS
                notes: finalNotes
            });
            setBookingSuccess(true);
            fetchAppointments(); // refresh the list
            setTimeout(() => {
                closeModal();
            }, 3000);
        } catch (error) {
            console.error(error);
            alert('Failed to book an appointment with the selected doctor. Please try again.');
        }
    };

    const openModal = () => {
        setStep(1);
        setBookingSuccess(false);
        setFormData({ doctor: '', date: '', time: '', notes: '' });
        setSelectedSymptoms([]);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '30px', fontSize: '2.2rem', fontWeight: '800' }}>My Appointments</h1>
                <button 
                    onClick={openModal}
                    style={{ background: '#3b82f6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    + Book New Appointment
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <p style={{ color: '#888' }}>Loading...</p>
                ) : appointments.length > 0 ? (
                    appointments.map(app => (
                        <div key={app.id} style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderLeft: `5px solid ${app.status === 'Confirmed' ? '#10b981' : app.status === 'Pending' ? '#f59e0b' : '#ef4444'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.2rem' }}>{app.doctor_name || 'Doctor'}</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        📅 {new Date(app.appointment_date + 'T' + app.appointment_time).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', background: app.status === 'Confirmed' ? '#dcfce7' : app.status === 'Pending' ? '#fef3c7' : app.status === 'Cancelled' ? '#fee2e2' : '#f1f5f9', color: app.status === 'Confirmed' ? '#166534' : app.status === 'Pending' ? '#92400e' : app.status === 'Cancelled' ? '#991b1b' : '#475569' }}>
                                    {app.status}
                                </span>
                            </div>
                            
                            {/* Live Timeline Status */}
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                                    <div style={{ position: 'absolute', top: '50%', left: '10%', width: app.status === 'Pending' ? '0%' : app.status === 'Confirmed' ? '50%' : app.status === 'Completed' ? '100%' : '0%', height: '2px', background: '#10b981', zIndex: 0, transition: 'width 0.5s' }}></div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', border: '3px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                                        <span style={{ fontSize: '0.65rem', marginTop: '5px', color: '#64748b', fontWeight: 'bold' }}>Requested</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: app.status === 'Confirmed' || app.status === 'Completed' ? '#10b981' : 'white', border: '3px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                                        <span style={{ fontSize: '0.65rem', marginTop: '5px', color: app.status === 'Confirmed' || app.status === 'Completed' ? '#10b981' : '#cbd5e1', fontWeight: 'bold' }}>Confirmed</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: app.status === 'Completed' ? '#10b981' : 'white', border: '3px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                                        <span style={{ fontSize: '0.65rem', marginTop: '5px', color: app.status === 'Completed' ? '#10b981' : '#cbd5e1', fontWeight: 'bold' }}>Completed</span>
                                    </div>
                                </div>
                            </div>
                            
                            {app.notes && (
                                <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                                    <strong>Notes:</strong> {app.notes}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '1.2rem', margin: 0 }}>You have no upcoming appointments.</p>
                        <button onClick={openModal} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Book one now</button>
                    </div>
                )}
            </div>

            {/* Interactive Booking Wizard Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
                        
                        {/* Close button */}
                        {!bookingSuccess && (
                            <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>✕</button>
                        )}

                        <div style={{ padding: '40px' }}>
                            {bookingSuccess ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', color: 'white', fontSize: '3rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)' }}>✓</div>
                                    <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Booking Confirmed!</h2>
                                    <p style={{ color: '#64748b' }}>Your appointment has been successfully scheduled.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Progress indicator */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                                        {[1, 2, 3].map(s => (
                                            <div key={s} style={{ height: '6px', flex: 1, borderRadius: '3px', background: step >= s ? '#3b82f6' : '#e2e8f0', transition: 'background 0.3s' }}></div>
                                        ))}
                                    </div>

                                    {step === 1 && (
                                        <div>
                                            <h2 style={{ color: '#0f172a', marginBottom: '5px', fontSize: '1.8rem' }}>Choose your Doctor</h2>
                                            <p style={{ color: '#64748b', marginBottom: '25px' }}>Select a specialist from our available panel.</p>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                                {doctors.map(doc => (
                                                    <div 
                                                        key={doc.id} 
                                                        onClick={() => { setFormData({...formData, doctor: doc.id}); setStep(2); }}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                                                            border: formData.doctor === doc.id ? '2px solid #3b82f6' : '2px solid transparent',
                                                            background: formData.doctor === doc.id ? '#eff6ff' : '#f8fafc',
                                                            boxShadow: formData.doctor === doc.id ? '0 10px 15px -3px rgba(59, 130, 246, 0.1)' : 'none'
                                                        }}
                                                    >
                                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', marginRight: '20px', flexShrink: 0 }}>👨‍⚕️</div>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.1rem' }}>Dr. {doc.full_name}</h4>
                                                            <p style={{ margin: 0, color: '#3b82f6', fontWeight: 'bold', fontSize: '0.85rem' }}>{doc.specialization}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div>
                                            <h2 style={{ color: '#0f172a', marginBottom: '5px', fontSize: '1.8rem' }}>When & Why?</h2>
                                            <p style={{ color: '#64748b', marginBottom: '25px' }}>Select a date and tell us your symptoms.</p>
                                            
                                            <div style={{ marginBottom: '25px' }}>
                                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>Select Date</label>
                                                <input 
                                                    type="date" 
                                                    required
                                                    min={new Date().toISOString().split("T")[0]}
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} 
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>Symptoms / Reason (Optional)</label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                                    {SYMPTOMS.map(symp => (
                                                        <div 
                                                            key={symp} 
                                                            onClick={() => handleSymptomToggle(symp)}
                                                            style={{ 
                                                                padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600',
                                                                background: selectedSymptoms.includes(symp) ? '#3b82f6' : '#f1f5f9',
                                                                color: selectedSymptoms.includes(symp) ? 'white' : '#475569',
                                                                border: selectedSymptoms.includes(symp) ? '1px solid #2563eb' : '1px solid transparent'
                                                            }}
                                                        >
                                                            {symp}
                                                        </div>
                                                    ))}
                                                </div>
                                                <textarea 
                                                    placeholder="Additional notes..." 
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }}
                                                />
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                                                <button onClick={() => setStep(1)} style={{ padding: '12px 24px', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Back</button>
                                                <button onClick={() => setStep(3)} disabled={!formData.date} style={{ padding: '12px 24px', background: formData.date ? '#3b82f6' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '12px', cursor: formData.date ? 'pointer' : 'not-allowed', fontWeight: 'bold', boxShadow: formData.date ? '0 4px 10px rgba(59,130,246,0.3)' : 'none' }}>Continue →</button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div>
                                            <h2 style={{ color: '#0f172a', marginBottom: '5px', fontSize: '1.8rem' }}>Pick a Time Slot</h2>
                                            <p style={{ color: '#64748b', marginBottom: '25px' }}>Available times for {new Date(formData.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                                                {TIME_SLOTS.map(slot => (
                                                    <div
                                                        key={slot}
                                                        onClick={() => setFormData({...formData, time: slot})}
                                                        style={{
                                                            padding: '15px',
                                                            borderRadius: '12px',
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            fontWeight: 'bold',
                                                            fontSize: '1.1rem',
                                                            border: formData.time === slot ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                                            background: formData.time === slot ? '#eff6ff' : 'white',
                                                            color: formData.time === slot ? '#3b82f6' : '#475569',
                                                            boxShadow: formData.time === slot ? '0 4px 10px rgba(59,130,246,0.2)' : 'none'
                                                        }}
                                                    >
                                                        {slot}
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                                                <button onClick={() => setStep(2)} style={{ padding: '12px 24px', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Back</button>
                                                <button onClick={handleBook} disabled={!formData.time} style={{ padding: '15px 30px', background: formData.time ? '#10b981' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '12px', cursor: formData.time ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: formData.time ? '0 4px 15px rgba(16,185,129,0.3)' : 'none' }}>Confirm Booking ✓</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
