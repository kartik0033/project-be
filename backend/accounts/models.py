import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient')
    aadhaar_number = models.CharField(max_length=12, unique=True)
    mobile_number = models.CharField(max_length=15)
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.aadhaar_number

class PatientProfile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField()
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=15, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)  # in cm
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)  # in kg
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    qr_code_image = models.ImageField(upload_to='qr_codes/', blank=True, null=True)

    def save(self, *args, **kwargs):
        # Generate QR code if it doesn't exist
        if not self.qr_code_image:
           qr_image = qrcode.make(str(self.patient.qr_token))
           canvas = BytesIO()
           qr_image.save(canvas, format='PNG')
           file_name = f'qr_{self.patient.aadhaar_number}.png'
           self.qr_code_image.save(file_name, File(canvas), save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.full_name} ({self.patient.aadhaar_number})'

class OTP(models.Model):
    mobile_number = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.mobile_number} - {self.otp}'

# Signals to clean up files when models are deleted or updated
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
import os

# 1. Delete profile picture AND QR code when PatientProfile is deleted
@receiver(post_delete, sender=PatientProfile)
def delete_profile_files_on_delete(sender, instance, **kwargs):
    if instance.qr_code_image:
        if os.path.isfile(instance.qr_code_image.path):
            os.remove(instance.qr_code_image.path)
    if instance.profile_picture:
        if os.path.isfile(instance.profile_picture.path):
            os.remove(instance.profile_picture.path)

# 2. Delete OLD profile picture from disk when a new one is uploaded
@receiver(pre_save, sender=PatientProfile)
def delete_old_profile_picture_on_update(sender, instance, **kwargs):
    if not instance.pk:
        return  # New instance, nothing to delete
    try:
        old = PatientProfile.objects.get(pk=instance.pk)
    except PatientProfile.DoesNotExist:
        return
    if old.profile_picture and old.profile_picture != instance.profile_picture:
        if os.path.isfile(old.profile_picture.path):
            os.remove(old.profile_picture.path)
