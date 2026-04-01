from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, MedicalRecordViewSet, AppointmentViewSet, QRScannerAPI

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'records', MedicalRecordViewSet, basename='medicalrecord')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('scan/', QRScannerAPI.as_view(), name='scan-qr'),
]
