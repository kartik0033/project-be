import os
import django
import sys
from datetime import datetime, date, time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patient_health_system.settings")
django.setup()

from django.contrib.auth.models import User
from accounts.models import Patient, PatientProfile
from medical.models import Doctor, Appointment, MedicalRecord
from django.core.files.uploadedfile import SimpleUploadedFile

# Ensure Doctor exists
user_doc, created = User.objects.get_or_create(username='999999999999')
if created:
    user_doc.set_password('doctorpass')
    user_doc.save()

doctor, _ = Doctor.objects.get_or_create(
    user=user_doc,
    defaults={
        'full_name': 'Test AI',
        'specialization': 'General Medicine',
        'contact_number': '0000000000'
    }
)
print(f"Doctor: Dr. {doctor.full_name}")

# Patient 1
user_p1, created = User.objects.get_or_create(username='111122223333')
if created:
    user_p1.set_password('patientpass')
    user_p1.save()

patient_1, _ = Patient.objects.get_or_create(
    user=user_p1,
    defaults={
        'aadhaar_number': '111122223333',
        'mobile_number': '9876543210'
    }
)

profile_1, _ = PatientProfile.objects.get_or_create(
    patient=patient_1,
    defaults={
        'full_name': 'John Doe',
        'age': 30,
        'gender': 'M',
        'address': '123 Main St, City'
    }
)
print(f"Patient 1: {profile_1.full_name} ({patient_1.aadhaar_number})")

# Appointment 1
Appointment.objects.get_or_create(
    patient=patient_1,
    doctor=doctor,
    appointment_date=date.today(),
    appointment_time=time(10, 0),
    defaults={
        'status': 'Confirmed',
        'notes': 'Regular checkup'
    }
)

# Medical Record 1
dummy_file = SimpleUploadedFile("test_report.txt", b"Blood test results: Normal", content_type="text/plain")
if not MedicalRecord.objects.filter(patient=patient_1, title="Blood Test Report").exists():
    MedicalRecord.objects.create(
        patient=patient_1,
        doctor=doctor,
        title="Blood Test Report",
        description="Routine blood test results.",
        file=dummy_file
    )

# Patient 2
user_p2, created = User.objects.get_or_create(username='444455556666')
if created:
    user_p2.set_password('patientpass')
    user_p2.save()

patient_2, _ = Patient.objects.get_or_create(
    user=user_p2,
    defaults={
        'aadhaar_number': '444455556666',
        'mobile_number': '9876543211'
    }
)

profile_2, _ = PatientProfile.objects.get_or_create(
    patient=patient_2,
    defaults={
        'full_name': 'Jane Smith',
        'age': 28,
        'gender': 'F',
        'address': '456 Oak St, City'
    }
)
print(f"Patient 2: {profile_2.full_name} ({patient_2.aadhaar_number})")

# Appointment 2
Appointment.objects.get_or_create(
    patient=patient_2,
    doctor=doctor,
    appointment_date=date.today(),
    appointment_time=time(14, 30),
    defaults={
        'status': 'Pending',
        'notes': 'Follow-up for headache'
    }
)

print("Test data seeded successfully!")
