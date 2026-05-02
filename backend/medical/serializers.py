from rest_framework import serializers
from .models import Doctor, MedicalRecord, Appointment, ReportCategory, ReportTitleSuggestion, Facility, Prescription, PrescriptionItem, Medication, MedicationLog, Notification

class DoctorSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(source='facility.name', read_only=True)
    
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

class PrescriptionItemSerializer(serializers.ModelSerializer):
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    class Meta:
        model = PrescriptionItem
        fields = ['id', 'medicine_name', 'dosage', 'frequency', 'frequency_display', 'duration', 'instructions']

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    patient_name = serializers.SerializerMethodField(read_only=True)
    patient_aadhaar = serializers.CharField(source='patient.aadhaar_number', read_only=True)

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'doctor', 'doctor_name', 'patient_name', 'patient_aadhaar', 'appointment', 'diagnosis', 'notes', 'items', 'created_at']
        read_only_fields = ['doctor']

    def get_patient_name(self, obj):
        if hasattr(obj.patient, 'profile'):
            return obj.patient.profile.full_name
        return f"Aadhaar: {obj.patient.aadhaar_number}"

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        prescription = Prescription.objects.create(**validated_data)
        for item in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item)
        return prescription

class MedicationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationLog
        fields = '__all__'

class MedicationSerializer(serializers.ModelSerializer):
    logs = MedicationLogSerializer(many=True, read_only=True)
    today_logs = serializers.SerializerMethodField()

    class Meta:
        model = Medication
        fields = '__all__'
        read_only_fields = ['patient', 'prescription_item']

    def get_today_logs(self, obj):
        from datetime import date
        today = date.today()
        logs = obj.logs.filter(date=today)
        return MedicationLogSerializer(logs, many=True).data

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['patient']
