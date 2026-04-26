import React, { useState, useEffect } from 'react';
import api from '../api';

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ doctor: '', date: '', time: '' });
    const [loading, setLoading] = useState(true);

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

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medical/appointments/', { 
                doctor: formData.doctor, 
                appointment_date: formData.date,
                appointment_time: formData.time + ":00" // Backend expects HH:MM:SS
            });
            setShowModal(false);
            fetchAppointments(); // refresh the list
        } catch (error) {
            console.error(error);
            alert('Failed to book an appointment with the selected doctor. Please try again.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>My Appointments</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Book Appointment
                </button>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <p style={{ color: '#888' }}>Loading...</p>
                ) : appointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {appointments.map(app => (
                            <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{app.doctor_name || 'Doctor'}</h4>
                                    <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
                                        {new Date(app.appointment_date + 'T' + app.appointment_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ 
                                        padding: '5px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        background: app.status === 'Confirmed' ? '#dcfce7' : app.status === 'Pending' ? '#fef3c7' : app.status === 'Cancelled' ? '#fee2e2' : '#f0f0f0',
                                        color: app.status === 'Confirmed' ? '#166534' : app.status === 'Pending' ? '#92400e' : app.status === 'Cancelled' ? '#991b1b' : '#888'
                                    }}>
                                        {app.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#888', fontStyle: 'italic' }}>You have no upcoming appointments.</p>
                )}
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '1.4rem' }}>Book an Appointment</h3>
                        <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Select Doctor</label>
                                <select 
                                    required
                                    value={formData.doctor} 
                                    onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                                >
                                    <option value="" disabled>Choose a specialist...</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>{doc.full_name} ({doc.specialization})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>Date</label>
                                <input 
                                    type="date" 
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>Available Time Slots</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                    {TIME_SLOTS.map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setFormData({...formData, time: slot})}
                                            style={{
                                                padding: '10px 5px',
                                                borderRadius: '8px',
                                                border: formData.time === slot ? '2px solid #3b82f6' : '1px solid #ddd',
                                                background: formData.time === slot ? '#eff6ff' : 'white',
                                                color: formData.time === slot ? '#3b82f6' : '#555',
                                                cursor: 'pointer',
                                                fontWeight: formData.time === slot ? 'bold' : 'normal',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                <button type="submit" disabled={!formData.time} style={{ padding: '12px 24px', background: formData.time ? '#3b82f6' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', cursor: formData.time ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
