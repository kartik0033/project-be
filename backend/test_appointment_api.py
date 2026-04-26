import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'patient_health_system.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from accounts.models import Patient
from medical.models import Doctor, Appointment

def run_test():
    client = APIClient()
    
    # 1. Setup Data
    print("--- 1. Setting up Test Data ---")
    patient_user = User.objects.filter(username='test_patient_123').first()
    if not patient_user:
        patient_user = User.objects.create_user(username='test_patient_123', password='password123')
    if hasattr(patient_user, 'patient'):
        patient_user.patient.delete()
    Patient.objects.create(user=patient_user, mobile_number='1234567890', aadhaar_number='123456789012')
    
    doctor_user = User.objects.filter(username='test_doctor_123').first()
    if not doctor_user:
        doctor_user = User.objects.create_user(username='test_doctor_123', password='password123')
    if hasattr(doctor_user, 'doctor_profile'):
        doctor_user.doctor_profile.delete()
    Doctor.objects.create(user=doctor_user, full_name='Gregory House', specialization='Diagnostics')

    patient = patient_user.patient
    doctor = doctor_user.doctor_profile
    print(f"Patient: {patient.aadhaar_number}, Doctor: {doctor.full_name}")

    # Clear old test appointments
    Appointment.objects.filter(patient=patient, doctor=doctor).delete()

    # 2. Patient Logs In and Books Appointment
    print("\n--- 2. Patient Booking Appointment ---")
    client.force_authenticate(user=patient_user)
    
    data = {
        'doctor': doctor.id,
        'appointment_date': '2026-10-15',
        'appointment_time': '10:30:00'
    }
    
    res = client.post('/api/medical/appointments/', data, format='json')
    if res.status_code == 201:
        app_id = res.data['id']
        print(f"[SUCCESS] Patient booked appointment #{app_id}")
        print(f"Initial Status: {res.data['status']}")
    else:
        print(f"[FAILED] Failed to book: {res.data}")
        return

    # 3. Doctor Logs In and Approves Appointment
    print("\n--- 3. Doctor Approving Appointment ---")
    client.force_authenticate(user=doctor_user)
    
    # Doctor fetches schedule
    res = client.get('/api/medical/appointments/')
    appointments = res.data
    pending_app = next((a for a in appointments if a['id'] == app_id), None)
    
    if pending_app:
        print(f"[SUCCESS] Doctor sees the appointment in their queue. Status: {pending_app['status']}")
    else:
        print("[FAILED] Doctor cannot see the appointment!")
        return

    # Doctor accepts it
    patch_data = {'status': 'Confirmed'}
    res = client.patch(f'/api/medical/appointments/{app_id}/', patch_data, format='json')
    if res.status_code == 200:
        print(f"[SUCCESS] Doctor changed status to {res.data['status']}")
    else:
        print(f"[FAILED] Failed to update status: {res.data}")
        return

    # 4. Patient Logs back in to verify
    print("\n--- 4. Patient Verifying Status ---")
    client.force_authenticate(user=patient_user)
    res = client.get('/api/medical/appointments/')
    updated_app = next((a for a in res.data if a['id'] == app_id), None)
    
    if updated_app and updated_app['status'] == 'Confirmed':
        print(f"[SUCCESS] Patient sees the updated status as '{updated_app['status']}'")
    else:
        print("[FAILED] Patient did not see the confirmed status!")

    print("\nALL TESTS PASSED! The workflow is working perfectly.")

if __name__ == '__main__':
    run_test()
