from rest_framework import serializers
from .models import Patient, PatientProfile, OTP
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class PatientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Patient
        fields = ['aadhaar_number', 'mobile_number', 'password']

    def validate_aadhaar_number(self, value):
        if not value.isdigit() or len(value) != 12:
            raise serializers.ValidationError("Aadhaar number must be exactly 12 digits.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data['aadhaar_number'],
            password=password
        )
        patient = Patient.objects.create(user=user, **validated_data)
        return patient

class PatientProfileSerializer(serializers.ModelSerializer):
    aadhaar_number = serializers.CharField(source='patient.aadhaar_number', read_only=True)
    mobile_number = serializers.CharField(source='patient.mobile_number', read_only=True)
    qr_code_image = serializers.ImageField(read_only=True)
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = PatientProfile
        fields = ['full_name', 'age', 'gender', 'address', 'blood_group', 'allergies', 'chronic_conditions', 'emergency_contact', 'height', 'weight', 'qr_code_image', 'profile_picture', 'aadhaar_number', 'mobile_number']

class OTPSerializer(serializers.Serializer):
    mobile_number = serializers.CharField()
    otp = serializers.CharField()

class QRLoginSerializer(serializers.Serializer):
    qr_token = serializers.UUIDField()
