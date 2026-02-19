import React, { useState, useContext, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, login, updateUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: 'O',
        address: ''
    });
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch fresh profile data including QR code
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile/');
                setFormData({
                    full_name: res.data.full_name || '',
                    age: res.data.age || '',
                    gender: res.data.gender || 'O',
                    address: res.data.address || ''
                });
                if (res.data.qr_code_image) {
                    // Start with base URL if it's a relative path, but usually API returns full URL
                    // If running locally, might need http://localhost:8000 prefix if not provided
                    // Checking if it starts with http
                    let url = res.data.qr_code_image;
                    if (!url.startsWith('http')) {
                        url = `http://127.0.0.1:8000${url}`;
                    }
                    setQrCodeUrl(url);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await api.put('/profile/', formData);
            setMessage('Profile updated successfully!');

            // Update global user context with new data
            if (updateUser) {
                updateUser(res.data);
            }

            // Update QR code if it changed (unlikely on edit, but good practice)
            if (res.data.qr_code_image) {
                let url = res.data.qr_code_image;
                if (!url.startsWith('http')) {
                    url = `http://127.0.0.1:8000${url}`;
                }
                setQrCodeUrl(url);
            }

        } catch (err) {
            console.error("Profile update failed:", err);
            if (err.response && err.response.data) {
                setMessage(`Failed to update profile: ${JSON.stringify(err.response.data)}`);
            } else {
                setMessage('Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>Edit Profile</h2>
                </div>
                {qrCodeUrl && (
                    <div style={{ textAlign: 'center', marginLeft: '20px' }}>
                        <img src={qrCodeUrl} alt="Patient QR Code" style={{ width: '150px', height: '150px', border: '1px solid #ccc' }} />
                        <p style={{ fontSize: '12px', color: '#666' }}>Your QR Code</p>
                    </div>
                )}
            </div>

            {message && <div className={message.includes('Failed') ? 'error' : 'success'}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '4px' }}
                        required
                    ></textarea>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default Profile;
