import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Register from '../pages/Register';
import Login from '../pages/Login';
import PatientDashboard from '../pages/PatientDashboard';
import Profile from '../pages/Profile';
import Records from '../pages/Records';
import Appointments from '../pages/Appointments';
import AiSummarizer from '../pages/AiSummarizer';
import MedicationTracker from '../pages/MedicationTracker';
import Layout from '../components/Layout';

// Doctor pages
import DoctorDashboard from '../pages/DoctorDashboard';
import QRScanner from '../components/QRScanner';
import PatientView from '../pages/PatientView';

const PatientRoute = ({ children }) => {
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');
  return token && role === 'patient' ? children : <Navigate to="/login" />;
};

const DoctorRoute = ({ children }) => {
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');
  return token && role === 'doctor' ? children : <Navigate to="/login" />;
};

const RootRedirect = () => {
  const token = sessionStorage.getItem('access_token');
  const role = sessionStorage.getItem('user_role');
  if (token) {
      return role === 'doctor' ? <Navigate to="/doctor-dashboard" /> : <Navigate to="/patient-dashboard" />;
  }
  return <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Doctor Protected Routes (Now with Layout) */}
          <Route element={<Layout />}>
            <Route path="/doctor-dashboard" element={
              <DoctorRoute><DoctorDashboard /></DoctorRoute>
            } />
            <Route path="/doctor-manage" element={
              <DoctorRoute><DoctorDashboard /></DoctorRoute>
            } />
            <Route path="/scanner" element={
              <DoctorRoute><QRScanner /></DoctorRoute>
            } />
            <Route path="/patient-view" element={
              <DoctorRoute><PatientView /></DoctorRoute>
            } />

            {/* Patient Protected Routes (With Navbar Layout) */}
            <Route path="/patient-dashboard" element={
              <PatientRoute>
                <PatientDashboard />
              </PatientRoute>
            } />
            <Route path="/profile" element={
              <PatientRoute>
                <Profile />
              </PatientRoute>
            } />
            <Route path="/records" element={
              <PatientRoute>
                <Records />
              </PatientRoute>
            } />
            <Route path="/appointments" element={
              <PatientRoute>
                <Appointments />
              </PatientRoute>
            } />
            <Route path="/ai-summarizer" element={
              <PatientRoute>
                <AiSummarizer />
              </PatientRoute>
            } />
            <Route path="/medication-tracker" element={
              <PatientRoute>
                <MedicationTracker />
              </PatientRoute>
            } />
          </Route>
          
          {/* Default fallback */}
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
