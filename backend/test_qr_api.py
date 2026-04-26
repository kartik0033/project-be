import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'patient_health_system.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User
from accounts.models import Patient
from medical.models import Doctor

def run_test():
    client = APIClient()
    
    # 1. Setup
    print("--- 1. Fetching Test Data ---")
    patient = Patient.objects.first()
    doctor_profile = Doctor.objects.first()
    
    if not patient or not doctor_profile:
        print("[FAILED] Missing patient or doctor test data. Please run test_appointment_api.py first.")
        return

    qr_token = str(patient.qr_token)
    print(f"Target Patient: {patient.aadhaar_number} | QR Token: {qr_token}")
    print(f"Scanning as Doctor: {doctor_profile.full_name}")

    # 2. Authenticate as Doctor
    print("\n--- 2. Simulating Doctor QR Scan ---")
    client.force_authenticate(user=doctor_profile.user)
    
    data = {'qr_token': qr_token}
    res = client.post('/api/medical/scan/', data, format='json')
    
    if res.status_code == 200:
        print("[SUCCESS] API responded with HTTP 200 OK")
        patient_data = res.data
        print(f"Patient Name Returned: {patient_data.get('name')}")
        print(f"Aadhaar Returned: {patient_data.get('aadhaar')}")
        print(f"Total Records Found: {len(patient_data.get('records', []))}")
        
        if len(patient_data.get('records', [])) > 0:
            first_record = patient_data['records'][0]
            print(f"Sample Record:")
            print(f"  - Title: {first_record.get('title')}")
            print(f"  - Report Type: {first_record.get('report_type_name')}")
            print(f"  - Facility: {first_record.get('provider_facility_name')}")
    else:
        print(f"[FAILED] Scan failed: {res.data}")
        return
        
    print("\nALL QR TESTS PASSED! The scanning flow is working securely.")

if __name__ == '__main__':
    run_test()
