from django.urls import path
from .views import RegisterAPI, SendRegistrationOTPAPI, LoginAPI, QRLoginAPI, ProfileAPI

urlpatterns = [
    path('send-otp/', SendRegistrationOTPAPI.as_view(), name='send-otp'),
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('qr-login/', QRLoginAPI.as_view(), name='qr-login'),
    path('profile/', ProfileAPI.as_view(), name='profile'),
]
