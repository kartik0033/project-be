from django.db import models
from django.contrib.auth.models import User
from accounts.models import Patient

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    full_name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr. {self.full_name} ({self.specialization})"

class ReportCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ReportTitleSuggestion(models.Model):
    category = models.ForeignKey(ReportCategory, on_delete=models.CASCADE, related_name='suggestions')
    suggested_title = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.category.name} - {self.suggested_title}"

class Facility(models.Model):
    FACILITY_TYPES = [
        ('Hospital', 'Hospital'),
        ('Clinic', 'Clinic'),
        ('Lab', 'Lab'),
        ('Other', 'Other')
    ]
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    facility_type = models.CharField(max_length=50, choices=FACILITY_TYPES, default='Hospital')
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_records')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='medical_records/')
    report_time = models.DateTimeField(null=True, blank=True)
    report_type = models.ForeignKey(ReportCategory, on_delete=models.SET_NULL, null=True, blank=True)
    provider_facility = models.ForeignKey(Facility, on_delete=models.SET_NULL, null=True, blank=True)
    visible_to_patient = models.BooleanField(default=True)
    date_uploaded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.patient.aadhaar_number}"

class Prescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    appointment = models.ForeignKey('Appointment', on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    diagnosis = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription by Dr.{self.doctor.full_name} for {self.patient.aadhaar_number}"

class PrescriptionItem(models.Model):
    FREQUENCY_CHOICES = [
        ('OD', 'Once a day'),
        ('BD', 'Twice a day'),
        ('TDS', 'Three times a day'),
        ('QID', 'Four times a day'),
        ('SOS', 'As needed'),
    ]
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medicine_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)  # e.g. "500mg"
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='OD')
    duration = models.CharField(max_length=100, blank=True)  # e.g. "7 days"
    instructions = models.TextField(blank=True)  # e.g. "Take after food"

    def __str__(self):
        return f"{self.medicine_name} ({self.dosage})"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.aadhaar_number} with {self.doctor} on {self.appointment_date}"

# Signals to clean up medical record files on delete or file replacement
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
import os

@receiver(post_delete, sender=MedicalRecord)
def delete_medical_record_file_on_delete(sender, instance, **kwargs):
    """Delete the actual file from disk when a MedicalRecord is deleted."""
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(pre_save, sender=MedicalRecord)
def delete_old_medical_record_file_on_update(sender, instance, **kwargs):
    """Delete the old file from disk when a MedicalRecord file is replaced."""
    if not instance.pk:
        return
    try:
        old = MedicalRecord.objects.get(pk=instance.pk)
    except MedicalRecord.DoesNotExist:
        return
    if old.file and old.file != instance.file:
        if os.path.isfile(old.file.path):
            os.remove(old.file.path)

