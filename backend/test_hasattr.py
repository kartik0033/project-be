import os
import django
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patient_health_system.settings")
django.setup()

from django.contrib.auth.models import User

try:
    user = User.objects.first()
    if user:
        print("User found:", user.username)
        has_doc = hasattr(user, 'doctor_profile')
        print("Has doctor_profile:", has_doc)
    else:
        print("No users in DB.")
except Exception as e:
    print("ERROR:", e)
