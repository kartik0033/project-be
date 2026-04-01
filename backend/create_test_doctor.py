import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patient_health_system.settings")
django.setup()

from django.contrib.auth.models import User
from medical.models import Doctor

# Ensure User exists
user, created = User.objects.get_or_create(username='999999999999')
if created:
    user.set_password('doctorpass')
    user.save()

# Ensure Doctor exists
doctor, d_created = Doctor.objects.get_or_create(
    user=user,
    defaults={
        'full_name': 'Dr. Test AI',
        'specialization': 'General Medicine',
        'contact_number': '0000000000'
    }
)
print("Doctor creation script ran successfully!")
