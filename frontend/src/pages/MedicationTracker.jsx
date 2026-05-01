import React, { useState, useEffect } from 'react';
import api from '../api';

const MedicationTracker = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ taken: 0, total: 0 });
    const [showAdd, setShowAdd] = useState(false);
    const [newMed, setNewMed] = useState({ 
        name: '', 
        dosage: '', 
        timings: [], 
        instructions: '', 
        start_date: new Date().toISOString().split('T')[0], 
        end_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const res = await api.get('/medical/medications/');
            setMedications(res.data);
            calculateStats(res.data);
        } catch (err) {
            console.error("Failed to fetch medications", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        let taken = 0;
        let total = 0;
        data.forEach(med => {
            const timingCount = med.timings.split(',').length;
            total += timingCount;
            taken += med.today_logs.length;
        });
        setStats({ taken, total });
    };

    const handleMarkTaken = async (medId, timing) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await api.post('/medical/medication-logs/', {
                medication: medId,
                date: today,
                timing: timing,
                status: 'taken'
            });
            fetchMedications();
        } catch (err) {
            alert("Already logged for this time slot.");
        }
    };

    const handleAddMed = async (e) => {
        e.preventDefault();
        if (newMed.timings.length === 0) {
            alert("Please select at least one timing.");
            return;
        }
        try {
            await api.post('/medical/medications/', {
                ...newMed,
                timings: newMed.timings.join(',')
            });
            setShowAdd(false);
            setNewMed({ 
                name: '', 
                dosage: '', 
                timings: [], 
                instructions: '', 
                start_date: new Date().toISOString().split('T')[0], 
                end_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
            });
            fetchMedications();
            alert("Medication added successfully!");
        } catch (err) {
            alert("Error adding medication. Please check your inputs.");
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader"></div>
            <style>{`.loader { width: 48px; height: 48px; border: 5px solid #E2E8F0; border-bottom-color: #2563eb; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; } @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const AdherenceRing = ({ percent }) => {
        const radius = 35;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;

        return (
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                    <circle 
                        cx="45" cy="45" r={radius} stroke="white" strokeWidth="8" fill="transparent" 
                        strokeDasharray={circumference} style={{ strokeDashoffset: offset, transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)', strokeLinecap: 'round' }}
                    />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '900', color: 'white', fontSize: '1.1rem' }}>
                    {percent}%
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
            {/* Header Section */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                marginBottom: '40px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                padding: '40px', borderRadius: '32px', color: 'white', boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)'
            }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Daily <span style={{ opacity: 0.8 }}>Prescriptions</span></h1>
                    <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: '500' }}>Maintain 100% consistency for faster recovery.</p>
                    <button 
                        onClick={() => setShowAdd(true)}
                        style={{ 
                            marginTop: '25px', background: 'white', color: '#2563eb', border: 'none', 
                            padding: '14px 28px', borderRadius: '16px', fontWeight: '800', 
                            cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        + Add New Medicine
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', background: 'rgba(255,255,255,0.15)', padding: '20px 30px', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
                    <AdherenceRing percent={stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0} />
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Consistency</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>{stats.taken}/{stats.total} <span style={{ fontSize: '1rem', opacity: 0.7 }}>Doses</span></div>
                    </div>
                </div>
            </div>

            {/* Time Slot Grid */}
            <div style={{ display: 'grid', gap: '40px' }}>
                {['morning', 'afternoon', 'night'].map(slot => {
                    const slotMeds = medications.filter(m => m.timings.includes(slot));
                    if (slotMeds.length === 0) return null;

                    return (
                        <div key={slot}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '1.8rem' }}>{slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : '🌙'}</span>
                                <h2 style={{ margin: 0, textTransform: 'capitalize', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>{slot} Schedule</h2>
                                <div style={{ height: '2px', flex: 1, background: '#f1f5f9', marginLeft: '10px' }}></div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {slotMeds.map(med => {
                                    const isTaken = med.today_logs.some(log => log.timing === slot);
                                    return (
                                        <div key={med.id} style={{ 
                                            background: 'white', padding: '25px', borderRadius: '24px', 
                                            border: isTaken ? '2px solid #10b981' : '1px solid #f1f5f9',
                                            boxShadow: isTaken ? '0 10px 20px rgba(16, 185, 129, 0.05)' : '0 10px 30px rgba(0,0,0,0.02)',
                                            display: 'flex', flexDirection: 'column', gap: '15px', transition: 'all 0.3s'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div>
                                                    <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.25rem', marginBottom: '4px' }}>{med.name}</div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{med.dosage}</span>
                                                        {med.instructions && <span style={{ background: '#fff7ed', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#c2410c' }}>{med.instructions}</span>}
                                                    </div>
                                                </div>
                                                {isTaken && <div style={{ background: '#10b981', color: 'white', padding: '5px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800' }}>COMPLETED</div>}
                                            </div>

                                            <button 
                                                onClick={() => handleMarkTaken(med.id, slot)}
                                                disabled={isTaken}
                                                style={{ 
                                                    width: '100%', padding: '14px', borderRadius: '16px', border: 'none', 
                                                    background: isTaken ? '#f0fdf4' : '#2563eb', 
                                                    color: isTaken ? '#10b981' : 'white', 
                                                    fontWeight: '800', cursor: isTaken ? 'default' : 'pointer',
                                                    fontSize: '0.95rem', transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                                }}
                                            >
                                                {isTaken ? '✓ Taken Today' : 'Confirm Intake'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {medications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💊</div>
                    <h3 style={{ color: '#1e293b', margin: 0 }}>No Medications Tracked</h3>
                    <p style={{ color: '#64748b' }}>Add your first medicine to start tracking your health journey.</p>
                </div>
            )}

            {/* Premium Add Modal */}
            {showAdd && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowAdd(false);
                    }}
                    style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
                        animation: 'fadeIn 0.3s ease-out'
                    }}
                >
                    <form onSubmit={handleAddMed} style={{ 
                        background: 'white', padding: '40px', borderRadius: '32px', width: '500px', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>Add Medication</h2>
                        <p style={{ margin: '0 0 30px 0', color: '#64748b' }}>Configure your dosage and timing schedule.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>MEDICINE NAME</label>
                                    <input 
                                        placeholder="e.g. Lipitor" 
                                        required 
                                        value={newMed.name}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                                        onChange={e => setNewMed({...newMed, name: e.target.value})} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>DOSAGE</label>
                                    <input 
                                        placeholder="e.g. 10mg" 
                                        required 
                                        value={newMed.dosage}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                                        onChange={e => setNewMed({...newMed, dosage: e.target.value})} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '12px' }}>TIMING SCHEDULE</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['morning', 'afternoon', 'night'].map(t => {
                                        const isSel = newMed.timings.includes(t);
                                        return (
                                            <div 
                                                key={t} 
                                                onClick={() => {
                                                    const ts = isSel ? newMed.timings.filter(x => x !== t) : [...newMed.timings, t];
                                                    setNewMed({...newMed, timings: ts});
                                                }}
                                                style={{ 
                                                    flex: 1, textAlign: 'center', padding: '12px', borderRadius: '12px', 
                                                    border: isSel ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                    background: isSel ? '#eff6ff' : 'white', cursor: 'pointer',
                                                    fontWeight: '700', textTransform: 'capitalize', fontSize: '0.85rem',
                                                    color: isSel ? '#2563eb' : '#64748b', transition: 'all 0.2s'
                                                }}
                                            >
                                                {t === 'morning' ? '🌅 ' : t === 'afternoon' ? '☀️ ' : '🌙 '} {t}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>START DATE</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={newMed.start_date}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                                        onChange={e => setNewMed({...newMed, start_date: e.target.value})} 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>END DATE</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={newMed.end_date}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                                        onChange={e => setNewMed({...newMed, end_date: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>INSTRUCTIONS (OPTIONAL)</label>
                                <input 
                                    placeholder="e.g. Take after breakfast" 
                                    value={newMed.instructions}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                                    onChange={e => setNewMed({...newMed, instructions: e.target.value})} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>Save Schedule</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default MedicationTracker;
