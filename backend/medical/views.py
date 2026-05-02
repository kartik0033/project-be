from rest_framework import viewsets, permissions, filters
from .models import Doctor, MedicalRecord, Appointment, ReportCategory, Facility, Prescription, Medication, MedicationLog, Notification
from .serializers import DoctorSerializer, MedicalRecordSerializer, AppointmentSerializer, ReportCategorySerializer, FacilitySerializer, PrescriptionSerializer, MedicationSerializer, MedicationLogSerializer, NotificationSerializer

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

    def check_admin(self):
        if not self.request.user.is_staff:
            self.permission_denied(self.request, message="Only admins can perform this action.")

    def perform_create(self, serializer):
        self.check_admin()
        serializer.save()

    def perform_update(self, serializer):
        self.check_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self.check_admin()
        instance.delete()

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('facility').all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_admin(self):
        if not self.request.user.is_staff:
            self.permission_denied(self.request, message="Only admins can perform this action.")

    def perform_create(self, serializer):
        self.check_admin()
        serializer.save()

    def perform_update(self, serializer):
        self.check_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self.check_admin()
        # Delete the underlying user account as well
        user = instance.user
        instance.delete()
        user.delete()

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

class MedicationViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(patient=self.request.user.patient, is_active=True).prefetch_related('logs')

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient)

class MedicationLogViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MedicationLog.objects.filter(medication__patient=self.request.user.patient)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(patient=self.request.user.patient).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient)

from django.contrib.auth.models import User

class AdminAddDoctorAPI(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        full_name = request.data.get('full_name')
        specialization = request.data.get('specialization')
        contact_number = request.data.get('contact_number')
        facility_id = request.data.get('facility_id')
        profile_image = request.FILES.get('profile_image')

        if not all([email, password, full_name, specialization, facility_id]):
            return Response({'error': 'All fields except profile image are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=email).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=email, email=email, password=password)
            facility = Facility.objects.get(id=facility_id)
            doctor = Doctor.objects.create(
                user=user,
                full_name=full_name,
                specialization=specialization,
                contact_number=contact_number,
                facility=facility,
                profile_image=profile_image
            )
            return Response({'msg': 'Doctor created successfully', 'doctor_id': doctor.id}, status=status.HTTP_201_CREATED)
        except Facility.DoesNotExist:
            return Response({'error': 'Facility not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
