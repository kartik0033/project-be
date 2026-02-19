import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AuthContext } from './context/AuthContext';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import { BrowserRouter } from 'react-router-dom';
import api from './api';

// Mock API
vi.mock('./api');

// Mock User Context
const mockUpdateUser = vi.fn();
const mockLogin = vi.fn();
const mockUser = {
    aadhaar_number: '123456789012',
    full_name: 'Test Test',
    age: 30,
    gender: 'M',
    address: '123 Street',
    qr_code_image: '/media/qr_codes/test.png' // Relative path to test fix
};

const renderWithContext = (component, userVal = mockUser) => {
    return render(
        <AuthContext.Provider value={{ user: userVal, login: mockLogin, updateUser: mockUpdateUser, loading: false }}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

describe('Bug Verification Tests', () => {

    it('Dashboard handles relative QR code URL correctly', () => {
        renderWithContext(<Dashboard />);

        const img = screen.getByAltText('Health Card QR');
        expect(img).toBeInTheDocument();
        // Check if prepended with localhost
        expect(img.src).toContain('http://127.0.0.1:8000/media/qr_codes/test.png');
    });

    it('Profile updates user context on successful save', async () => {
        // Setup API mock
        api.get.mockResolvedValue({ data: mockUser });
        api.put.mockResolvedValue({ data: { ...mockUser, full_name: 'Updated Name', qr_code_image: '/media/new.png' } });

        renderWithContext(<Profile />);

        // Wait to load
        await waitFor(() => expect(screen.getByDisplayValue('Test Test')).toBeInTheDocument());

        // Change input
        fireEvent.change(screen.getByDisplayValue('Test Test'), { target: { value: 'Updated Name' } });

        // Submit
        fireEvent.click(screen.getByText('Save Profile'));

        // Check verification
        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalled();
            expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
                full_name: 'Updated Name',
                qr_code_image: '/media/new.png'
            }));
        });
    });
});
