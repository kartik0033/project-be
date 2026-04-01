from rest_framework import serializers
from .models import Doctor, MedicalRecord, Appointment

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    patient_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'doctor', 'doctor_name', 'patient_name', 'appointment_date', 'appointment_time', 'status']
        read_only_fields = ['patient']

    def get_patient_name(self, obj):
        if hasattr(obj.patient, 'profile'):
            return obj.patient.profile.full_name
        return f"Aadhaar: {obj.patient.aadhaar_number}"
