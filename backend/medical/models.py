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

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_records')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='medical_records/')
    date_uploaded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.patient.aadhaar_number}"

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
