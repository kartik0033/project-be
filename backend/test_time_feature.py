import os
import django
from django.core.files.uploadedfile import SimpleUploadedFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'patient_health_system.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import Patient
from medical.models import Doctor, MedicalRecord

def run_test():
    client = APIClient()
    
    print("--- 1. Fetching Test Data ---")
    patient = Patient.objects.first()
    doctor_profile = Doctor.objects.first()
    
    if not patient or not doctor_profile:
        print("[FAILED] Missing patient or doctor test data.")
        return

    # 2. Authenticate as Doctor
    print("\n--- 2. Simulating Doctor Uploading Record (Backdated) ---")
    client.force_authenticate(user=doctor_profile.user)
    
    dummy_file = SimpleUploadedFile("test_report.pdf", b"file_content", content_type="application/pdf")
    
    # Simulating a backdated report time (e.g. 5 days ago)
    import datetime
    backdated_time = (datetime.datetime.now() - datetime.timedelta(days=5)).isoformat()
    
    data = {
        'title': 'Backdated Lab Result',
        'description': 'This is a test of the time feature.',
        'patient_id': patient.id,
        'visible_to_patient': 'true',
        'report_time': backdated_time,
        'file': dummy_file
    }
    
    res = client.post('/api/medical/records/', data, format='multipart')
    
    if res.status_code == 201:
        record_id = res.data['id']
        print(f"[SUCCESS] Record uploaded successfully with ID {record_id}")
        
        # 3. Verify in Database
        print("\n--- 3. Verifying Database ---")
        record = MedicalRecord.objects.get(id=record_id)
        print(f"Date Uploaded (System Time): {record.date_uploaded}")
        print(f"Report Time (User Provided): {record.report_time}")
        
        if record.report_time is not None:
            print("[SUCCESS] The backdated 'report_time' was saved successfully in the database!")
        else:
            print("[FAILED] The 'report_time' is NULL in the database!")
            
    else:
        print(f"[FAILED] Upload failed: {res.data}")

if __name__ == '__main__':
    run_test()
