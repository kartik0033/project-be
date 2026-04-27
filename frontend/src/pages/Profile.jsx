import React, { useState, useContext, useEffect, useRef } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: 'O',
        address: '',
        blood_group: '',
        allergies: '',
        chronic_conditions: '',
        emergency_contact: '',
        height: '',
        weight: '',
        profile_picture: null
    });
    
    const [previewUrl, setPreviewUrl] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);


    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile/');
                const profileData = {
                    full_name: res.data.full_name || '',
                    age: res.data.age || '',
                    gender: res.data.gender || 'O',
                    address: res.data.address || '',
                    blood_group: res.data.blood_group || '',
                    allergies: res.data.allergies || '',
                    chronic_conditions: res.data.chronic_conditions || '',
                    emergency_contact: res.data.emergency_contact || '',
                    height: res.data.height || '',
                    weight: res.data.weight || '',
                    profile_picture: null
                };
                setFormData(profileData);
                
                const formatUrl = (url) => url ? (url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`) : null;
                setQrCodeUrl(formatUrl(res.data.qr_code_image));
                setPreviewUrl(formatUrl(res.data.profile_picture));
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, profile_picture: file });
            setPreviewUrl(URL.createObjectURL(file));
            
            // Auto-save the image immediately
            const data = new FormData();
            data.append('profile_picture', file);
            
            try {
                const res = await api.put('/profile/', data);
                setMessage('Profile picture updated successfully!');
                const formatUrl = (url) => url ? (url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`) : null;
                if (res.data.profile_picture) setPreviewUrl(formatUrl(res.data.profile_picture));
                if (updateUser) updateUser(res.data);
            } catch (err) {
                console.error("Image auto-upload failed:", err);
                setMessage('Failed to save profile picture.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            const res = await api.put('/profile/', data);
            setMessage('Profile updated successfully!');
            
            if (updateUser) updateUser(res.data);
            
            const formatUrl = (url) => url ? (url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`) : null;
            if (res.data.qr_code_image) setQrCodeUrl(formatUrl(res.data.qr_code_image));
            if (res.data.profile_picture) setPreviewUrl(formatUrl(res.data.profile_picture));
            setFormData(prev => ({...prev, profile_picture: null})); 
            setIsEditing(false); // Switch back to view mode
        } catch (err) {
            console.error("Profile update failed:", err);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const DisplayField = ({ label, value, color }) => (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>{label}</label>
            <div style={{ fontSize: '1.1rem', color: color || '#1e293b', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>{value || 'Not Provided'}</div>
        </div>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
            
            {/* Digital ID Card Section - Refined Alignment */}
            <div style={{ 
                background: '#3170d6', 
                borderRadius: '24px', 
                padding: '30px', 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                boxShadow: '0 15px 35px rgba(49, 112, 214, 0.3)', 
                marginBottom: '40px', 
                position: 'relative', 
                overflow: 'hidden' 
            }}>
                {/* Background Pattern */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            width: '110px', 
                            height: '110px', 
                            borderRadius: '50%', 
                            background: '#ffffff', 
                            border: '4px solid rgba(255,255,255,0.4)', 
                            overflow: 'hidden', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)' 
                        }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '3rem', color: '#94a3b8' }}>👤</span>
                            )}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current.click()} style={{ 
                            position: 'absolute', 
                            bottom: '0px', 
                            right: '0px', 
                            background: '#ffffff', 
                            color: '#3170d6', 
                            border: 'none', 
                            borderRadius: '50%', 
                            width: '34px', 
                            height: '34px', 
                            cursor: 'pointer', 
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            fontSize: '1rem', 
                            transition: 'all 0.2s' 
                        }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#f8fafc'; }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#ffffff'; }}>
                            📷
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff', lineHeight: 1.2 }}>{formData.full_name || 'Your Name'}</h2>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>{formData.age ? `${formData.age} yrs` : 'Age'} • {formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : 'Other'}</span>
                            {formData.blood_group && <span style={{ background: 'rgba(239,68,68,0.3)', color: '#fee2e2', padding: '5px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(239,68,68,0.4)' }}>🩸 {formData.blood_group}</span>}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '40px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', letterSpacing: '1.2px', textTransform: 'uppercase' }}>Aadhaar ID</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px', color: '#ffffff', fontWeight: '600' }}>{user?.aadhaar_number}</span>
                                    <span style={{ background: '#10b981', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>VERIFIED</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', letterSpacing: '1.2px', textTransform: 'uppercase' }}>Mobile</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.5px', color: '#ffffff', fontWeight: '600' }}>{user?.mobile_number || 'N/A'}</span>
                                    <span style={{ background: '#10b981', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>VERIFIED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{ 
                    background: 'white', 
                    padding: '15px', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    zIndex: 1, 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
                    width: '130px', 
                    height: '130px', 
                    flexShrink: 0,
                    marginRight: '5px'
                }}>
                    {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', borderRadius: '12px', fontSize: '0.8rem' }}>No QR</div>
                    )}
                </div>
            </div>

            {message && (
                <div style={{ padding: '15px', background: message.includes('Failed') ? '#fef2f2' : '#dcfce7', color: message.includes('Failed') ? '#991b1b' : '#166534', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${message.includes('Failed') ? '#fca5a5' : '#86efac'}`, fontWeight: 'bold' }}>
                    {message}
                </div>
            )}

            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f8fafc', paddingBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: '700' }}>
                        {isEditing ? 'Edit Profile Details' : 'Profile Information'}
                    </h3>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#dbeafe'; }}
                            onMouseOut={e => { e.currentTarget.style.background = '#eff6ff'; }}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <h4 style={{ marginBottom: '20px', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Basic Information</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '35px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Full Name *</label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Age *</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', background: 'white', outline: 'none' }}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Address *</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '20px', color: '#dc2626', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Emergency Medical Data</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Blood Group</label>
                                <select name="blood_group" value={formData.blood_group} onChange={handleChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', background: 'white', outline: 'none' }}>
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Emergency Contact Number</label>
                                <input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} placeholder="e.g. Spouse or Parent" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Height (cm)</label>
                                <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 170" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Weight (kg)</label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 65" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Known Allergies</label>
                                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Penicillin, Peanuts" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Chronic Conditions</label>
                                <input type="text" name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} placeholder="e.g. Type 2 Diabetes, Asthma" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '40px', borderTop: '2px solid #f8fafc', paddingTop: '25px' }}>
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)}
                                style={{ background: '#f1f5f9', color: '#475569', padding: '12px 30px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading} 
                                style={{ background: '#3b82f6', color: 'white', padding: '12px 40px', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div>
                            <h4 style={{ marginBottom: '20px', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Basic Information</h4>
                            <DisplayField label="Full Name" value={formData.full_name} />
                            <DisplayField label="Age" value={formData.age + " Years"} />
                            <DisplayField label="Gender" value={formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : 'Other'} />
                            <DisplayField label="Address" value={formData.address} />
                            <DisplayField label="Height" value={formData.height ? `${formData.height} cm` : null} />
                            <DisplayField label="Weight" value={formData.weight ? `${formData.weight} kg` : null} />
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '20px', color: '#dc2626', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Medical Information</h4>
                            <DisplayField label="Blood Group" value={formData.blood_group} color="#dc2626" />
                            <DisplayField label="Emergency Contact" value={formData.emergency_contact} />
                            <DisplayField label="Known Allergies" value={formData.allergies} />
                            <DisplayField label="Chronic Conditions" value={formData.chronic_conditions} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
