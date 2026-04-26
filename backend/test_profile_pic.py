import os
import django
from django.core.files.uploadedfile import SimpleUploadedFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'patient_health_system.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import Patient, PatientProfile
from PIL import Image
from io import BytesIO

def run_test():
    client = APIClient()
    patient = Patient.objects.last()
    client.force_authenticate(user=patient.user)
    
    # Create a valid dummy image
    file_obj = BytesIO()
    image = Image.new("RGB", (100, 100), "blue")
    image.save(file_obj, "JPEG")
    file_obj.seek(0)
    
    dummy_file = SimpleUploadedFile("test_pic.jpg", file_obj.read(), content_type="image/jpeg")
    
    data = {
        'full_name': 'Test Upload',
        'age': 30,
        'gender': 'M',
        'address': 'Test Address',
        'profile_picture': dummy_file
    }
    
    print("Sending PUT request...")
    res = client.put('/api/profile/', data, format='multipart')
    print("Status:", res.status_code)
    print("Response:", res.data)
    
    p = PatientProfile.objects.get(patient=patient)
    print("Database profile_picture:", p.profile_picture.name if p.profile_picture else None)

if __name__ == '__main__':
    run_test()
