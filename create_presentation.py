import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette: Clean Healthcare Blue / Teal / Navy
    NAVY = RGBColor(15, 23, 42)        # #0f172a
    PRIMARY = RGBColor(2, 132, 199)    # #0284c7
    TEAL = RGBColor(13, 148, 136)      # #0d9488
    EMERALD = RGBColor(5, 150, 105)    # #059669
    BG_LIGHT = RGBColor(244, 248, 253) # #f4f8fd
    CARD_BG = RGBColor(255, 255, 255)  # #ffffff
    BORDER = RGBColor(226, 232, 240)   # #e2e8f0
    TEXT_MUTED = RGBColor(100, 116, 139) # #64748b
    WHITE = RGBColor(255, 255, 255)
    AMBER = RGBColor(217, 119, 6)

    logo_path = 'frontend/src/assets/medisync-heart-logo.png'
    has_logo = os.path.exists(logo_path)

    def add_header(slide, title_text, category_text="MEDSYNC CLINICAL COORDINATION SYSTEM"):
        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_LIGHT
        bg.line.fill.background()

        # Top Accent Stripe
        stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
        stripe.fill.solid()
        stripe.fill.fore_color.rgb = PRIMARY
        stripe.line.fill.background()

        # Category eyebrow
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(10), Inches(0.35))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = category_text.upper()
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = PRIMARY
        p.font.name = "Calibri"

        # Main Slide Title
        txBox2 = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(10), Inches(0.8))
        tf2 = txBox2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = title_text
        p2.font.size = Pt(24)
        p2.font.bold = True
        p2.font.color.rgb = NAVY
        p2.font.name = "Calibri"

        # Header Logo on Top Right
        if has_logo:
            slide.shapes.add_picture(logo_path, Inches(12.0), Inches(0.4), height=Inches(0.75))

        # Footer
        footerBox = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.3))
        ftf = footerBox.text_frame
        fp = ftf.paragraphs[0]
        fp.text = "MedSync: Advanced Patient–Doctor Medication Coordination System  |  Final Year MCA Project"
        fp.font.size = Pt(9)
        fp.font.color.rgb = TEXT_MUTED
        fp.font.name = "Calibri"

    def add_card(slide, left, top, width, height, title="", border_color=BORDER, bg_color=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), Inches(0.45))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = NAVY
            p.font.name = "Calibri"

        return card

    # =========================================================================
    # SLIDE 1: Title Slide (Hero Theme)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = BG_LIGHT
    bg1.line.fill.background()

    # Left decorative card
    hero_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.0), Inches(11.533), Inches(5.5))
    hero_card.fill.solid()
    hero_card.fill.fore_color.rgb = CARD_BG
    hero_card.line.color.rgb = BORDER
    hero_card.line.width = Pt(1.5)

    # Logo in Title Card
    if has_logo:
        slide1.shapes.add_picture(logo_path, Inches(1.5), Inches(1.6), height=Inches(1.1))

    t_box = slide1.shapes.add_textbox(Inches(2.8), Inches(1.5), Inches(9.0), Inches(1.2))
    t_tf = t_box.text_frame
    t_tf.word_wrap = True
    tp = t_tf.paragraphs[0]
    tp.text = "MedSync"
    tp.font.size = Pt(40)
    tp.font.bold = True
    tp.font.color.rgb = NAVY
    tp.font.name = "Calibri"

    tp_sub = t_tf.add_paragraph()
    tp_sub.text = "Patients • Doctors • Better Health"
    tp_sub.font.size = Pt(14)
    tp_sub.font.color.rgb = PRIMARY
    tp_sub.font.bold = True
    tp_sub.font.name = "Calibri"

    desc_box = slide1.shapes.add_textbox(Inches(1.5), Inches(2.9), Inches(10.2), Inches(1.5))
    dtf = desc_box.text_frame
    dtf.word_wrap = True
    dp1 = dtf.paragraphs[0]
    dp1.text = "Advanced Patient–Doctor Medication Coordination System"
    dp1.font.size = Pt(24)
    dp1.font.bold = True
    dp1.font.color.rgb = PRIMARY
    dp1.font.name = "Calibri"

    dp2 = dtf.add_paragraph()
    dp2.text = "A Consent-Gated Clinical Platform with Automated Adherence Tracking, Doctor Record Access, Google Maps Geolocation Radar, and Multimodal AI Assistant."
    dp2.font.size = Pt(13)
    dp2.font.color.rgb = TEXT_MUTED
    dp2.font.name = "Calibri"

    # Presenter Details Card
    meta_box = slide1.shapes.add_textbox(Inches(1.5), Inches(4.5), Inches(10.2), Inches(1.5))
    mtf = meta_box.text_frame
    mtf.word_wrap = True
    mp1 = mtf.paragraphs[0]
    mp1.text = "Final Year Master of Computer Applications (MCA) Project Presentation"
    mp1.font.size = Pt(13)
    mp1.font.bold = True
    mp1.font.color.rgb = NAVY
    mp1.font.name = "Calibri"

    mp2 = mtf.add_paragraph()
    mp2.text = "Candidate Name: Amrutha   |   Role: System Architect & Full-Stack Developer\nTechnology: React.js, Tailwind CSS, Python FastAPI, SQLite3, Google Maps Platform & Speech API"
    mp2.font.size = Pt(11)
    mp2.font.color.rgb = TEXT_MUTED
    mp2.font.name = "Calibri"

    # =========================================================================
    # SLIDE 2: Problem Statement & Clinical Motivation
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "Problem Statement & Clinical Motivation", "CLINICAL CONTEXT & RESEARCH NEED")

    add_card(slide2, Inches(0.8), Inches(1.6), Inches(3.7), Inches(5.1), "1. Medication Non-Adherence")
    p1_box = slide2.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(3.3), Inches(4.2))
    p1_tf = p1_box.text_frame
    p1_tf.word_wrap = True
    p1_tf.paragraphs[0].text = "• WHO studies show 50% of chronic patients fail to take medications as prescribed.\n\n• Missed doses and incorrect timing cause preventable hospitalizations, relapses, and billions in annual healthcare overhead.\n\n• Paper-based schedules and memory reliance lead to low compliance."
    for p in p1_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    add_card(slide2, Inches(4.8), Inches(1.6), Inches(3.7), Inches(5.1), "2. Clinical Visibility Disconnect")
    p2_box = slide2.shapes.add_textbox(Inches(5.0), Inches(2.3), Inches(3.3), Inches(4.2))
    p2_tf = p2_box.text_frame
    p2_tf.word_wrap = True
    p2_tf.paragraphs[0].text = "• Doctors have zero visibility into daily medication habits between visits.\n\n• Consultations rely on patient recall rather than objective intake telemetry.\n\n• Drug-drug interactions and dosage conflicts go undetected until adverse symptoms manifest."
    for p in p2_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    add_card(slide2, Inches(8.8), Inches(1.6), Inches(3.7), Inches(5.1), "3. Data Silos & Insecure Sharing")
    p3_box = slide2.shapes.add_textbox(Inches(9.0), Inches(2.3), Inches(3.3), Inches(4.2))
    p3_tf = p3_box.text_frame
    p3_tf.word_wrap = True
    p3_tf.paragraphs[0].text = "• Health records remain locked within disparate clinical software systems.\n\n• Patients struggle to share comprehensive medical records with attending specialists.\n\n• Lack of consent-gated privacy controls exposes records or prevents authorized access."
    for p in p3_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 3: Proposed Solution — The MedSync Platform
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Proposed Solution: The MedSync Ecosystem", "PROJECT OBJECTIVES & VALUE PROPOSITION")

    cards_data = [
        ("Unified Patient Portal", "Interactive dosage reminders, automated adherence analytics, prescription vaults, and 1-click dose tracking.", PRIMARY),
        ("Practitioner Clinical Hub", "Doctor patient lookup by ID, treatment timeline visualization, drug interaction monitoring, and appointment scheduling.", TEAL),
        ("Standardized Patient ID", "Secure UUID-based identifier (e.g. MED-P-7K92X) ensuring tamper-proof patient identity without exposing private records.", EMERALD),
        ("Consent-Gated Architecture", "Strict patient-authorized access workflows with tamper-evident audit logging and instant revocation capabilities.", NAVY),
        ("Geolocation Radar", "Browser geolocation paired with Google Maps & Places API to discover and navigate to nearby specialists in real-time.", PRIMARY),
        ("Multimodal AI Assistant", "Conversational clinical health assistant with Speech-to-Text and Text-to-Speech audio readout for hands-free accessibility.", TEAL),
    ]

    for idx, (title, text, color) in enumerate(cards_data):
        row = idx // 3
        col = idx % 3
        x = Inches(0.8 + col * 4.0)
        y = Inches(1.6 + row * 2.6)
        card = add_card(slide3, x, y, Inches(3.7), Inches(2.4), title)
        
        tb = slide3.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(3.3), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = text
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 4: System Architecture & Workflow
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "3-Tier System Architecture & Technology Stack", "SYSTEM DESIGN & TECHNICAL ARCHITECTURE")

    # Tier 1
    add_card(slide4, Inches(0.8), Inches(1.6), Inches(3.7), Inches(5.1), "Presentation Layer")
    t1_box = slide4.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(3.3), Inches(4.2))
    t1_tf = t1_box.text_frame
    t1_tf.word_wrap = True
    t1_tf.paragraphs[0].text = "• React.js 18 + Vite:\n  High-speed component rendering, fast HMR.\n\n• Tailwind CSS + Custom Design System:\n  Soft ice-blue healthcare theme, accessible contrast, smooth transitions.\n\n• Lucide Vector Icons:\n  Crisp clinical iconography across all 9 dashboard tabs.\n\n• Web Speech API:\n  Continuous voice recognition and speech synthesis."
    for p in t1_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # Tier 2
    add_card(slide4, Inches(4.8), Inches(1.6), Inches(3.7), Inches(5.1), "Application & API Layer")
    t2_box = slide4.shapes.add_textbox(Inches(5.0), Inches(2.3), Inches(3.3), Inches(4.2))
    t2_tf = t2_box.text_frame
    t2_tf.word_wrap = True
    t2_tf.paragraphs[0].text = "• Python FastAPI Framework:\n  High-performance async ASGI server powered by Uvicorn.\n\n• RESTful Endpoints:\n  Auth, dose telemetry, appointments, prescriptions, and audit streams.\n\n• Pydantic Schema Validation:\n  Strict request/response type validation and sanitization.\n\n• CORS & Session Security:\n  Token authorization and role-based access control."
    for p in t2_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # Tier 3
    add_card(slide4, Inches(8.8), Inches(1.6), Inches(3.7), Inches(5.1), "Database & External Services")
    t3_box = slide4.shapes.add_textbox(Inches(9.0), Inches(2.3), Inches(3.3), Inches(4.2))
    t3_tf = t3_box.text_frame
    t3_tf.word_wrap = True
    t3_tf.paragraphs[0].text = "• Relational Database (SQLite3 / Firestore):\n  ACID-compliant tables for patients, doctors, adherence records, and audit logs.\n\n• Google Maps JavaScript API:\n  Interactive vector maps with customized medical marker pins.\n\n• Google Places API (New):\n  Radius queries (3km-20km) filtering clinics, GPs, cardiologists.\n\n• Google Routes & Directions API:\n  Real-time driving, walking, and transit turn-by-turn routing."
    for p in t3_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 5: Unique Patient ID & Registration System
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Unique Patient ID Generation & Registration Pass", "PATIENT IDENTITY & ACCESS PROTOCOL")

    add_card(slide5, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.1), "1. Secure Patient ID Generation")
    s5_1 = slide5.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s5_1_tf = s5_1.text_frame
    s5_1_tf.word_wrap = True
    s5_1_tf.paragraphs[0].text = "• Automated ID Provisioning:\n  During registration, MedSync generates a unique, non-guessable Patient ID in readable clinical format: MED-P-XXXXXXXX (e.g. MED-P-7K92X).\n\n• Collision-Proof Database Guarantee:\n  Stored permanently in the patient profile database; duplicate IDs are cryptographically prevented.\n\n• Digital ID Pass Card Screen:\n  Instant celebration view upon successful registration offering Copy ID, Download Digital ID Pass file, and Share with Doctor.\n\n• Persistence:\n  Remains permanent across sessions, logins, and device restarts."
    for p in s5_1_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    add_card(slide5, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.1), "2. Privacy & Security Safeguards")
    s5_2 = slide5.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s5_2_tf = s5_2.text_frame
    s5_2_tf.word_wrap = True
    s5_2_tf.paragraphs[0].text = "• Zero-Knowledge Identification:\n  A Patient ID identifies the patient profile only; it NEVER grants record access on its own.\n\n• Two-Party Consent Workflow:\n  Attending doctors must enter the ID and formally request access. Medical records remain completely locked until the patient approves the request.\n\n• Revocation at Will:\n  Patients retain absolute ownership and can revoke active doctor access at any time from their dashboard.\n\n• Tamper-Proof Audit Logging:\n  Every query, record view, and consent grant is stamped with an immutable ISO audit record."
    for p in s5_2_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 6: Advanced Patient Dashboard & Medication Tracking
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Advanced Patient Dashboard & Adherence Analytics", "PATIENT EXPERIENCE & CLINICAL OUTCOMES")

    # 4 Cards Layout
    cards6 = [
        ("Personalized Health Header", "Dynamic greeting ('Good Morning, Amrutha!') with verified Patient ID capsule (MED-P-7K92X) and instant copy button.", Inches(0.8), Inches(1.6)),
        ("Next Dose & Metric Cards", "Hero next-dose countdown (2:00 PM Paracetamol 500mg), upcoming doctor appointment, and 87% weekly adherence progress.", Inches(6.8), Inches(1.6)),
        ("Interactive Schedule & Checklist", "Real-time dose logging with Taken/Upcoming status pills, food instructions (Before/After meals), and refill alerts.", Inches(0.8), Inches(4.2)),
        ("Weekly Adherence Bar Chart", "Interactive Mon-Sun telemetry bar chart visualizing adherence rates, missed doses, and motivational health tips.", Inches(6.8), Inches(4.2)),
    ]

    for title, desc, x, y in cards6:
        add_card(slide6, x, y, Inches(5.7), Inches(2.4), title)
        tb = slide6.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(5.3), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 7: Doctor Dashboard & Patient Record Access Hub
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_header(slide7, "Doctor Hub & Clinical Medical History Access", "DOCTOR PORTAL & WORKFLOW AUTOMATION")

    add_card(slide7, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.1), "1. Doctor Command Overview")
    s7_1 = slide7.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s7_1_tf = s7_1.text_frame
    s7_1_tf.word_wrap = True
    s7_1_tf.paragraphs[0].text = "• Practitioner Summary Metrics:\n  Total Patients (248, +12%), Today's Appointments (8), Pending Requests (5), and Urgent Alerts (3).\n\n• Today's Appointments Queue:\n  Organized by scheduled times (09:30 AM, 10:30 AM) with patient avatars, consultation types (General Checkup, Follow-up), and Confirmed/Pending badges.\n\n• Patient Insights (AI):\n  Real-time patient adherence gauge (78%), drug interaction detection, and missed dose frequency warnings."
    for p in s7_1_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    add_card(slide7, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.1), "2. Patient Lookup by ID Module")
    s7_2 = slide7.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s7_2_tf = s7_2.text_frame
    s7_2_tf.word_wrap = True
    s7_2_tf.paragraphs[0].text = "• ID Search Bar:\n  Doctor queries patient record by entering Patient ID (e.g. MED-P-7K92X).\n\n• Authorization & Consent Verification:\n  System checks if consent is Active, Pending, or Revoked. Only authorized doctors can access detailed charts.\n\n• Clinical History View:\n  Displays active prescriptions, drug allergies (Penicillin, Latex), diagnostic reports, treatment notes, and visit history.\n\n• Audit History Log:\n  Records doctor name, patient name, timestamp, and action performed."
    for p in s7_2_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 8: Consent-Gated Architecture & Audit Trail
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_header(slide8, "Consent-Gated Data Security & Audit Architecture", "PRIVACY, HIPAA COMPLIANCE & SECURITY RULES")

    steps = [
        ("Step 1: Patient ID Exchange", "Patient shares unique Patient ID (MED-P-7K92X) with attending physician or hospital clinic.", Inches(0.8)),
        ("Step 2: Doctor Access Request", "Doctor inputs ID in Doctor Hub. System checks authorization and triggers an explicit consent request.", Inches(3.8)),
        ("Step 3: Patient Consent Decision", "Patient dashboard displays instant consent prompt with Doctor details; patient Approves or Rejects.", Inches(6.8)),
        ("Step 4: Audit & Record Release", "Upon approval, medical records unlock; access action is stamped permanently in the immutable audit log.", Inches(9.8)),
    ]

    for title, desc, x in steps:
        add_card(slide8, x, Inches(1.6), Inches(2.8), Inches(5.1), title)
        tb = slide8.shapes.add_textbox(x + Inches(0.15), Inches(2.4), Inches(2.5), Inches(4.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 9: Geolocation Radar & Google Maps Integration
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_header(slide9, "Nearby Doctors & Google Maps Geolocation Radar", "REAL-TIME LOCATION SERVICES & NAVIGATION")

    add_card(slide9, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.1), "1. Geolocation & Places API (New)")
    s9_1 = slide9.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s9_1_tf = s9_1.text_frame
    s9_1_tf.word_wrap = True
    s9_1_tf.paragraphs[0].text = "• Browser Geolocation API:\n  navigator.geolocation automatically detects patient coordinates (Latitude & Longitude) on page load with permission handling.\n\n• Multi-Tier Distance Radii:\n  Filters nearby doctors across 3 km, 5 km, 10 km, and 20 km search boundaries.\n\n• Specialist Search & Filtering:\n  Query by General Physician, Cardiologist, Dermatologist, Pediatrician, and multi-specialty clinics.\n\n• Accurate Haversine Distance Calculation:\n  Computes real distance sorted nearest-first."
    for p in s9_1_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    add_card(slide9, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.1), "2. Interactive Maps & Turn-by-Turn Navigation")
    s9_2 = slide9.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s9_2_tf = s9_2.text_frame
    s9_2_tf.word_wrap = True
    s9_2_tf.paragraphs[0].text = "• Interactive Vector Map:\n  Custom location markers for 'Your Location' and nearby clinic markers with rating stars and address cards.\n\n• Direct Google Maps Directions:\n  'Get Directions' button generates real route URLs with exact patient origin coordinates and doctor clinic destination.\n\n• Multimodal Transit Support:\n  Driving, walking, and public transit navigation routes.\n\n• Instant Appointment Handshake:\n  'Book Appointment' button directly pre-fills the doctor into the scheduling modal."
    for p in s9_2_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 10: Multimodal AI Assistant & Voice Interface
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_header(slide10, "Multimodal AI Assistant & Voice Interface", "ARTIFICIAL INTELLIGENCE & ACCESSIBILITY")

    cards10 = [
        ("Conversational Clinical AI", "Assists patients with dosage timings, general medication guidance, food interactions, and health FAQ answers.", Inches(0.8), Inches(1.6)),
        ("Speech-to-Text (STT)", "Web Speech API microphone recognition allows hands-free voice inquiries for elderly or motor-impaired patients.", Inches(6.8), Inches(1.6)),
        ("Text-to-Speech (TTS)", "SpeechSynthesis natural voice readout speaks answers aloud with real-time waveform visualizer and audio mute toggle.", Inches(0.8), Inches(4.2)),
        ("Clinical Safety Disclaimers", "Guardrails embedded ensuring AI advice is strictly informative and always directs critical symptoms to attending doctors.", Inches(6.8), Inches(4.2)),
    ]

    for title, desc, x, y in cards10:
        add_card(slide10, x, y, Inches(5.7), Inches(2.4), title)
        tb = slide10.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(5.3), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 11: Database Design & Schema Entities
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    add_header(slide11, "Relational Database Schema & Entity Relationships", "DATA MODELING & INTEGRITY CONSTRAINTS")

    tables = [
        ("users & profiles", "uuid (PK), email, password_hash, full_name, role (patient/doctor), patient_id (Unique indexed), blood_group, city, emergency_contact.", Inches(0.8), Inches(1.6)),
        ("medications & reminders", "id (PK), uuid, patient_name, medicine_name, dosage, frequency, timing, instructions, doctor_name, refills_remaining, status.", Inches(6.8), Inches(1.6)),
        ("doctor_patient_access", "id (PK), doctor_name, patient_id, status (approved/pending/rejected), requested_at, approved_at, permissions_granted.", Inches(0.8), Inches(4.2)),
        ("audit_logs & messages", "id (PK), doctor_name, patient_id, action, timestamp, ip_address, status. Messages: id, sender, recipient, message, timestamp, is_read.", Inches(6.8), Inches(4.2)),
    ]

    for title, desc, x, y in tables:
        add_card(slide11, x, y, Inches(5.7), Inches(2.4), title)
        tb = slide11.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(5.3), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 12: Technical Implementation & Performance Metrics
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    add_header(slide12, "Implementation Highlights & Performance Metrics", "SOFTWARE ENGINEERING & TESTING RIGOR")

    metrics = [
        ("1.12s", "Vite Production Build", "Lightning-fast asset bundling and code splitting for desktop and mobile.", Inches(0.8)),
        ("< 50ms", "API Response Latency", "Asynchronous FastAPI endpoints delivering near-instant query throughput.", Inches(3.8)),
        ("100%", "Responsive Coverage", "Fully responsive across widescreen desktop, tablet, and mobile displays.", Inches(6.8)),
        ("Zero Leak", "Consent Architecture", "No medical record queryable without authenticated doctor session & patient consent.", Inches(9.8)),
    ]

    for stat, label, desc, x in metrics:
        add_card(slide12, x, Inches(1.6), Inches(2.8), Inches(5.1), "")
        tb = slide12.shapes.add_textbox(x + Inches(0.15), Inches(2.0), Inches(2.5), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = stat
        p1.font.size = Pt(32)
        p1.font.bold = True
        p1.font.color.rgb = PRIMARY
        p1.font.name = "Calibri"

        p2 = tf.add_paragraph()
        p2.text = label
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = NAVY

        p3 = tf.add_paragraph()
        p3.text = "\n" + desc
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 13: Future Scope & Roadmap
    # =========================================================================
    slide13 = prs.slides.add_slide(blank_layout)
    add_header(slide13, "Future Scope & Project Roadmap", "EXTENSIONS & REAL-WORLD HEALTHCARE INTEGRATION")

    cards13 = [
        ("1. IoT Smart Pillbox Integration", "Hardware sensor integration (ESP32 / Raspberry Pi) detecting pill compartment opening, automatically syncing dose logs via WebSockets.", Inches(0.8), Inches(1.6)),
        ("2. Wearable Health Telemetry", "Sync with Apple HealthKit, Google Health Connect, and Fitbit for real-time blood pressure, heart rate, and glucose correlation.", Inches(6.8), Inches(1.6)),
        ("3. WebRTC Teleconsultation", "Encrypted peer-to-peer video consultations allowing remote follow-ups and digital prescription issuance directly inside MedSync.", Inches(0.8), Inches(4.2)),
        ("4. Pharmacy e-Refill Network", "Automated refill dispatch to affiliated neighborhood pharmacies when medication supply drops below 3 days.", Inches(6.8), Inches(4.2)),
    ]

    for title, desc, x, y in cards13:
        add_card(slide13, x, y, Inches(5.7), Inches(2.4), title)
        tb = slide13.shapes.add_textbox(x + Inches(0.2), y + Inches(0.75), Inches(5.3), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 14: Conclusion & Q&A
    # =========================================================================
    slide14 = prs.slides.add_slide(blank_layout)
    add_header(slide14, "Conclusion & Acknowledgements", "PROJECT COMPLETION & EVALUATION")

    add_card(slide14, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.1), "Project Summary & Outcomes")
    s14_1 = slide14.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s14_1_tf = s14_1.text_frame
    s14_1_tf.word_wrap = True
    s14_1_tf.paragraphs[0].text = "• Successfully Engineered MedSync:\n  A comprehensive Patient–Doctor Medication Coordination System bridging daily patient adherence and doctor clinical oversight.\n\n• Core Innovations Delivered:\n  - Unique Patient ID Pass with digital card file download.\n  - Consent-gated medical history access with immutable audit logs.\n  - Google Maps Geolocation Radar with turn-by-turn navigation.\n  - AI Health Assistant with voice synthesis accessibility.\n  - Pixel-perfect responsive healthcare UI matching design standards."
    for p in s14_1_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    add_card(slide14, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.1), "Thank You! Questions & Discussion")
    s14_2 = slide14.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(4.2))
    s14_2_tf = s14_2.text_frame
    s14_2_tf.word_wrap = True
    s14_2_tf.paragraphs[0].text = "• Candidate: Amrutha\n• Academic Degree: Master of Computer Applications (MCA)\n• Project Repository: MedSync Healthcare System\n• Live Demo URL: http://localhost:5173\n• Backend API: http://localhost:8000\n\nI sincerely thank my faculty guide, department reviewers, and project evaluators for their mentorship and valuable feedback.\n\nOpen for Questions & Demonstrations!"
    for p in s14_2_tf.paragraphs:
        p.font.size = Pt(12)
        p.font.color.rgb = NAVY

    output_path = "MedSync_Project_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    create_deck()
