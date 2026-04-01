from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import Patient, PatientProfile, OTP
from .serializers import PatientSerializer, PatientProfileSerializer
from .utils import send_otp_via_sms
import random

from django.utils import timezone
from datetime import timedelta

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SendRegistrationOTPAPI(APIView):
    def post(self, request):
        aadhaar = request.data.get('aadhaar_number')
        mobile = request.data.get('mobile_number')
        
        # Check if user already exists
        if Patient.objects.filter(mobile_number=mobile).exists():
             return Response({'error': 'Mobile number already registered'}, status=status.HTTP_400_BAD_REQUEST)
        if Patient.objects.filter(aadhaar_number=aadhaar).exists():
             return Response({'error': 'Aadhaar number already registered'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        OTP.objects.create(mobile_number=mobile, otp=otp_code)
        
        # Send OTP via SMS
        sms_status = send_otp_via_sms(mobile, otp_code)
        
        if sms_status:
            return Response({'msg': 'OTP Sent via SMS'}, status=status.HTTP_200_OK)
        else:
            return Response({'msg': 'OTP Generated (SMS Failed)', 'debug_otp': otp_code}, status=status.HTTP_200_OK)

class RegisterAPI(APIView):
    def post(self, request):
        otp_code = request.data.get('otp')
        mobile = request.data.get('mobile_number')
        
        # Verify OTP first
        otp_record = OTP.objects.filter(mobile_number=mobile).last()
        
        if not otp_record:
            return Response({'error': 'No OTP sent to this number'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_used:
             return Response({'error': 'OTP already used'}, status=status.HTTP_400_BAD_REQUEST)

        # Check Expiry (5 minutes)
        if otp_record.created_at < timezone.now() - timedelta(minutes=5):
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check Max Attempts
        if otp_record.attempts >= 3:
             return Response({'error': 'Max attempts exceeded. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.otp != otp_code:
             otp_record.attempts += 1
             otp_record.save()
             remaining = 3 - otp_record.attempts
             return Response({'error': f'Invalid OTP. {remaining} attempts remaining.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Proceed with registration
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp_record.is_used = True
            otp_record.save()
            return Response({'msg': 'Registration Successful', 'aadhaar': user.aadhaar_number}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPI(APIView):
    def post(self, request):
        aadhaar = request.data.get('aadhaar_number')
        password = request.data.get('password')

        user = authenticate(username=aadhaar, password=password)
        if not user:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        role = 'patient'
        if hasattr(user, 'doctor_profile'):
            role = 'doctor'

        tokens = get_tokens_for_user(user)
        return Response({'tokens': tokens, 'msg': 'Login Successful', 'role': role}, status=status.HTTP_200_OK)

class QRLoginAPI(APIView):
    def post(self, request):
        qr_token = request.data.get('qr_token')
        
        try:
            user = Patient.objects.get(qr_token=qr_token)
        except Patient.DoesNotExist:
            return Response({'error': 'Invalid QR Token'}, status=status.HTTP_400_BAD_REQUEST)
            
        tokens = get_tokens_for_user(user.user)
        return Response({'tokens': tokens, 'msg': 'QR Login Successful', 'role': 'patient'}, status=status.HTTP_200_OK)

class ProfileAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'doctor_profile'):
            doc = request.user.doctor_profile
            return Response({
                'role': 'doctor',
                'full_name': doc.full_name,
                'specialization': doc.specialization
            }, status=status.HTTP_200_OK)

        try:
            if not hasattr(request.user, 'patient'):
                return Response({'msg': 'User is not a patient or doctor'}, status=status.HTTP_404_NOT_FOUND)
            
            profile = request.user.patient.profile
            serializer = PatientProfileSerializer(profile)
            data = serializer.data
            data['role'] = 'patient'
            return Response(data, status=status.HTTP_200_OK)
        except PatientProfile.DoesNotExist:
            return Response({'msg': 'Profile not found', 'role': 'patient'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        if not hasattr(request.user, 'patient'):
             return Response({'error': 'User is not linked to a patient record'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = request.user.patient.profile
            serializer = PatientProfileSerializer(profile, data=request.data, partial=True)
        except PatientProfile.DoesNotExist:
            # Create if not exists
            serializer = PatientProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(patient=request.user.patient)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
