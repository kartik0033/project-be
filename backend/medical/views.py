from rest_framework import viewsets, permissions, filters
from .models import Doctor, MedicalRecord, Appointment, ReportCategory, Facility
from .serializers import DoctorSerializer, MedicalRecordSerializer, AppointmentSerializer, ReportCategorySerializer, FacilitySerializer

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
        # Patients can only see their own records
        if getattr(self.request.user, 'patient', None):
            return MedicalRecord.objects.filter(patient=self.request.user.patient)
        return MedicalRecord.objects.none()

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient)

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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import Patient

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

