import React, { useState, useEffect } from 'react';
import api from '../api';

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
                appointment_time: formData.time
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
                    style={{ background: '#2ecc71', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
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
                                        background: app.status === 'Scheduled' ? '#e8f4fd' : '#f0f0f0',
                                        color: app.status === 'Scheduled' ? '#3498db' : '#888'
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
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Book a Doctor</h3>
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
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Time</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', background: '#4ade80', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
