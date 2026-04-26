from rest_framework import serializers
from .models import Doctor, MedicalRecord, Appointment, ReportCategory, ReportTitleSuggestion, Facility

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class ReportTitleSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTitleSuggestion
        fields = ['id', 'suggested_title']

class ReportCategorySerializer(serializers.ModelSerializer):
    suggestions = ReportTitleSuggestionSerializer(many=True, read_only=True)

    class Meta:
        model = ReportCategory
        fields = ['id', 'name', 'is_active', 'suggestions']

class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = '__all__'

class MedicalRecordSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField(read_only=True)
    report_type_name = serializers.CharField(source='report_type.name', read_only=True)
    provider_facility_name = serializers.CharField(source='provider_facility.name', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ['patient']

    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None

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
