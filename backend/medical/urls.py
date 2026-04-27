from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, MedicalRecordViewSet, AppointmentViewSet, QRScannerAPI, ReportCategoryViewSet, FacilityViewSet, PrescriptionViewSet, PatientListForDoctor

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'records', MedicalRecordViewSet, basename='medicalrecord')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'categories', ReportCategoryViewSet, basename='reportcategory')
router.register(r'facilities', FacilityViewSet, basename='facility')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')

urlpatterns = [
    path('', include(router.urls)),
    path('scan/', QRScannerAPI.as_view(), name='scan-qr'),
    path('doctor/patients/', PatientListForDoctor.as_view(), name='doctor-patients'),
]
