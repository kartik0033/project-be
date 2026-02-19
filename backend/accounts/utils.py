from django.conf import settings
from twilio.rest import Client

def send_otp_via_sms(mobile_number, otp):
    """
    Sends OTP via Twilio SMS.
    Returns True if successful, False otherwise.
    """
    if not mobile_number:
        return False
        
    try:
        # Prepend country code if not present (assuming India +91 for now or US +1)
        # Using +91 as default for this project context if not specified
        if not mobile_number.startswith('+'):
             # Basic check, adjust logic as needed for specific region requirements
            mobile_number = f'+91{mobile_number}' 

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=f'Your OTP is: {otp}',
            from_=settings.TWILIO_PHONE_NUMBER,
            to=mobile_number
        )
        print(f"SMS Sent: {message.sid}")
        return True
    except Exception as e:
        print(f"Twilio Error: {e}")
        return False
