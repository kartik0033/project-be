from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from accounts.models import Patient, PatientProfile, OTP
import os

class BugReproductionTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.profile_url = reverse('profile')
        self.user_data = {
            'aadhaar_number': '123456789012',
            'mobile_number': '9876543210',
            'password': 'testpassword'
        }

    def test_qr_code_creation(self):
        """
        Test that QR code is generated and accessible.
        Bug Report: 'qr when we register is not openin'
        """
        # 1. Register
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Authenticate
        user = User.objects.get(username=self.user_data['aadhaar_number'])
        self.client.force_authenticate(user=user)
        
        # 3. Create Profile (which should trigger QR generation in save())
        profile_data = {
            'full_name': 'Test Use',
            'age': 30,
            'gender': 'M',
            'address': 'Test Address'
        }
        # Using PUT to create as per views.py logic
        response = self.client.put(self.profile_url, profile_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 4. Verify QR Code Image
        profile = PatientProfile.objects.get(patient__user=user)
        
        # Check if field has value
        self.assertTrue(bool(profile.qr_code_image), "QR code image field is empty")
        
        # Check if file actually exists
        if profile.qr_code_image:
            self.assertTrue(os.path.exists(profile.qr_code_image.path), f"QR code file not found at {profile.qr_code_image.path}")
            
        # Check URL (sanity check for frontend access)
        print(f"QR Code URL: {profile.qr_code_image.url}")

    def test_profile_update_persistence(self):
        """
        Test that profile updates are saved correctly.
        Bug Report: 'profile when edited changes cannot be saved'
        """
        # 1. Register & Authenticate
        self.client.post(self.register_url, self.user_data)
        user = User.objects.get(username=self.user_data['aadhaar_number'])
        self.client.force_authenticate(user=user)
        
        # 2. Create Initial Profile
        initial_data = {
            'full_name': 'Initial Name',
            'age': 25,
            'gender': 'F',
            'address': 'Initial Address'
        }
        self.client.put(self.profile_url, initial_data)
        
        # 3. Update Profile
        update_data = {
            'full_name': 'Updated Name',
            'age': 26, # Changed
            'gender': 'F',
            'address': 'New Address' # Changed
        }
        response = self.client.put(self.profile_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Verify Persistence
        profile = PatientProfile.objects.get(patient__user=user)
        self.assertEqual(profile.full_name, 'Updated Name')
        self.assertEqual(profile.age, 26)
        self.assertEqual(profile.address, 'New Address')
