import os
import json
import PyPDF2
from groq import Groq
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from medical.models import MedicalRecord, Appointment

MODEL = 'llama-3.3-70b-versatile'  # Updated to current versatile model


def extract_text_from_pdf(file_path):
    """Extract text from a PDF file."""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page_text = reader.pages[page_num].extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
    return text.strip()


def call_groq(prompt):
    """Call Groq API and return parsed JSON response."""
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    if not client.api_key:
        raise ValueError("GROQ_API_KEY is not set in environment variables.")
        
    chat = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a professional AI medical assistant. Always respond with valid raw JSON only — no markdown, no explanation, no code fences."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=1500,
    )
    raw = chat.choices[0].message.content.strip()
    # Strip markdown fences if model adds them
    if raw.startswith('```'):
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]
    return json.loads(raw.strip())


def build_global_prompt(profile, records, appointments):
    record_lines = "\n".join([
        f"  - {r.title} ({r.report_type.name if r.report_type else 'Report'}) on {r.date_uploaded.strftime('%b %d, %Y')}"
        + (f": {r.description}" if r.description else "")
        for r in records
    ]) or "  No records uploaded yet."

    appt_lines = "\n".join([
        f"  - {a.appointment_date} at {a.appointment_time} with Dr. {a.doctor.full_name} [{a.status}]"
        for a in appointments
    ]) or "  No appointments yet."

    name = profile.full_name if profile else 'Patient'

    return f"""Analyze this patient's health data and return a JSON summary.

PATIENT PROFILE:
- Name: {name}
- Age: {profile.age if profile else 'Unknown'} years
- Gender: {'Male' if profile and profile.gender == 'M' else 'Female' if profile and profile.gender == 'F' else 'Other'}
- Blood Group: {profile.blood_group if profile and profile.blood_group else 'Not recorded'}
- Allergies: {profile.allergies if profile and profile.allergies else 'None'}
- Chronic Conditions: {profile.chronic_conditions if profile and profile.chronic_conditions else 'None'}
- Height: {str(profile.height) + ' cm' if profile and profile.height else 'Not recorded'}
- Weight: {str(profile.weight) + ' kg' if profile and profile.weight else 'Not recorded'}

MEDICAL RECORDS ({len(records)} total):
{record_lines}

APPOINTMENT HISTORY ({len(appointments)} total):
{appt_lines}

Return ONLY this JSON (no markdown):
{{
  "title": "Comprehensive Health Summary",
  "subtitle": "AI-generated overview for {name}",
  "health_score": <integer 0-100 based on health picture>,
  "status": "<Excellent|Good|Fair|Needs Attention>",
  "key_findings": ["<finding1>", "<finding2>", "<finding3>", "<finding4>", "<finding5>"],
  "action_items": ["<recommendation1>", "<recommendation2>", "<recommendation3>", "<recommendation4>"],
  "alerts": "<critical allergy or condition alerts, or empty string if none>"
}}"""


def build_report_prompt(record, pdf_content=""):
    return f"""Analyze this medical report and return a JSON summary.

REPORT DETAILS:
- Title: {record.title}
- Type: {record.report_type.name if record.report_type else 'Medical Report'}
- Date: {record.date_uploaded.strftime('%B %d, %Y')}
- User Notes: {record.description if record.description else 'No notes provided'}
- Facility: {record.provider_facility.name if record.provider_facility else 'Not specified'}

{"EXTRACTED CONTENT FROM DOCUMENT:" if pdf_content else ""}
{pdf_content if pdf_content else ""}

Return ONLY this JSON (no markdown):
{{
  "title": "Report Analysis: {record.title}",
  "subtitle": "AI analysis of {'document content' if pdf_content else 'report metadata'} from {record.date_uploaded.strftime('%B %d, %Y')}",
  "health_score": <integer 0-100>,
  "status": "<Excellent|Good|Fair|Needs Attention>",
  "key_findings": ["<finding1>","<finding2>","<finding3>","<finding4>"],
  "action_items": ["<recommendation1>","<recommendation2>","<recommendation3>"],
  "alerts": "<urgent flags or empty string>"
}}"""


class AISummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        mode = request.data.get('mode', 'global')
        record_id = request.data.get('record_id')

        patient = getattr(request.user, 'patient', None)
        if not patient:
            return Response({'error': 'Patient profile not found.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            if mode == 'specific':
                if not record_id:
                    return Response({'error': 'record_id required.'}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    record = MedicalRecord.objects.select_related('report_type', 'provider_facility').get(id=record_id, patient=patient)
                except MedicalRecord.DoesNotExist:
                    return Response({'error': 'Record not found.'}, status=status.HTTP_404_NOT_FOUND)
                
                # Extract text if PDF exists
                pdf_content = ""
                if record.file and record.file.name.lower().endswith('.pdf'):
                    pdf_content = extract_text_from_pdf(record.file.path)
                
                summary = call_groq(build_report_prompt(record, pdf_content))

            else:
                profile = getattr(patient, 'profile', None)
                records = MedicalRecord.objects.filter(patient=patient).select_related('report_type', 'provider_facility').order_by('-date_uploaded')
                appointments = Appointment.objects.filter(patient=patient).select_related('doctor').order_by('-appointment_date')
                summary = call_groq(build_global_prompt(profile, records, appointments))

            return Response(summary)

        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
