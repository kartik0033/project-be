from rest_framework import viewsets, permissions, filters
from .models import Doctor, MedicalRecord, Appointment, ReportCategory, Facility, Prescription
from .serializers import DoctorSerializer, MedicalRecordSerializer, AppointmentSerializer, ReportCategorySerializer, FacilitySerializer, PrescriptionSerializer

class ReportCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReportCategory.objects.filter(is_active=True).prefetch_related('suggestions')
    serializer_class = ReportCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'patient'):
            return MedicalRecord.objects.filter(patient=user.patient, visible_to_patient=True)
        elif hasattr(user, 'doctor_profile'):
            return MedicalRecord.objects.filter(doctor=user.doctor_profile)
        return MedicalRecord.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'doctor_profile'):
            patient_id = self.request.data.get('patient_id')
            patient = Patient.objects.get(id=patient_id)
            serializer.save(patient=patient, doctor=user.doctor_profile)
        else:
            serializer.save(patient=user.patient)

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile).order_by('appointment_date', 'appointment_time')
        if hasattr(user, 'patient'):
            return Appointment.objects.filter(patient=user.patient).order_by('appointment_date', 'appointment_time')
        return Appointment.objects.none()

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient)

class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'doctor_profile'):
            return Prescription.objects.filter(doctor=user.doctor_profile).order_by('-created_at').prefetch_related('items')
        if hasattr(user, 'patient'):
            return Prescription.objects.filter(patient=user.patient).order_by('-created_at').prefetch_related('items')
        return Prescription.objects.none()

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import Patient
from accounts.serializers import PatientProfileSerializer

class PatientListForDoctor(APIView):
    """Returns a list of all patients who have had an appointment with this doctor."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'doctor_profile'):
            return Response({'error': 'Only doctors can access this.'}, status=status.HTTP_403_FORBIDDEN)
        doctor = request.user.doctor_profile
        patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
        patients = Patient.objects.filter(id__in=patient_ids).select_related('profile')
        data = []
        for p in patients:
            profile = getattr(p, 'profile', None)
            data.append({
                'patient_id': p.id,
                'aadhaar': p.aadhaar_number,
                'mobile': p.mobile_number,
                'name': profile.full_name if profile else 'Unknown',
                'age': profile.age if profile else None,
                'gender': profile.gender if profile else None,
                'blood_group': profile.blood_group if profile else '',
                'allergies': profile.allergies if profile else '',
                'chronic_conditions': profile.chronic_conditions if profile else '',
                'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile and profile.profile_picture else None,
            })
        return Response(data)


class QRScannerAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'doctor_profile'):
            return Response({'error': 'Only doctors can use the scanner'}, status=status.HTTP_403_FORBIDDEN)
        
        qr_token = request.data.get('qr_token')
        if not qr_token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            patient = Patient.objects.get(qr_token=qr_token)
            # Fetch past records
            records = MedicalRecord.objects.filter(patient=patient).order_by('-date_uploaded')
            record_data = MedicalRecordSerializer(records, many=True).data
            
            # Fetch basic profile if it exists
            profile_name = "Unknown"
            if hasattr(patient, 'profile'):
                profile_name = patient.profile.full_name

            return Response({
                'msg': 'Patient found',
                'patient_id': patient.id,
                'aadhaar': patient.aadhaar_number,
                'name': profile_name,
                'records': record_data
            }, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({'error': 'Invalid QR Code'}, status=status.HTTP_404_NOT_FOUND)

