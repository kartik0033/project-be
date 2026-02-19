from django.contrib import admin
from .models import Patient, PatientProfile, OTP

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('aadhaar_number', 'mobile_number', 'created_at')
    search_fields = ('aadhaar_number', 'mobile_number')
    readonly_fields = ('qr_token',)

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'patient', 'age', 'gender', 'address')
    search_fields = ('full_name', 'patient__aadhaar_number')

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('mobile_number', 'otp', 'created_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('mobile_number',)
