from django.contrib import admin
from .models import Doctor, MedicalRecord, Appointment

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialization', 'contact_number')
    search_fields = ('full_name', 'specialization')

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('title', 'patient', 'doctor', 'date_uploaded')
    search_fields = ('title', 'patient__aadhaar_number')
    list_filter = ('date_uploaded',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'appointment_date', 'appointment_time', 'status')
    list_filter = ('status', 'appointment_date')
    search_fields = ('patient__aadhaar_number', 'doctor__full_name')
