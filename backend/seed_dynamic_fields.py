import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'patient_health_system.settings')
django.setup()

from medical.models import ReportCategory, ReportTitleSuggestion, Facility

def seed():
    # A comprehensive mapping of medical categories to specific report titles
    medical_data = {
        "Lab Report": [
            "Complete Blood Count (CBC)",
            "Blood Sugar (Fasting / PP)",
            "Lipid Profile (Cholesterol)",
            "Liver Function Test (LFT)",
            "Kidney Function Test (KFT)",
            "Thyroid Profile (T3, T4, TSH)",
            "Urine Routine & Microscopy",
            "Vitamin B12 & D3 Test",
            "HbA1c (Glycosylated Hemoglobin)",
            "D-Dimer Test",
            "CRP (C-Reactive Protein)"
        ],
        "Radiology Report (Scan / X-ray)": [
            "Chest X-Ray",
            "X-Ray Limb / Joint",
            "MRI Brain",
            "MRI Spine",
            "CT Scan Head",
            "CT Scan Abdomen",
            "Ultrasound (USG) Whole Abdomen",
            "Ultrasound (USG) Pelvis",
            "Mammography",
            "DEXA Scan (Bone Density)"
        ],
        "Cardiology Report (ECG / Heart)": [
            "Electrocardiogram (ECG / EKG)",
            "Echocardiogram (2D Echo)",
            "Treadmill Test (TMT / Stress Test)",
            "Holter Monitor Report",
            "Coronary Angiography Report"
        ],
        "Prescription": [
            "OPD Consultation Prescription",
            "Discharge Medication List",
            "Routine Refill Prescription",
            "Antibiotic Prescription"
        ],
        "Discharge Summary": [
            "Inpatient Discharge Summary",
            "Emergency Room (ER) Summary",
            "Transfer Summary",
            "LAMA (Left Against Medical Advice) Note"
        ],
        "Operation / Surgery Report": [
            "Surgical Operation Notes",
            "Pre-Op Assessment",
            "Post-Op Recovery Notes",
            "Anesthesia Record",
            "Biopsy / Histopathology Report"
        ],
        "Allergy Report": [
            "Skin Prick Allergy Test",
            "Total IgE Blood Test",
            "Food Allergy Panel",
            "Drug Allergy Record"
        ],
        "Vaccination Record": [
            "Pediatric Vaccine Chart",
            "Adult Immunization Record",
            "Flu Shot Record",
            "COVID-19 Vaccination Certificate"
        ],
        "Follow-up Report": [
            "Post-Surgery Follow-up",
            "Routine Check-up Note",
            "Diet & Nutrition Plan",
            "Physiotherapy Assessment"
        ],
        "Gastroenterology Report": [
            "Upper GI Endoscopy",
            "Colonoscopy Report"
        ],
        "Neurology Report": [
            "Electroencephalogram (EEG)",
            "Electromyography (EMG)",
            "Sleep Study (Polysomnography)"
        ],
        "Billing / Invoice": [
            "Final Hospital Bill",
            "Pharmacy Receipt",
            "Insurance Claim Form",
            "Advance Payment Receipt"
        ],
        "Other": [
            "Medical Certificate",
            "Fitness Certificate",
            "Fitness for Surgery"
        ]
    }
    
    facilities = [
        ("Apollo Hospital", "Hospital"),
        ("Max Healthcare", "Hospital"),
        ("Fortis Hospital", "Hospital"),
        ("City Central Clinic", "Clinic"),
        ("Dr. Lal PathLabs", "Lab"),
        ("SRL Diagnostics", "Lab"),
        ("Suburban Diagnostics", "Lab"),
        ("Care Community Clinic", "Clinic")
    ]

    print("Seeding database with professional medical categories and titles...")

    # Create Categories and Suggestions
    for category_name, titles in medical_data.items():
        category, created = ReportCategory.objects.get_or_create(name=category_name)
        if created:
            print(f"Added new category: {category_name}")
            
        for title in titles:
            sugg, sugg_created = ReportTitleSuggestion.objects.get_or_create(
                category=category, 
                suggested_title=title
            )

    # Create Facilities
    for f_name, f_type in facilities:
        fac, created = Facility.objects.get_or_create(
            name=f_name, 
            defaults={'facility_type': f_type, 'is_verified': True}
        )

    print("Successfully populated comprehensive medical data!")

if __name__ == '__main__':
    seed()
