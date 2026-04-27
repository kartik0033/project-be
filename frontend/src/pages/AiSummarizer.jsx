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

        try {
            const payload = { mode };
            if (mode === 'specific') payload.record_id = selectedRecord;

            const res = await api.post('/ai/summarize/', payload);
            setSummary(res.data);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to generate summary. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const HealthScoreGauge = ({ score, status }) => {
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        
        return (
            <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
                <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="90" cy="90" r={radius}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        fill="transparent"
                    />
                    <circle
                        cx="90" cy="90" r={radius}
                        stroke="white"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ 
                            strokeDashoffset: offset, 
                            transition: 'stroke-dashoffset 1.5s ease-in-out',
                            strokeLinecap: 'round'
                        }}
                    />
                </svg>
                <div style={{ 
                    position: 'absolute', top: '50%', left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    textAlign: 'center' 
                }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>Score</div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ 
            maxWidth: '1200px', margin: '0 auto', padding: '40px 20px',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
            {/* Background Decorations */}
            <div style={{ 
                position: 'fixed', top: '-10%', right: '-5%', 
                width: '400px', height: '400px', 
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)', 
                zIndex: -1 
            }}></div>
            <div style={{ 
                position: 'fixed', bottom: '10%', left: '-5%', 
                width: '500px', height: '500px', 
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)', 
                zIndex: -1 
            }}></div>

            <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                <div style={{ 
                    display: 'inline-block', padding: '8px 16px', borderRadius: '100px', 
                    background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', 
                    fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px',
                    letterSpacing: '1px', textTransform: 'uppercase'
                }}>
                    ✨ Advanced Clinical Intelligence
                </div>
                <h1 style={{ 
                    fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-1px',
                    color: '#0f172a', marginBottom: '16px', lineHeight: 1.1
                }}>
                    AI Health <span style={{ color: '#2563eb' }}>Summarizer</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                    Connect the dots in your medical history using state-of-the-art neural analysis.
                </p>
            </div>

            {/* Mode Switcher */}
            <div style={{ 
                display: 'flex', background: '#f1f5f9', padding: '6px', 
                borderRadius: '16px', width: 'fit-content', margin: '0 auto 40px' 
            }}>
                <button 
                    onClick={() => { setMode('global'); setSummary(null); }}
                    style={{ 
                        padding: '12px 28px', borderRadius: '12px', border: 'none', 
                        background: mode === 'global' ? 'white' : 'transparent', 
                        color: mode === 'global' ? '#0f172a' : '#64748b',
                        fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: mode === 'global' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    🌐 Global Summary
                </button>
                <button 
                    onClick={() => { setMode('specific'); setSummary(null); }}
                    style={{ 
                        padding: '12px 28px', borderRadius: '12px', border: 'none', 
                        background: mode === 'specific' ? 'white' : 'transparent', 
                        color: mode === 'specific' ? '#0f172a' : '#64748b',
                        fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: mode === 'specific' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    📄 Report Deep Dive
                </button>
            </div>

            {/* Control Panel */}
            <div style={{ 
                background: 'white', padding: '32px', borderRadius: '24px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', 
                marginBottom: '50px', display: 'flex', flexDirection: 'column', gap: '24px'
            }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        {mode === 'specific' ? (
                            <>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>SELECT MEDICAL RECORD</label>
                                <select 
                                    value={selectedRecord} 
                                    onChange={(e) => setSelectedRecord(e.target.value)}
                                    style={{ 
                                        width: '100%', padding: '16px 20px', borderRadius: '16px', 
                                        border: '2px solid #f1f5f9', fontSize: '1rem', background: '#f8fafc',
                                        color: '#1e293b', fontWeight: '500', outline: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Choose a report from your history...</option>
                                    {records.map(record => (
                                        <option key={record.id} value={record.id}>
                                            {record.report_type} — {new Date(record.date_uploaded).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <div style={{ padding: '4px' }}>
                                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontWeight: '800' }}>Full History Synthesis</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>AI will analyze {records.length} records and {appointments.length} appointments.</p>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleSummarize}
                        disabled={loading}
                        style={{ 
                            background: '#2563eb', color: 'white', padding: '18px 40px', 
                            border: 'none', borderRadius: '16px', cursor: loading ? 'not-allowed' : 'pointer', 
                            fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
                            transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '12px'
                        }}
                    >
                        {loading ? (
                            <><div className="loader-dots"><span></span><span></span><span></span></div> Synthesis in Progress</>
                        ) : (
                            <>⚡ Generate AI Summary</>
                        )}
                    </button>
                </div>
                {error && (
                    <div style={{ 
                        background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', 
                        padding: '12px 20px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' 
                    }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="ai-pulse"></div>
                    <p style={{ color: '#2563eb', fontWeight: '700', fontSize: '1.25rem', marginTop: '30px' }}>
                        Processing Clinical Data...
                    </p>
                </div>
            )}

            {summary && (
                <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
                        {/* Main Content Card */}
                        <div style={{ 
                            background: 'white', padding: '48px', borderRadius: '32px', 
                            boxShadow: '0 30px 60px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
                                <div style={{ 
                                    background: '#2563eb', width: '56px', height: '56px', 
                                    borderRadius: '16px', display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', fontSize: '1.5rem', color: 'white',
                                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
                                }}>
                                    {mode === 'global' ? '🌐' : '📄'}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '900' }}>{summary.title}</h2>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>{summary.subtitle}</p>
                                </div>
                            </div>

                            <section style={{ marginBottom: '48px' }}>
                                <h3 style={{ 
                                    color: '#2563eb', fontSize: '0.85rem', fontWeight: '800', 
                                    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    🔍 Key Clinical Findings
                                </h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {summary.key_findings.map((finding, i) => (
                                        <div key={i} style={{ 
                                            padding: '20px', background: '#f8fafc', borderRadius: '20px',
                                            color: '#334155', fontWeight: '500', lineHeight: 1.5,
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            {finding}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {summary.alerts && (
                                <section style={{ 
                                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', 
                                    border: '1px solid #fed7aa', borderRadius: '24px', 
                                    padding: '30px', marginBottom: '48px'
                                }}>
                                    <h3 style={{ color: '#c2410c', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>
                                        ⚠️ Urgent Alerts
                                    </h3>
                                    <p style={{ color: '#9a3412', margin: 0, fontSize: '1.1rem', fontWeight: '600', lineHeight: 1.5 }}>
                                        {summary.alerts}
                                    </p>
                                </section>
                            )}

                            <section>
                                <h3 style={{ 
                                    color: '#10b981', fontSize: '0.85rem', fontWeight: '800', 
                                    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px'
                                }}>
                                    🚀 Recommended Actions
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {summary.action_items.map((item, i) => (
                                        <div key={i} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '16px',
                                            background: '#f0fdf4', padding: '20px', borderRadius: '20px',
                                            color: '#166534', fontWeight: '600'
                                        }}>
                                            <span style={{ fontSize: '1.2rem' }}>✅</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {/* Score Card */}
                            <div style={{ 
                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
                                padding: '40px 30px', borderRadius: '32px', color: 'white', 
                                textAlign: 'center', boxShadow: '0 20px 40px rgba(37, 99, 235, 0.25)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ 
                                    position: 'absolute', top: '-20%', right: '-20%', 
                                    width: '150px', height: '150px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)'
                                }}></div>
                                
                                <HealthScoreGauge score={summary.health_score} status={summary.status} />
                                
                                <div style={{ 
                                    marginTop: '25px', padding: '10px 20px', borderRadius: '100px',
                                    background: 'rgba(255,255,255,0.2)', fontSize: '0.95rem',
                                    fontWeight: '700', display: 'inline-block'
                                }}>
                                    Status: {summary.status}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div style={{ 
                                background: 'white', padding: '30px', borderRadius: '32px', 
                                boxShadow: '0 15px 35px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
                            }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>AI Insight Engine</h4>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                                    This analysis is powered by the <b>Llama-3.3-70B</b> neural model. It processes multi-modal patient data to identify patterns and risks.
                                </p>
                                <div style={{ 
                                    marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9',
                                    fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic'
                                }}>
                                    Note: AI insights are supplementary. Always prioritize direct medical consultation.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                    100% { transform: scale(1); opacity: 0.5; }
                }
                .ai-pulse {
                    width: 80px; height: 80px; background: #2563eb; 
                    border-radius: 50%; margin: 0 auto;
                    filter: blur(20px); animation: pulse 2s infinite;
                }
                .loader-dots { display: flex; gap: 4px; }
                .loader-dots span { 
                    width: 6px; height: 6px; background: white; 
                    border-radius: 50%; animation: dots 1s infinite;
                }
                .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loader-dots span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes dots {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.6); opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

export default AiSummarizer;
