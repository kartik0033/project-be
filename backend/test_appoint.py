import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patient_health_system.settings")
django.setup()

from medical.serializers import AppointmentSerializer
from accounts.models import Patient
from medical.models import Doctor

patient = Patient.objects.last()
doctor = Doctor.objects.last()

if not patient or not doctor:
    print("Missing patient or doctor!")
    sys.exit()

data = {
    'doctor': doctor.id,
    'date': '2026-03-26T14:30:00'
}

serializer = AppointmentSerializer(data=data)
if serializer.is_valid():
    try:
        serializer.save(patient=patient)
        print("Success!")
    except Exception as e:
        print("Save Error:", type(e), e)
else:
    print("Validation Error:", serializer.errors)
