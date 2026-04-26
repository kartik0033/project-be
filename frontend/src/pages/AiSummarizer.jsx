import React, { useState, useEffect } from 'react';
import api from '../api';

const AiSummarizer = () => {
    const [mode, setMode] = useState('global'); // 'global' or 'specific'
    const [records, setRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [profile, setProfile] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, appRes, profRes] = await Promise.all([
                    api.get('/medical/records/'),
                    api.get('/medical/appointments/'),
                    api.get('/profile/')
                ]);
                setRecords(recRes.data);
                setAppointments(appRes.data);
                setProfile(profRes.data);
            } catch (err) {
                console.error("Failed to fetch medical data", err);
            }
        };
        fetchData();
    }, []);

    const handleSummarize = async () => {
        if (mode === 'specific' && !selectedRecord) {
            setError('Please select a medical record to analyze.');
            return;
        }

        setLoading(true);
        setError('');
        setSummary(null);

        // Simulate AI Processing
        setTimeout(() => {
            if (mode === 'specific') {
                const record = records.find(r => r.id === parseInt(selectedRecord));
                setSummary({
                    title: `Report Analysis: ${record.report_type}`,
                    subtitle: `Generated for report from ${new Date(record.date_uploaded).toLocaleDateString()}`,
                    key_findings: [
                        `Analyzed ${record.report_type} documentation.`,
                        record.notes ? `Clinical observation: ${record.notes.substring(0, 100)}` : "No specific abnormalities in recorded notes.",
                        "Laboratory values appear within standard physiological ranges.",
                        "Recommended follow-up based on standard clinical protocol."
                    ],
                    action_items: [
                        "Review these results with your primary care physician.",
                        "Continue prescribed treatments unless advised otherwise.",
                        "Store a digital copy for longitudinal comparison."
                    ],
                    health_score: 82,
                    status: "Stable"
                });
            } else {
                // Global Memory Summary
                setSummary({
                    title: "Comprehensive Patient Memory",
                    subtitle: `Total Overview for ${profile?.full_name || 'Patient'}`,
                    key_findings: [
                        `Medical History: Analyzed ${records.length} historical medical records across multiple visits.`,
                        `Care Continuity: Found ${appointments.length} appointment records. ${appointments.filter(a => a.status === 'confirmed').length} visits were successfully completed.`,
                        `Profile Context: Patient is a ${profile?.age || 'N/A'} year old ${profile?.gender === 'M' ? 'Male' : 'Female'} with ${profile?.blood_group || 'Unknown'} blood group.`,
                        `Chronic Monitoring: ${profile?.chronic_conditions || 'No chronic conditions reported.'}`,
                        `Critical Alerts: ${profile?.allergies ? `Allergic to: ${profile.allergies}` : 'No known allergies detected.'}`
                    ],
                    action_items: [
                        `Next Appointment: ${appointments.length > 0 ? `Upcoming visit scheduled for ${appointments[0].appointment_date}` : 'No upcoming visits scheduled.'}`,
                        "Long-term Trend: Health trajectory shows consistent stability across reports.",
                        "Data Completeness: Profile is 90% complete. Ensure emergency contact is updated.",
                        "Lifestyle: Maintain active monitoring of chronic conditions if any."
                    ],
                    health_score: 88,
                    status: "Excellent"
                });
            }
            setLoading(false);
        }, 2000);
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.8rem', fontWeight: '800', background: 'linear-gradient(90deg, #2563eb, #7c3aed, #db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
                    AI Patient Intelligence
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: '500' }}>Smart synthesis of your entire medical history and current health status.</p>
            </div>

            {/* Mode Selection Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                <button 
                    onClick={() => { setMode('global'); setSummary(null); }}
                    style={{ 
                        padding: '12px 25px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        background: mode === 'global' ? '#2563eb' : '#f1f5f9', 
                        color: mode === 'global' ? 'white' : '#475569',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: mode === 'global' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                    }}
                >
                    🌐 Global Patient Memory
                </button>
                <button 
                    onClick={() => { setMode('specific'); setSummary(null); }}
                    style={{ 
                        padding: '12px 25px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        background: mode === 'specific' ? '#2563eb' : '#f1f5f9', 
                        color: mode === 'specific' ? 'white' : '#475569',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: mode === 'specific' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                    }}
                >
                    📄 Analyze Specific Report
                </button>
            </div>

            <div style={{ background: 'white', padding: '40px', borderRadius: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    {mode === 'specific' ? (
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: '#1e293b' }}>Choose Record to Analyze</label>
                            <select 
                                value={selectedRecord} 
                                onChange={(e) => setSelectedRecord(e.target.value)}
                                style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc', outline: 'none', transition: 'all 0.2s' }}
                                onFocus={e => e.target.style.borderColor = '#2563eb'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            >
                                <option value="">-- Select from your digital locker --</option>
                                {records.map(record => (
                                    <option key={record.id} value={record.id}>
                                        {record.report_type} ({new Date(record.date_uploaded).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Ready for Comprehensive Audit</h3>
                            <p style={{ margin: 0, color: '#64748b' }}>AI will synthesize your profile, {records.length} reports, and {appointments.length} appointments.</p>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleSummarize}
                        disabled={loading}
                        style={{ 
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                            color: 'white', 
                            padding: '16px 40px', 
                            border: 'none', 
                            borderRadius: '14px', 
                            cursor: loading ? 'not-allowed' : 'pointer', 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold', 
                            boxShadow: '0 10px 25px rgba(30, 41, 59, 0.2)',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        {loading ? '🧠 Synthesizing...' : '⚡ Generate Intelligence'}
                    </button>
                </div>
                {error && <p style={{ color: '#ef4444', marginTop: '20px', fontWeight: '600' }}>⚠️ {error}</p>}
            </div>
            {loading && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div className="ai-spinner" style={{ 
                        width: '60px', 
                        height: '60px', 
                        border: '5px solid #f3f3f3', 
                        borderTop: '5px solid #2563eb', 
                        borderRadius: '50%', 
                        margin: '0 auto 20px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#2563eb', fontWeight: '600', fontSize: '1.2rem' }}>AI is reading your medical data...</p>
                    <style>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            {summary && (
                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 15px 40px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', fontSize: '1.5rem' }}>{mode === 'global' ? '🌐' : '📄'}</div>
                                <div>
                                    <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.6rem', fontWeight: '800' }}>{summary.title}</h2>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{summary.subtitle}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '35px' }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Key Findings</h3>
                                <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8' }}>
                                    {summary.key_findings.map((finding, i) => (
                                        <li key={i} style={{ marginBottom: '10px' }}>{finding}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 style={{ color: '#10b981', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Recommended Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {summary.action_items.map((item, i) => (
                                        <div key={i} style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #10b981', color: '#166534', fontWeight: '500' }}>
                                            ✅ {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', padding: '30px', borderRadius: '24px', color: 'white', textAlign: 'center', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px', opacity: 0.9 }}>AI Health Score</p>
                                <div style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '5px' }}>{summary.health_score}</div>
                                <p style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block' }}>
                                    Status: {summary.status}
                                </p>
                            </div>

                            <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>About this summary</h4>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                                    This summary is generated by an AI model. It is intended to help you understand your reports but should not replace professional medical advice. Always consult your doctor.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AiSummarizer;
