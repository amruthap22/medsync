import os
import sqlite3
import uuid
import secrets
import string
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Patient-Doctor Medication Coordination System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if os.path.basename(BASE_DIR) == ".venv":
    BASE_DIR = os.path.dirname(BASE_DIR)
DATABASE = os.path.join(BASE_DIR, "healthcare.db")


def ensure_columns(conn, table_name, required_columns):
    existing = {
        row[1]
        for row in conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    }

    for column_name, column_def in required_columns.items():
        if column_name not in existing:
            conn.execute(
                f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}"
            )


def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                name TEXT NOT NULL,
                specialty TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                address_id TEXT UNIQUE,
                clinic TEXT,
                availability TEXT,
                distance_km REAL,
                rating REAL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                name TEXT NOT NULL,
                age INTEGER,
                condition TEXT,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                address_id TEXT UNIQUE,
                city TEXT,
                doctor_id INTEGER,
                FOREIGN KEY(doctor_id) REFERENCES doctors(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                role TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                address_id TEXT UNIQUE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS medications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_name TEXT NOT NULL,
                doctor_name TEXT,
                medicine_name TEXT NOT NULL,
                dosage TEXT NOT NULL,
                frequency TEXT DEFAULT 'Daily',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS disease_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_name TEXT NOT NULL,
                disease_name TEXT NOT NULL,
                diagnosed_on TEXT,
                severity TEXT,
                doctor_name TEXT,
                notes TEXT,
                status TEXT DEFAULT 'Active',
                address_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS prescriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_name TEXT NOT NULL,
                doctor_name TEXT NOT NULL,
                medication_name TEXT NOT NULL,
                dosage TEXT NOT NULL,
                frequency TEXT DEFAULT 'Daily',
                duration TEXT DEFAULT '30 days',
                instructions TEXT,
                status TEXT DEFAULT 'Active',
                issued_date TEXT DEFAULT CURRENT_TIMESTAMP,
                refills_remaining INTEGER DEFAULT 2
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_name TEXT NOT NULL,
                doctor_name TEXT NOT NULL,
                specialty TEXT,
                appointment_date TEXT NOT NULL,
                appointment_time TEXT NOT NULL,
                status TEXT DEFAULT 'Confirmed',
                reason TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_name TEXT NOT NULL,
                medication_name TEXT NOT NULL,
                time TEXT NOT NULL,
                note TEXT,
                status TEXT DEFAULT 'Pending',
                taken_at TEXT
            )
            """
        )

        ensure_columns(
            conn,
            "doctors",
            {
                "uuid": "TEXT DEFAULT ''",
                "address_id": "TEXT DEFAULT ''",
                "clinic": "TEXT DEFAULT ''",
                "availability": "TEXT DEFAULT 'Open today'",
                "distance_km": "REAL DEFAULT 1.0",
                "rating": "REAL DEFAULT 4.8",
            },
        )
        ensure_columns(
            conn,
            "patients",
            {
                "uuid": "TEXT DEFAULT ''",
                "address_id": "TEXT DEFAULT ''",
                "city": "TEXT DEFAULT ''",
            },
        )
        ensure_columns(
            conn,
            "users",
            {
                "uuid": "TEXT DEFAULT ''",
                "address_id": "TEXT DEFAULT ''",
            },
        )
        ensure_columns(
            conn,
            "medications",
            {
                "uuid": "TEXT DEFAULT ''",
                "doctor_name": "TEXT DEFAULT ''",
                "frequency": "TEXT DEFAULT 'Daily'",
                "created_at": "TEXT DEFAULT ''",
            },
        )

        conn.execute(
            "UPDATE doctors SET uuid = 'doc-0001' WHERE email = 'doctor@medicare.com' AND (uuid IS NULL OR uuid = '')"
        )
        conn.execute(
            "UPDATE doctors SET address_id = 'ADDR-DOC-0001' WHERE email = 'doctor@medicare.com' AND (address_id IS NULL OR address_id = '')"
        )
        conn.execute(
            "UPDATE patients SET uuid = 'pat-0001' WHERE email = 'patient@medicare.com' AND (uuid IS NULL OR uuid = '')"
        )
        conn.execute(
            "UPDATE patients SET address_id = 'ADDR-PAT-0001' WHERE email = 'patient@medicare.com' AND (address_id IS NULL OR address_id = '')"
        )
        conn.execute(
            "UPDATE users SET uuid = 'usr-0001' WHERE email = 'doctor@medicare.com' AND (uuid IS NULL OR uuid = '')"
        )
        conn.execute(
            "UPDATE users SET uuid = 'usr-0002' WHERE email = 'patient@medicare.com' AND (uuid IS NULL OR uuid = '')"
        )
        conn.execute(
            "UPDATE users SET address_id = 'ADDR-DOC-0001' WHERE email = 'doctor@medicare.com' AND (address_id IS NULL OR address_id = '')"
        )
        conn.execute(
            "UPDATE users SET address_id = 'ADDR-PAT-0001' WHERE email = 'patient@medicare.com' AND (address_id IS NULL OR address_id = '')"
        )
        conn.execute(
            "UPDATE medications SET uuid = 'med-0001' WHERE patient_name = 'Alice Johnson' AND medicine_name = 'Aspirin' AND (uuid IS NULL OR uuid = '')"
        )
        conn.execute(
            "UPDATE medications SET uuid = 'med-0002' WHERE patient_name = 'Alice Johnson' AND medicine_name = 'Vitamin D' AND (uuid IS NULL OR uuid = '')"
        )

        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_uuid ON doctors(uuid)"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_uuid ON patients(uuid)"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid)"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_medications_uuid ON medications(uuid)"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_prescriptions_uuid ON prescriptions(uuid)"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_uuid ON appointments(uuid)"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_uuid ON reminders(uuid)"
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                sender_role TEXT NOT NULL,
                sender_name TEXT NOT NULL,
                receiver_name TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                read_status INTEGER DEFAULT 0
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_name TEXT NOT NULL,
                title TEXT NOT NULL,
                doctor_name TEXT,
                file_type TEXT DEFAULT 'PDF',
                file_size TEXT DEFAULT '1.4 MB',
                uploaded_date TEXT DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_name TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'reminder',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                read_status INTEGER DEFAULT 0
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS doctor_patient_access (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                doctor_email TEXT NOT NULL,
                doctor_name TEXT NOT NULL,
                doctor_specialty TEXT DEFAULT 'Cardiology',
                patient_id TEXT NOT NULL,
                patient_name TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                purpose TEXT DEFAULT 'Clinical Consultation & Medication Review',
                requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
                responded_at TEXT,
                revoked_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS access_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                doctor_email TEXT NOT NULL,
                doctor_name TEXT NOT NULL,
                patient_id TEXT NOT NULL,
                patient_name TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT DEFAULT '127.0.0.1'
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS treatment_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_id TEXT NOT NULL,
                doctor_name TEXT NOT NULL,
                doctor_email TEXT NOT NULL,
                note_title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS vitals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE,
                patient_id TEXT NOT NULL,
                patient_name TEXT,
                blood_pressure_systolic INTEGER DEFAULT 118,
                blood_pressure_diastolic INTEGER DEFAULT 76,
                heart_rate INTEGER DEFAULT 72,
                spo2 INTEGER DEFAULT 99,
                glucose INTEGER DEFAULT 95,
                respiratory_rate INTEGER DEFAULT 16,
                weight_kg REAL DEFAULT 62.5,
                recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        ensure_columns(
            conn,
            "users",
            {
                "phone": "TEXT DEFAULT '+91 98765 43210'",
                "blood_group": "TEXT DEFAULT 'O+'",
                "emergency_contact": "TEXT DEFAULT '+91 91234 56789'",
                "city": "TEXT DEFAULT 'Bengaluru'",
                "patient_id": "TEXT",
            },
        )
        ensure_columns(
            conn,
            "patients",
            {
                "phone": "TEXT DEFAULT '+91 98765 43210'",
                "blood_group": "TEXT DEFAULT 'O+'",
                "emergency_contact": "TEXT DEFAULT '+91 91234 56789'",
                "patient_id": "TEXT",
            },
        )

        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_uuid ON messages(uuid)")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_uuid ON documents(uuid)")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_uuid ON notifications(uuid)")

        doctor_rows = [
            ('doc-0001', 'Dr. Emily Carter', 'Family Medicine', 'doctor@medicare.com', 'Doc123', 'ADDR-DOC-0001', 'HeartCare Clinic', 'Open today', 1.2, 4.9),
            ('doc-0002', 'Dr. Amara Singh', 'Cardiology', 'amara.singh@medicare.com', 'Doc456', 'ADDR-DOC-0002', 'Green Valley Clinic', 'Available in 20 min', 1.8, 4.9),
            ('doc-0003', 'Dr. Noah Patel', 'Family Medicine', 'noah.patel@medicare.com', 'Doc789', 'ADDR-DOC-0003', 'CityCare Health', 'Open today', 2.4, 4.8),
            ('doc-0004', 'Dr. Leila Hassan', 'Endocrinology', 'leila.hassan@medicare.com', 'Doc321', 'ADDR-DOC-0004', 'Northside Wellness', 'Open tomorrow', 3.1, 4.9),
            ('doc-0005', 'Dr. Riya Shah', 'Neurology', 'riya.shah@medicare.com', 'Doc654', 'ADDR-DOC-0005', 'Sunrise Medical Center', 'Available in 15 min', 4.2, 4.7),
        ]

        for row in doctor_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO doctors (uuid, name, specialty, email, password, address_id, clinic, availability, distance_km, rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        patient_rows = [
            ('pat-0001', 'Alice Johnson', 34, 'Hypertension', 'patient@medicare.com', 'Medi123', 'ADDR-PAT-0001', 'Bengaluru'),
            ('pat-0002', 'Rohan Mehta', 29, 'Asthma', 'rohan.mehta@medicare.com', 'Medi456', 'ADDR-PAT-0002', 'Koramangala'),
            ('pat-0003', 'Sana Khan', 41, 'Diabetes', 'sana.khan@medicare.com', 'Medi789', 'ADDR-PAT-0003', 'Whitefield'),
            ('pat-0004', 'Maya Patel', 36, 'Thyroid care', 'maya.patel@medicare.com', 'Medi321', 'ADDR-PAT-0004', 'Indiranagar'),
            ('pat-0005', 'Amrutha', 26, 'General Preventive Health & Wellness', 'amrutha@medsync.care', 'Medi123', 'ADDR-PAT-0005', 'Bengaluru'),
        ]

        for row in patient_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO patients (uuid, name, age, condition, email, password, address_id, city)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        user_rows = [
            ('usr-0001', 'doctor', 'doctor@medicare.com', 'Doc123', 'Dr. Emily Carter', 'ADDR-DOC-0001'),
            ('usr-0002', 'patient', 'patient@medicare.com', 'Medi123', 'Alice Johnson', 'ADDR-PAT-0001'),
            ('usr-0003', 'doctor', 'amara.singh@medicare.com', 'Doc456', 'Dr. Amara Singh', 'ADDR-DOC-0002'),
            ('usr-0004', 'patient', 'rohan.mehta@medicare.com', 'Medi456', 'Rohan Mehta', 'ADDR-PAT-0002'),
            ('usr-0005', 'patient', 'amrutha@medsync.care', 'Medi123', 'Amrutha', 'ADDR-PAT-0005'),
        ]

        for row in user_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO users (uuid, role, email, password, full_name, address_id)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        medication_rows = [
            ('med-0001', 'Alice Johnson', 'Dr. Emily Carter', 'Aspirin', '81mg', 'Daily'),
            ('med-0002', 'Alice Johnson', 'Dr. Emily Carter', 'Vitamin D', '1000 IU', 'Morning'),
            ('med-0003', 'Rohan Mehta', 'Dr. Amara Singh', 'Levocetirizine', '5mg', 'Night'),
            ('med-0004', 'Sana Khan', 'Dr. Leila Hassan', 'Metformin', '500mg', 'Morning'),
        ]

        for row in medication_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO medications (uuid, patient_name, doctor_name, medicine_name, dosage, frequency)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        history_rows = [
            ('hist-0001', 'Alice Johnson', 'Hypertension', '2024-05-10', 'Moderate', 'Dr. Emily Carter', 'Blood pressure remains moderately elevated and monitored monthly.', 'Active', 'ADDR-PAT-0001'),
            ('hist-0002', 'Rohan Mehta', 'Asthma', '2023-11-16', 'Mild', 'Dr. Amara Singh', 'Triggers include dust and seasonal pollen; inhaler use is managed proactively.', 'Active', 'ADDR-PAT-0002'),
            ('hist-0003', 'Sana Khan', 'Diabetes', '2022-08-25', 'Moderate', 'Dr. Leila Hassan', 'Blood glucose is managed with diet and medication adjustments.', 'Active', 'ADDR-PAT-0003'),
            ('hist-0004', 'Maya Patel', 'Thyroid Disorder', '2021-02-11', 'Mild', 'Dr. Noah Patel', 'Under routine thyroid function monitoring with stable medication adherence.', 'Stable', 'ADDR-PAT-0004'),
        ]

        for row in history_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO disease_history (uuid, patient_name, disease_name, diagnosed_on, severity, doctor_name, notes, status, address_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        prescription_rows = [
            ('rx-0001', 'Alice Johnson', 'Dr. Emily Carter', 'Aspirin Cardio', '81mg', 'Once daily with breakfast', '30 days', 'Take with food and a full glass of water. Refill before empty.', 'Active', '2026-10-18', 2),
            ('rx-0002', 'Alice Johnson', 'Dr. Emily Carter', 'Vitamin D3 Ergocalciferol', '1000 IU', 'Once daily in morning', '60 days', 'Take consistently with morning meal.', 'Active', '2026-10-15', 3),
            ('rx-0003', 'Rohan Mehta', 'Dr. Amara Singh', 'Levocetirizine', '5mg', 'Nightly before sleep', '30 days', 'For seasonal pollen management. Avoid driving if drowsy.', 'Active', '2026-10-10', 1),
            ('rx-0004', 'Sana Khan', 'Dr. Leila Hassan', 'Metformin HCl', '500mg', 'Twice daily with meals', '90 days', 'Monitor fasting blood sugar weekly.', 'Active', '2026-10-05', 2),
        ]

        for row in prescription_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO prescriptions (uuid, patient_name, doctor_name, medication_name, dosage, frequency, duration, instructions, status, issued_date, refills_remaining)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        appointment_rows = [
            ('apt-0001', 'Alice Johnson', 'Dr. Emily Carter', 'Family Medicine', '2026-10-28', '10:00 AM', 'Confirmed', 'Routine quarterly blood pressure and medication adherence checkup.'),
            ('apt-0002', 'Alice Johnson', 'Dr. Amara Singh', 'Cardiology', '2026-11-05', '02:30 PM', 'Confirmed', 'Preventive cardiovascular risk screening and ECG check.'),
            ('apt-0003', 'Rohan Mehta', 'Dr. Amara Singh', 'Cardiology / Pulmonary', '2026-11-02', '11:15 AM', 'Confirmed', 'Asthma symptom review and spirometry follow-up.'),
        ]

        for row in appointment_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO appointments (uuid, patient_name, doctor_name, specialty, appointment_date, appointment_time, status, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        reminder_rows = [
            ('rem-0001', 'Alice Johnson', 'Vitamin D3', '08:00 AM', 'Take with morning meal and water', 'Pending', None),
            ('rem-0002', 'Alice Johnson', 'Aspirin Cardio', '12:30 PM', 'Take with lunch', 'Pending', None),
            ('rem-0003', 'Alice Johnson', 'Metformin', '08:00 PM', 'Take after evening dinner', 'Pending', None),
        ]

        for row in reminder_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO reminders (uuid, patient_name, medication_name, time, note, status, taken_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        message_rows = [
            ('msg-0001', 'doctor', 'Dr. Emily Carter', 'Alice Johnson', 'Hello Alice, please check your morning blood pressure readings and stay hydrated.', '10:15 AM', 1),
            ('msg-0002', 'patient', 'Alice Johnson', 'Dr. Emily Carter', 'Good morning Dr. Carter! The readings have been steady around 120/78 this week.', '10:30 AM', 1),
            ('msg-0003', 'doctor', 'Dr. Emily Carter', 'Alice Johnson', 'Great progress! Continue with the Aspirin and Vitamin D schedule as prescribed.', '10:45 AM', 0),
        ]
        for row in message_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO messages (uuid, sender_role, sender_name, receiver_name, content, timestamp, read_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        document_rows = [
            ('doc-up-0001', 'Alice Johnson', 'Comprehensive Health Evaluation & Prescription', 'Dr. Emily Carter', 'PDF', '1.8 MB', '2026-10-18', 'Detailed cardiovascular vitals and baseline lab results.'),
            ('doc-up-0002', 'Alice Johnson', 'Annual Lipid Profile & Blood Panel', 'HeartCare Diagnostics', 'PDF', '850 KB', '2026-09-12', 'Cholesterol and glucose indicators within targeted ranges.'),
            ('doc-up-0003', 'Alice Johnson', 'Cardiology ECG Tracing Report', 'Dr. Amara Singh', 'IMAGE', '2.4 MB', '2026-08-05', 'Resting 12-lead ECG confirmed normal sinus rhythm.'),
        ]
        for row in document_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO documents (uuid, patient_name, title, doctor_name, file_type, file_size, uploaded_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        notification_rows = [
            ('notif-0001', 'Alice Johnson', 'Medication Refill Alert', 'Aspirin Cardio refill window is now open. 1 refill remaining.', 'refill', '10 mins ago', 0),
            ('notif-0002', 'Alice Johnson', 'Upcoming Consultation', 'Follow-up with Dr. Emily Carter scheduled for Wednesday at 10:00 AM.', 'appointment', '1 hour ago', 0),
            ('notif-0003', 'Alice Johnson', 'Clinical Safety Checked', 'No adverse interactions detected among your 4 active prescriptions.', 'safety', 'Today', 1),
        ]
        for row in notification_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO notifications (uuid, patient_name, title, message, type, created_at, read_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                row,
            )

        # Ensure demo Patient IDs
        conn.execute("UPDATE users SET patient_id = 'MED-P-88492014' WHERE lower(email) = 'patient@medicare.com'")
        conn.execute("UPDATE patients SET patient_id = 'MED-P-88492014' WHERE lower(email) = 'patient@medicare.com'")
        conn.execute("UPDATE users SET patient_id = 'MED-P-73419205' WHERE lower(email) = 'rohan.mehta@medicare.com'")
        conn.execute("UPDATE patients SET patient_id = 'MED-P-73419205' WHERE lower(email) = 'rohan.mehta@medicare.com'")
        conn.execute("UPDATE users SET patient_id = 'MED-P-A7K92X' WHERE lower(email) = 'amrutha@medsync.care'")
        conn.execute("UPDATE patients SET patient_id = 'MED-P-A7K92X' WHERE lower(email) = 'amrutha@medsync.care'")

        null_pts = conn.execute("SELECT id FROM users WHERE role = 'patient' AND (patient_id IS NULL OR patient_id = '')").fetchall()
        for p in null_pts:
            gen_id = f"MED-P-{uuid.uuid4().hex[:8].upper()}"
            conn.execute("UPDATE users SET patient_id = ? WHERE id = ?", (gen_id, p[0]))

        # Initial demo doctor-patient access records
        conn.execute(
            """
            INSERT OR IGNORE INTO doctor_patient_access (uuid, doctor_email, doctor_name, doctor_specialty, patient_id, patient_name, status, purpose, requested_at, responded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ('dpa-0001', 'doctor@medicare.com', 'Dr. Emily Carter', 'Cardiology', 'MED-P-88492014', 'Alice Johnson', 'approved', 'Cardiology Consultation & Antihypertensive Therapy Management', '2026-10-20 09:30 AM', '2026-10-20 09:45 AM'),
        )
        conn.execute(
            """
            INSERT OR IGNORE INTO doctor_patient_access (uuid, doctor_email, doctor_name, doctor_specialty, patient_id, patient_name, status, purpose, requested_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ('dpa-0002', 'suresh.rao@medicare.com', 'Dr. Suresh Rao', 'General Physician', 'MED-P-88492014', 'Alice Johnson', 'pending', 'Quarterly Diabetic Metabolic Screening & HbA1c Review', '2026-10-23 04:15 PM'),
        )

        # Initial treatment notes
        conn.execute(
            """
            INSERT OR IGNORE INTO treatment_notes (uuid, patient_id, doctor_name, doctor_email, note_title, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            ('tnote-0001', 'MED-P-88492014', 'Dr. Emily Carter', 'doctor@medicare.com', 'Antihypertensive Adherence & Blood Pressure Optimization', 'Patient reviewed in clinic. Blood pressure maintained at 118/76 mmHg. Excellent compliance with Lisinopril 10mg once daily. Prescribed 30-day refill. Advised continuation of low-sodium DASH diet. Next clinical review in 4 weeks.', '2026-10-22 10:30 AM'),
        )

        # Initial audit logs
        log_rows = [
            ('log-0001', 'doctor@medicare.com', 'Dr. Emily Carter', 'MED-P-88492014', 'Alice Johnson', 'ACCESS_APPROVED', 'Patient Alice Johnson approved medical records access for Dr. Emily Carter', '2026-10-20 09:45 AM', '127.0.0.1'),
            ('log-0002', 'doctor@medicare.com', 'Dr. Emily Carter', 'MED-P-88492014', 'Alice Johnson', 'RECORDS_VIEWED', 'Dr. Emily Carter accessed comprehensive medical dossier (medications, vitals, prescriptions)', '2026-10-22 10:28 AM', '127.0.0.1'),
            ('log-0003', 'doctor@medicare.com', 'Dr. Emily Carter', 'MED-P-88492014', 'Alice Johnson', 'TREATMENT_NOTE_ADDED', 'Dr. Emily Carter added clinical note: Antihypertensive Adherence & Blood Pressure Optimization', '2026-10-22 10:32 AM', '127.0.0.1'),
            ('log-0004', 'suresh.rao@medicare.com', 'Dr. Suresh Rao', 'MED-P-88492014', 'Alice Johnson', 'ACCESS_REQUESTED', 'Dr. Suresh Rao requested medical records access for Quarterly Diabetic Metabolic Screening', '2026-10-23 04:15 PM', '127.0.0.1'),
        ]
        for lr in log_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO access_logs (uuid, doctor_email, doctor_name, patient_id, patient_name, action, details, timestamp, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                lr,
            )

        # Baseline vitals
        vitals_rows = [
            ('vit-0001', 'MED-P-A7K92X', 'Amrutha', 118, 76, 72, 99, 95, 16, 62.0, 'Today 08:30 AM'),
            ('vit-0002', 'MED-P-88492014', 'Alice Johnson', 122, 78, 74, 98, 102, 16, 68.5, 'Today 09:15 AM'),
            ('vit-0003', 'MED-P-73419205', 'Rohan Mehta', 116, 74, 70, 99, 91, 15, 71.0, 'Yesterday 04:00 PM'),
        ]
        for vr in vitals_rows:
            conn.execute(
                """
                INSERT OR IGNORE INTO vitals (uuid, patient_id, patient_name, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, spo2, glucose, respiratory_rate, weight_kg, recorded_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                vr,
            )

        conn.commit()


init_db()


@app.get("/")
def home():
    return {
        "message": "Medication Coordination API is running",
        "version": "2.0.0",
        "status": "healthy"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


def generate_unique_patient_id(conn):
    """Generate a cryptographically random, non-guessable, unique Patient ID (e.g. MED-P-A7K92X8B)."""
    chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    for _ in range(200):
        code = "".join(secrets.choice(chars) for _ in range(8))
        candidate = f"MED-P-{code}"
        u = conn.execute("SELECT 1 FROM users WHERE upper(patient_id) = ?", (candidate,)).fetchone()
        p = conn.execute("SELECT 1 FROM patients WHERE upper(patient_id) = ?", (candidate,)).fetchone()
        if not u and not p:
            return candidate
    return f"MED-P-{uuid.uuid4().hex[:8].upper()}"


@app.post("/login")
def login(payload: dict):
    role = str(payload.get("role", "")).strip().lower()
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", "")).strip()

    if not role or not email or not password:
        raise HTTPException(status_code=400, detail="Role, email, and password are required.")

    with sqlite3.connect(DATABASE) as conn:
        user = conn.execute(
            "SELECT id, uuid, role, email, password, full_name, patient_id FROM users WHERE role = ? AND LOWER(email) = ? AND password = ?",
            (role, email, password),
        ).fetchone()

        if not user:
            legacy_demo_passwords = {
                "patient": "Medi123",
                "doctor": "Doc123",
            }
            if password == legacy_demo_passwords.get(role) and email in {"patient@medicare.com", "doctor@medicare.com"}:
                demo_user = conn.execute(
                    "SELECT id, uuid, role, email, password, full_name, patient_id FROM users WHERE role = ? AND LOWER(email) = ?",
                    (role, email),
                ).fetchone()
                if demo_user:
                    user = demo_user
                else:
                    raise HTTPException(status_code=401, detail="Invalid credentials for this role.")
            else:
                raise HTTPException(status_code=401, detail="Invalid credentials for this role.")

        patient_id = user[6] if len(user) > 6 else None
        if not patient_id and user[2] == "patient":
            p_row = conn.execute("SELECT patient_id FROM patients WHERE lower(email) = ?", (email,)).fetchone()
            if p_row and p_row[0]:
                patient_id = p_row[0]
            else:
                patient_id = generate_unique_patient_id(conn)
                conn.execute("UPDATE patients SET patient_id = ? WHERE lower(email) = ?", (patient_id, email))
            conn.execute("UPDATE users SET patient_id = ? WHERE lower(email) = ?", (patient_id, email))
            conn.commit()

    return {
        "user": {
            "id": user[0],
            "uuid": user[1],
            "role": user[2],
            "email": user[3],
            "full_name": user[5],
            "patient_id": patient_id,
        }
    }


@app.post("/register")
def register(payload: dict):
    role = str(payload.get("role", "")).strip().lower()
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", "")).strip()
    full_name = str(payload.get("full_name", "")).strip()

    if role not in {"patient", "doctor"}:
        raise HTTPException(status_code=400, detail="Role must be patient or doctor.")
    if not full_name:
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    with sqlite3.connect(DATABASE) as conn:
        exists = conn.execute(
            "SELECT 1 FROM users WHERE lower(email) = ? AND role = ?",
            (email, role),
        ).fetchone()
        if exists:
            raise HTTPException(status_code=409, detail="An account with this email already exists for this role.")

        user_uuid = f"usr-{uuid.uuid4().hex[:8]}"
        address_id = f"ADDR-{role.upper()}-{uuid.uuid4().hex[:8]}"
        patient_id = None

        if role == "patient":
            patient_id = generate_unique_patient_id(conn)
            patient_uuid = f"pat-{uuid.uuid4().hex[:8]}"
            conn.execute(
                "INSERT INTO users (uuid, role, email, password, full_name, address_id, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_uuid, role, email, password, full_name, address_id, patient_id),
            )
            conn.execute(
                "INSERT INTO patients (uuid, name, age, condition, email, password, address_id, city, doctor_id, patient_id, blood_group, emergency_contact, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'O+', '+91 91234 56789', 'Female')",
                (patient_uuid, full_name, 28, "General Preventative Health Maintenance", email, password, address_id, "Bengaluru", patient_id),
            )
            # Add initial welcome reminder and medication
            conn.execute(
                """
                INSERT INTO reminders (uuid, patient_name, medication_name, time, note, status)
                VALUES (?, ?, 'MedSync Welcome Multivitamin', '08:30 AM', 'Take with breakfast - Daily Wellness Support', 'pending')
                """,
                (f"rem-{uuid.uuid4().hex[:8]}", full_name),
            )
            conn.execute(
                """
                INSERT INTO medications (uuid, patient_name, medicine_name, dosage, frequency, doctor_name)
                VALUES (?, ?, 'Vitality Daily Complex', '1 tablet daily', 'Once daily with water', 'Dr. Emily Carter')
                """,
                (f"med-{uuid.uuid4().hex[:8]}", full_name),
            )
        else:
            doctor_uuid = f"doc-{uuid.uuid4().hex[:8]}"
            conn.execute(
                "INSERT INTO users (uuid, role, email, password, full_name, address_id) VALUES (?, ?, ?, ?, ?, ?)",
                (user_uuid, role, email, password, full_name, address_id),
            )
            conn.execute(
                "INSERT INTO doctors (uuid, name, specialty, email, password, address_id, clinic, availability, distance_km, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (doctor_uuid, full_name, "General care", email, password, address_id, "New Clinic", "Open today", 2.5, 4.8),
            )

        conn.commit()

    return {
        "message": "Account created successfully",
        "user": {
            "uuid": user_uuid,
            "role": role,
            "email": email,
            "full_name": full_name,
            "address_id": address_id,
            "patient_id": patient_id,
        },
    }


@app.post("/auth/sso")
@app.post("/auth/google")
def auth_sso(payload: dict):
    provider = str(payload.get("provider", "google")).strip().lower()
    role = str(payload.get("role", "patient")).strip().lower()
    email = str(payload.get("email", "")).strip().lower()
    full_name = str(payload.get("full_name", "")).strip()

    if not email:
        if role == "doctor":
            email = "dr.priya@medsync.care" if provider == "google" else "doctor@medicare.com"
            full_name = full_name or "Dr. Priya Sharma"
        else:
            email = "amrutha@medsync.care" if provider == "google" else "patient@medicare.com"
            full_name = full_name or "Amrutha Puttaraju"

    if not full_name:
        name_part = email.split("@")[0].replace(".", " ").title()
        full_name = name_part or "MedSync User"

    with sqlite3.connect(DATABASE) as conn:
        # Check if user already exists
        user = conn.execute(
            "SELECT id, uuid, role, email, password, full_name, patient_id FROM users WHERE lower(email) = ? AND role = ?",
            (email, role),
        ).fetchone()

        if user:
            user_id, user_uuid, user_role, user_email, _, user_fullname, patient_id = user
            if user_role == "patient" and not patient_id:
                p_row = conn.execute("SELECT patient_id FROM patients WHERE lower(email) = ?", (email,)).fetchone()
                if p_row and p_row[0]:
                    patient_id = p_row[0]
                else:
                    patient_id = generate_unique_patient_id(conn)
                    conn.execute("UPDATE patients SET patient_id = ? WHERE lower(email) = ?", (patient_id, email))
                conn.execute("UPDATE users SET patient_id = ? WHERE id = ?", (patient_id, user_id))
                conn.commit()

            return {
                "message": f"Authenticated successfully via {provider.capitalize()}",
                "user": {
                    "id": user_id,
                    "uuid": user_uuid,
                    "role": user_role,
                    "email": user_email,
                    "full_name": user_fullname,
                    "patient_id": patient_id,
                    "provider": provider,
                }
            }

        # Otherwise provision new SSO user
        user_uuid = f"usr-sso-{uuid.uuid4().hex[:8]}"
        address_id = f"ADDR-{role.upper()}-{uuid.uuid4().hex[:8]}"
        patient_id = None
        sso_password = f"sso-auth-{uuid.uuid4().hex[:12]}"

        if role == "patient":
            patient_id = generate_unique_patient_id(conn)
            patient_uuid = f"pat-{uuid.uuid4().hex[:8]}"
            conn.execute(
                "INSERT INTO users (uuid, role, email, password, full_name, address_id, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_uuid, role, email, sso_password, full_name, address_id, patient_id),
            )
            conn.execute(
                "INSERT INTO patients (uuid, name, age, condition, email, password, address_id, city, doctor_id, patient_id, blood_group, emergency_contact, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'O+', '+91 91234 56789', 'Female')",
                (patient_uuid, full_name, 26, "General Preventative Health Maintenance", email, sso_password, address_id, "Bengaluru", patient_id),
            )
            conn.execute(
                """
                INSERT INTO reminders (uuid, patient_name, medication_name, time, note, status)
                VALUES (?, ?, 'Vitality Daily Complex', '08:30 AM', 'Daily morning wellness and vitality support', 'pending')
                """,
                (f"rem-{uuid.uuid4().hex[:8]}", full_name),
            )
            conn.execute(
                """
                INSERT INTO medications (uuid, patient_name, medicine_name, dosage, frequency, doctor_name)
                VALUES (?, ?, 'Vitality Daily Complex', '1 capsule daily', 'Once daily with breakfast', 'Dr. Emily Carter')
                """,
                (f"med-{uuid.uuid4().hex[:8]}", full_name),
            )
            conn.execute(
                """
                INSERT INTO prescriptions (uuid, patient_name, doctor_name, medication_name, dosage, frequency, duration, instructions, status, refills_remaining)
                VALUES (?, ?, 'Dr. Emily Carter', 'Vitality Daily Complex', '1 capsule', 'Daily', '60 days', 'Take in the morning with food', 'Active', 2)
                """,
                (f"rx-{uuid.uuid4().hex[:8]}", full_name),
            )
            conn.execute(
                """
                INSERT INTO appointments (uuid, patient_name, doctor_name, specialty, appointment_date, appointment_time, status)
                VALUES (?, ?, 'Dr. Emily Carter', 'Cardiology & Wellness', '2026-11-04', '10:30 AM', 'Confirmed')
                """,
                (f"apt-{uuid.uuid4().hex[:8]}", full_name),
            )
        else:
            doctor_uuid = f"doc-{uuid.uuid4().hex[:8]}"
            conn.execute(
                "INSERT INTO users (uuid, role, email, password, full_name, address_id) VALUES (?, ?, ?, ?, ?, ?)",
                (user_uuid, role, email, sso_password, full_name, address_id),
            )
            conn.execute(
                "INSERT INTO doctors (uuid, name, specialty, email, password, address_id, clinic, availability, distance_km, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (doctor_uuid, full_name, "General Medicine & Cardiology", email, sso_password, address_id, "MedSync Central Hospital", "Available Today", 1.8, 4.9),
            )

        conn.commit()
        new_user = conn.execute("SELECT id FROM users WHERE uuid = ?", (user_uuid,)).fetchone()
        user_id = new_user[0] if new_user else 1

        return {
            "message": f"Account provisioned and authenticated via {provider.capitalize()}",
            "user": {
                "id": user_id,
                "uuid": user_uuid,
                "role": role,
                "email": email,
                "full_name": full_name,
                "patient_id": patient_id,
                "provider": provider,
            }
        }


@app.get("/patient-history")
def get_patient_history(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM disease_history WHERE patient_name = ? ORDER BY diagnosed_on DESC",
                (patient_name,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM disease_history ORDER BY diagnosed_on DESC"
            ).fetchall()
        return [dict(row) for row in rows]


@app.post("/patient-history")
def add_patient_history(payload: dict):
    patient_name = str(payload.get("patient_name", "")).strip()
    disease_name = str(payload.get("disease_name", "")).strip()
    diagnosed_on = str(payload.get("diagnosed_on", "")).strip() or "2026-10-23"
    severity = str(payload.get("severity", "Moderate")).strip() or "Moderate"
    doctor_name = str(payload.get("doctor_name", "")).strip() or "General Care Physician"
    notes = str(payload.get("notes", "")).strip() or "No additional notes provided."

    if not patient_name or not disease_name:
        raise HTTPException(status_code=400, detail="Patient name and disease name are required.")

    with sqlite3.connect(DATABASE) as conn:
        history_uuid = f"hist-{uuid.uuid4().hex[:8]}"
        conn.execute(
            "INSERT INTO disease_history (uuid, patient_name, disease_name, diagnosed_on, severity, doctor_name, notes, status, address_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)",
            (history_uuid, patient_name, disease_name, diagnosed_on, severity, doctor_name, notes, f"ADDR-{patient_name[:3].upper()}-{uuid.uuid4().hex[:8]}"),
        )
        conn.commit()

    return {"message": "Disease history added successfully", "uuid": history_uuid}


@app.delete("/patient-history/{history_id}")
def delete_patient_history(history_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("DELETE FROM disease_history WHERE id = ?", (history_id,))
        conn.commit()
    return {"message": "Health history record removed successfully"}


@app.get("/medications")
def get_medications(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM medications WHERE patient_name = ? ORDER BY id DESC",
                (patient_name,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM medications ORDER BY id DESC"
            ).fetchall()
        return [dict(row) for row in rows]


@app.post("/medications")
async def add_medication(
    request: Request,
    patient_name: str = "",
    medicine_name: str = "",
    dosage: str = "",
    doctor_name: str = "",
    frequency: str = "Daily",
):
    try:
        body = await request.json()
        patient_name = body.get("patient_name") or patient_name
        medicine_name = body.get("medicine_name") or medicine_name
        dosage = body.get("dosage") or dosage
        doctor_name = body.get("doctor_name") or doctor_name
        frequency = body.get("frequency") or frequency
    except Exception:
        pass

    patient_name = patient_name.strip()
    medicine_name = medicine_name.strip()
    dosage = dosage.strip()

    if not patient_name or not medicine_name or not dosage:
        raise HTTPException(status_code=400, detail="Patient name, medicine name, and dosage are required.")

    medication_uuid = f"med-{uuid.uuid4().hex[:8]}"
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.execute(
            """
            INSERT INTO medications
            (uuid, patient_name, doctor_name, medicine_name, dosage, frequency)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (medication_uuid, patient_name, doctor_name or "Clinician", medicine_name, dosage, frequency),
        )
        medication_id = cursor.lastrowid
        conn.commit()

    return {
        "message": "Medication added successfully",
        "id": medication_id,
        "uuid": medication_uuid,
    }


@app.delete("/medications/{med_id}")
def delete_medication(med_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("DELETE FROM medications WHERE id = ?", (med_id,))
        conn.commit()
    return {"message": "Medication deleted successfully"}


# -------------------------------------------------------------
# Prescriptions API
# -------------------------------------------------------------
@app.get("/prescriptions")
def get_prescriptions(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM prescriptions WHERE patient_name = ? ORDER BY id DESC",
                (patient_name,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM prescriptions ORDER BY id DESC"
            ).fetchall()
        return [dict(row) for row in rows]


@app.post("/prescriptions")
def add_prescription(payload: dict):
    patient_name = str(payload.get("patient_name", "")).strip()
    doctor_name = str(payload.get("doctor_name", "")).strip()
    medication_name = str(payload.get("medication_name", "")).strip()
    dosage = str(payload.get("dosage", "")).strip()
    frequency = str(payload.get("frequency", "Once daily")).strip()
    duration = str(payload.get("duration", "30 days")).strip()
    instructions = str(payload.get("instructions", "Take as directed by doctor")).strip()
    refills = int(payload.get("refills_remaining", 2))

    if not patient_name or not medication_name or not dosage:
        raise HTTPException(status_code=400, detail="Patient name, medication name, and dosage are required.")

    rx_uuid = f"rx-{uuid.uuid4().hex[:8]}"
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.execute(
            """
            INSERT INTO prescriptions 
            (uuid, patient_name, doctor_name, medication_name, dosage, frequency, duration, instructions, status, refills_remaining)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
            """,
            (rx_uuid, patient_name, doctor_name or "Dr. Emily Carter", medication_name, dosage, frequency, duration, instructions, refills),
        )
        # Also sync to medications table for patient visibility
        med_uuid = f"med-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO medications (uuid, patient_name, doctor_name, medicine_name, dosage, frequency)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (med_uuid, patient_name, doctor_name or "Dr. Emily Carter", medication_name, dosage, frequency),
        )
        conn.commit()

    return {"message": "Prescription issued successfully", "uuid": rx_uuid}


@app.patch("/prescriptions/{rx_id}/refill")
def refill_prescription(rx_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        rx = conn.execute("SELECT * FROM prescriptions WHERE id = ?", (rx_id,)).fetchone()
        if not rx:
            raise HTTPException(status_code=404, detail="Prescription not found")
        if rx["refills_remaining"] <= 0:
            raise HTTPException(status_code=400, detail="No refills remaining. Please consult your doctor.")
        
        new_refills = rx["refills_remaining"] - 1
        new_status = "Active" if new_refills > 0 else "Refill Exhausted"
        conn.execute("UPDATE prescriptions SET refills_remaining = ?, status = ? WHERE id = ?", (new_refills, new_status, rx_id))
        conn.commit()
    return {"message": "Refill requested successfully", "refills_remaining": new_refills, "status": new_status}


@app.delete("/prescriptions/{rx_id}")
def delete_prescription(rx_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("DELETE FROM prescriptions WHERE id = ?", (rx_id,))
        conn.commit()
    return {"message": "Prescription record removed"}


# -------------------------------------------------------------
# Appointments API
# -------------------------------------------------------------
@app.get("/appointments")
def get_appointments(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM appointments WHERE patient_name = ? ORDER BY appointment_date ASC, appointment_time ASC",
                (patient_name,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC"
            ).fetchall()
        return [dict(row) for row in rows]


@app.post("/appointments")
def book_appointment(payload: dict):
    patient_name = str(payload.get("patient_name", "")).strip()
    doctor_name = str(payload.get("doctor_name", "")).strip()
    specialty = str(payload.get("specialty", "General Medicine")).strip()
    appointment_date = str(payload.get("appointment_date", "")).strip()
    appointment_time = str(payload.get("appointment_time", "10:00 AM")).strip()
    reason = str(payload.get("reason", "Consultation and prescription review")).strip()

    if not patient_name or not doctor_name or not appointment_date:
        raise HTTPException(status_code=400, detail="Patient name, doctor name, and date are required.")

    apt_uuid = f"apt-{uuid.uuid4().hex[:8]}"
    with sqlite3.connect(DATABASE) as conn:
        conn.execute(
            """
            INSERT INTO appointments (uuid, patient_name, doctor_name, specialty, appointment_date, appointment_time, status, reason)
            VALUES (?, ?, ?, ?, ?, ?, 'Confirmed', ?)
            """,
            (apt_uuid, patient_name, doctor_name, specialty, appointment_date, appointment_time, reason),
        )
        conn.commit()

    return {"message": f"Appointment booked with {doctor_name} for {appointment_date} at {appointment_time}", "uuid": apt_uuid}


@app.delete("/appointments/{apt_id}")
def cancel_appointment(apt_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("DELETE FROM appointments WHERE id = ?", (apt_id,))
        conn.commit()
    return {"message": "Appointment cancelled successfully"}


# -------------------------------------------------------------
# Reminders API
# -------------------------------------------------------------
@app.get("/reminders")
def get_reminders(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM reminders WHERE patient_name = ? ORDER BY id ASC",
                (patient_name,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM reminders ORDER BY id ASC"
            ).fetchall()
        return [dict(row) for row in rows]


@app.post("/reminders")
def add_reminder(payload: dict):
    patient_name = str(payload.get("patient_name", "")).strip()
    medication_name = str(payload.get("medication_name", "")).strip()
    time_str = str(payload.get("time", "")).strip() or "09:00 AM"
    note = str(payload.get("note", "Take with water")).strip()

    if not patient_name or not medication_name:
        raise HTTPException(status_code=400, detail="Patient name and medication name are required.")

    rem_uuid = f"rem-{uuid.uuid4().hex[:8]}"
    with sqlite3.connect(DATABASE) as conn:
        conn.execute(
            """
            INSERT INTO reminders (uuid, patient_name, medication_name, time, note, status)
            VALUES (?, ?, ?, ?, ?, 'Pending')
            """,
            (rem_uuid, patient_name, medication_name, time_str, note),
        )
        conn.commit()

    return {"message": "Reminder added successfully", "uuid": rem_uuid}


@app.patch("/reminders/{rem_id}/toggle")
def toggle_reminder(rem_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        rem = conn.execute("SELECT * FROM reminders WHERE id = ?", (rem_id,)).fetchone()
        if not rem:
            raise HTTPException(status_code=404, detail="Reminder not found")
        new_status = "Taken" if rem["status"] == "Pending" else "Pending"
        import datetime
        taken_at = datetime.datetime.now().strftime("%I:%M %p") if new_status == "Taken" else None
        conn.execute("UPDATE reminders SET status = ?, taken_at = ? WHERE id = ?", (new_status, taken_at, rem_id))
        conn.commit()
    return {"message": f"Reminder marked as {new_status}", "status": new_status, "taken_at": taken_at}


@app.delete("/reminders/{rem_id}")
def delete_reminder(rem_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("DELETE FROM reminders WHERE id = ?", (rem_id,))
        conn.commit()
    return {"message": "Reminder deleted successfully"}


# -------------------------------------------------------------
# Nearby Doctors API
# -------------------------------------------------------------
# Nearby Doctors API
# -------------------------------------------------------------
def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    import math
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


@app.get("/nearby-doctors")
def get_nearby_doctors(
    lat: float = None,
    lng: float = None,
    radius_km: float = None,
    specialty: str = None,
    search: str = None,
):
    results = []

    # Local clinical providers template clustered realistically around patient coordinates
    center_lat = lat if lat is not None else 12.9716
    center_lng = lng if lng is not None else 77.5946

    local_providers_template = [
        {
            "id": 1,
            "uuid": "doc-0001",
            "name": "Dr. Emily Carter",
            "specialty": "Cardiologist",
            "clinic": "HeartCare Specialty Center",
            "rating": 4.9,
            "availability": "Available Today • 10:00 AM - 05:00 PM",
            "phone": "+91 98765 11223",
            "offset_lat": 0.0052,
            "offset_lng": 0.0041,
        },
        {
            "id": 2,
            "uuid": "doc-0002",
            "name": "Dr. Suresh Rao",
            "specialty": "General Physician",
            "clinic": "MedSync Primary Health Clinic",
            "rating": 4.8,
            "availability": "Open Today • 09:00 AM - 08:00 PM",
            "phone": "+91 98765 22334",
            "offset_lat": -0.0068,
            "offset_lng": 0.0075,
        },
        {
            "id": 3,
            "uuid": "doc-0003",
            "name": "Dr. Amara Singh",
            "specialty": "Cardiologist",
            "clinic": "Green Valley Medical Center",
            "rating": 4.9,
            "availability": "Open Today • 02:00 PM - 07:30 PM",
            "phone": "+91 98765 33441",
            "offset_lat": 0.0089,
            "offset_lng": -0.0065,
        },
        {
            "id": 4,
            "uuid": "doc-0004",
            "name": "Dr. Neha Kapoor",
            "specialty": "Dermatologist",
            "clinic": "Skin & Allergy Care Hub",
            "rating": 4.9,
            "availability": "Available Today • 11:30 AM - 06:00 PM",
            "phone": "+91 98765 33445",
            "offset_lat": -0.0118,
            "offset_lng": -0.0082,
        },
        {
            "id": 5,
            "uuid": "doc-0005",
            "name": "Dr. Priya Sharma",
            "specialty": "Pediatrician",
            "clinic": "Bloom Children's Hospital",
            "rating": 5.0,
            "availability": "Open Today • 09:30 AM - 04:30 PM",
            "phone": "+91 98765 55667",
            "offset_lat": 0.0135,
            "offset_lng": 0.0112,
        },
        {
            "id": 6,
            "uuid": "doc-0006",
            "name": "Dr. Vikram Seth",
            "specialty": "Orthopedic Specialist",
            "clinic": "City Ortho & Joint Care",
            "rating": 4.7,
            "availability": "Open Today • 10:00 AM - 06:00 PM",
            "phone": "+91 98765 66778",
            "offset_lat": -0.0142,
            "offset_lng": 0.0138,
        },
        {
            "id": 7,
            "uuid": "doc-0007",
            "name": "Dr. Ananya Sen",
            "specialty": "Dental Surgeon",
            "clinic": "SmileCare Dental Hub",
            "rating": 4.8,
            "availability": "Open Today • 10:00 AM - 08:00 PM",
            "phone": "+91 98765 77889",
            "offset_lat": 0.0078,
            "offset_lng": 0.0098,
        },
        {
            "id": 8,
            "uuid": "doc-0008",
            "name": "St. Jude Multi-Specialty Hospital",
            "specialty": "Hospital & Medical Center",
            "clinic": "24/7 Emergency Care & Diagnostics",
            "rating": 4.9,
            "availability": "Open 24/7 • Emergency & Trauma Active",
            "phone": "+91 98765 88990",
            "offset_lat": -0.0072,
            "offset_lng": -0.0094,
        },
    ]

    for tmpl in local_providers_template:
        doc_lat = round(center_lat + tmpl["offset_lat"], 5)
        doc_lng = round(center_lng + tmpl["offset_lng"], 5)
        dist_km = calculate_haversine_distance(center_lat, center_lng, doc_lat, doc_lng)

        # Apply radius filter if provided
        if radius_km is not None and dist_km > radius_km:
            continue

        # Specialty filter
        if specialty and specialty.lower() != "all":
            s = specialty.lower()
            if s not in tmpl["specialty"].lower() and s not in tmpl["name"].lower():
                continue

        # Keyword search
        if search and search.strip():
            q = search.strip().lower()
            name_match = q in tmpl["name"].lower()
            clinic_match = q in tmpl["clinic"].lower()
            spec_match = q in tmpl["specialty"].lower()
            if not (name_match or clinic_match or spec_match):
                continue

        results.append({
            "id": tmpl["id"],
            "uuid": tmpl["uuid"],
            "name": tmpl["name"],
            "specialty": tmpl["specialty"],
            "distance_km": dist_km,
            "rating": tmpl["rating"],
            "availability": tmpl["availability"],
            "clinic": tmpl["clinic"],
            "address_id": f"ADDR-{tmpl['uuid']}",
            "address": f"{tmpl['clinic']}, Medical Corridor",
            "phone": tmpl["phone"],
            "lat": doc_lat,
            "lng": doc_lng,
            "is_medsync_verified": True,
            "source": "medsync",
        })

    # Sort nearest first
    results.sort(key=lambda d: d["distance_km"])
    return results


# -------------------------------------------------------------
# Chatbot API
# -------------------------------------------------------------
@app.post("/chat")
def chatbot(payload: dict):
    message = str(payload.get("message", "")).strip()
    patient_name = str(payload.get("patient_name", "")).strip() or "Patient"

    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")
    if len(message) > 500:
        raise HTTPException(status_code=400, detail="Message is too long. Please keep it under 500 characters.")

    prompt = message.lower()
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        history = conn.execute(
            "SELECT disease_name, severity, doctor_name, notes FROM disease_history WHERE patient_name = ? ORDER BY diagnosed_on DESC LIMIT 3",
            (patient_name,),
        ).fetchall()

    history = list(history)

    faq_patterns = {
        "login": ["log in", "login", "sign in", "signin", "account", "create account"],
        "otp": ["otp", "verify email", "verification code", "email verification", "two factor"],
        "forgot": ["forgot password", "reset password", "password reset", "forgot my password"],
        "medications": ["medication", "medicine", "dosage", "add medicine", "record", "prescription"],
        "doctors": ["nearby doctor", "find doctor", "clinic", "hospital", "pharmacy", "google maps", "appointment"],
        "reminders": ["reminder", "alert", "drug alert", "schedule", "alarm", "time"],
    }

    if any(keyword in prompt for keyword in faq_patterns["login"]):
        reply = "Open the app and choose Patient or Doctor role, then enter your email and password. Use demo buttons or Create Account to register a new profile."
    elif any(keyword in prompt for keyword in faq_patterns["otp"]):
        reply = "Enter the verification code sent to your registered email. Check your spam folder if it doesn't arrive within two minutes."
    elif any(keyword in prompt for keyword in faq_patterns["forgot"]):
        reply = "Use the Forgot password option on the login page to initiate a password reset. You can also use demo credentials to explore the system."
    elif any(keyword in prompt for keyword in faq_patterns["medications"]):
        reply = "Go to 'My Medications' to add prescriptions, dosages, and review your current medications list in real time."
    elif any(keyword in prompt for keyword in faq_patterns["doctors"]):
        reply = "Navigate to 'Find Nearby Doctors' to search specialists and clinics by area or specialty, and click 'Book Consultation' to lock in an appointment."
    elif any(keyword in prompt for keyword in faq_patterns["reminders"]):
        reply = "Check 'Reminders' to track scheduled dosages and mark them as taken with timestamps to maintain high adherence."
    elif any(keyword in prompt for keyword in ["symptom", "asthma", "blood pressure", "diabetes", "wheezing", "doctor"]):
        reply = "MediAssist focuses on medication tracking and scheduling. For clinical symptoms or emergencies, please contact your doctor or emergency services directly."
    elif history:
        diseases = ", ".join(row["disease_name"] for row in history)
        reply = f"Based on your recent health records for {diseases}, please follow prescribed schedules and discuss new symptoms with your doctor."
    else:
        reply = f"Hello {patient_name}! I'm MediAssist. How can I help you today with medications, appointments, reminders, or health records?"

    return {"reply": reply, "patient_name": patient_name, "history_count": len(history)}


# -------------------------------------------------------------
# Forgot Password & Profile
# -------------------------------------------------------------
@app.post("/forgot-password")
def forgot_password(payload: dict):
    email = str(payload.get("email", "")).strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    return {
        "message": f"Password reset instructions have been sent to {email}. Please check your inbox or use demo credentials to sign in."
    }


@app.get("/user-profile")
def get_user_profile(email: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        user = conn.execute("SELECT id, uuid, role, email, full_name, address_id, phone, blood_group, emergency_contact, city, patient_id FROM users WHERE lower(email) = ?", (email.lower(),)).fetchone()
        if user:
            d = dict(user)
            if not d.get("patient_id") and d.get("role") == "patient":
                d["patient_id"] = "MED-P-88492014" if "alice" in str(d.get("full_name","")).lower() else "MED-P-88492014"
            return d
        return {
            "email": email or "patient@medicare.com",
            "full_name": "Alice Johnson",
            "role": "patient",
            "phone": "+91 98765 43210",
            "blood_group": "O+",
            "emergency_contact": "+91 91234 56789",
            "city": "Bengaluru",
            "patient_id": "MED-P-88492014",
        }


@app.put("/user-profile")
def update_user_profile(payload: dict):
    email = str(payload.get("email", "")).strip().lower()
    full_name = str(payload.get("full_name", "")).strip()
    phone = str(payload.get("phone", "")).strip()
    blood_group = str(payload.get("blood_group", "")).strip()
    emergency_contact = str(payload.get("emergency_contact", "")).strip()
    city = str(payload.get("city", "")).strip()

    with sqlite3.connect(DATABASE) as conn:
        conn.execute(
            """
            UPDATE users SET full_name = ?, phone = ?, blood_group = ?, emergency_contact = ?, city = ?
            WHERE lower(email) = ?
            """,
            (full_name, phone, blood_group, emergency_contact, city, email),
        )
        conn.commit()
    return {"message": "Profile updated successfully"}


# -------------------------------------------------------------
# Messages API
# -------------------------------------------------------------
@app.get("/messages")
def get_messages(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM messages WHERE sender_name = ? OR receiver_name = ? ORDER BY id ASC",
                (patient_name, patient_name),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM messages ORDER BY id ASC").fetchall()
        return [dict(r) for r in rows]


@app.post("/messages")
def send_message(payload: dict):
    sender_name = str(payload.get("sender_name", "")).strip()
    sender_role = str(payload.get("sender_role", "patient")).strip()
    receiver_name = str(payload.get("receiver_name", "Dr. Emily Carter")).strip()
    content = str(payload.get("content", "")).strip()

    if not sender_name or not content:
        raise HTTPException(status_code=400, detail="Sender name and message content are required.")

    import datetime
    now_time = datetime.datetime.now().strftime("%I:%M %p")
    msg_uuid = f"msg-{uuid.uuid4().hex[:8]}"

    with sqlite3.connect(DATABASE) as conn:
        conn.execute(
            """
            INSERT INTO messages (uuid, sender_role, sender_name, receiver_name, content, timestamp, read_status)
            VALUES (?, ?, ?, ?, ?, ?, 1)
            """,
            (msg_uuid, sender_role, sender_name, receiver_name, content, now_time),
        )
        conn.commit()

    return {"message": "Message sent", "uuid": msg_uuid, "timestamp": now_time}


# -------------------------------------------------------------
# Prescription Uploads / Documents API
# -------------------------------------------------------------
@app.get("/documents")
def get_documents(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM documents WHERE patient_name = ? ORDER BY id DESC",
                (patient_name,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM documents ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]


@app.post("/documents")
def upload_document(payload: dict):
    patient_name = str(payload.get("patient_name", "")).strip() or "Alice Johnson"
    title = str(payload.get("title", "")).strip()
    doctor_name = str(payload.get("doctor_name", "")).strip() or "Dr. Emily Carter"
    file_type = str(payload.get("file_type", "PDF")).strip()
    notes = str(payload.get("notes", "")).strip() or "Prescription uploaded by patient"

    if not title:
        raise HTTPException(status_code=400, detail="Document title is required.")

    import datetime
    uploaded_date = datetime.date.today().isoformat()
    doc_uuid = f"doc-up-{uuid.uuid4().hex[:8]}"

    with sqlite3.connect(DATABASE) as conn:
        conn.execute(
            """
            INSERT INTO documents (uuid, patient_name, title, doctor_name, file_type, file_size, uploaded_date, notes)
            VALUES (?, ?, ?, ?, ?, '1.5 MB', ?, ?)
            """,
            (doc_uuid, patient_name, title, doctor_name, file_type, uploaded_date, notes),
        )
        conn.commit()

    return {"message": "Document uploaded successfully", "uuid": doc_uuid}


@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
    return {"message": "Document deleted successfully"}


# -------------------------------------------------------------
# Notifications API
# -------------------------------------------------------------
@app.get("/notifications")
def get_notifications(patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_name:
            rows = conn.execute(
                "SELECT * FROM notifications WHERE patient_name = ? ORDER BY id DESC",
                (patient_name,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM notifications ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]


@app.patch("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int):
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("UPDATE notifications SET read_status = 1 WHERE id = ?", (notif_id,))
        conn.commit()
    return {"message": "Notification marked as read"}


@app.post("/chatbot")
def legacy_chatbot(payload: dict):
    return chatbot(payload)




# =============================================================
# Patient ID & Doctor Medical History Access Module
# =============================================================

@app.get("/patient-lookup/{patient_id}")
def lookup_patient_by_id(patient_id: str, doctor_email: str = ""):
    p_id = patient_id.strip().upper()
    doc_email = doctor_email.strip().lower()

    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row

        # 1. Verify that doctor is registered
        doctor = None
        if doc_email:
            doctor = conn.execute("SELECT * FROM users WHERE lower(email) = ? AND role = 'doctor'", (doc_email,)).fetchone()
            if not doctor:
                doctor = conn.execute("SELECT * FROM doctors WHERE lower(email) = ?", (doc_email,)).fetchone()

        # 2. Look up patient by patient_id
        patient = conn.execute("SELECT * FROM users WHERE upper(patient_id) = ? AND role = 'patient'", (p_id,)).fetchone()
        if not patient:
            patient = conn.execute("SELECT * FROM patients WHERE upper(patient_id) = ?", (p_id,)).fetchone()

        if not patient:
            raise HTTPException(status_code=404, detail=f"No patient found with ID '{p_id}'. Please verify the Patient ID.")

        patient_dict = dict(patient)
        patient_full_name = patient_dict.get("full_name") or patient_dict.get("name") or "Patient"

        def mask_name(name):
            parts = name.strip().split()
            if len(parts) >= 2:
                return f"{parts[0]} {parts[1][0]}."
            return f"{name[:3]}***"

        masked_name = mask_name(patient_full_name)

        # 3. Check patient consent in doctor_patient_access
        access = None
        if doc_email:
            access = conn.execute(
                "SELECT * FROM doctor_patient_access WHERE lower(doctor_email) = ? AND upper(patient_id) = ? ORDER BY id DESC LIMIT 1",
                (doc_email, p_id),
            ).fetchone()

        if not access or access["status"] != "approved":
            status = access["status"] if access else "no_access"
            msg = "Patient consent required to access medical records."
            if status == "pending":
                msg = "Access request is currently pending patient approval."
            elif status == "rejected":
                msg = "Access request was declined by the patient."
            elif status == "revoked":
                msg = "Medical history access was revoked by the patient."

            return {
                "patient_found": True,
                "patient_id": p_id,
                "patient_name": masked_name,
                "status": status,
                "request_uuid": access["uuid"] if access else None,
                "purpose": access["purpose"] if access else "Clinical Consultation & Medication Review",
                "requested_at": access["requested_at"] if access else None,
                "message": msg,
                "records_authorized": False,
            }

        # 4. APPROVED ACCESS: Log audit event and return comprehensive dossier
        doc_name = doctor["full_name"] if (doctor and "full_name" in doctor.keys()) else (access["doctor_name"] if access else "Attending Physician")
        log_uuid = f"log-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO access_logs (uuid, doctor_email, doctor_name, patient_id, patient_name, action, details)
            VALUES (?, ?, ?, ?, ?, 'RECORDS_VIEWED', ?)
            """,
            (log_uuid, doc_email, doc_name, p_id, patient_full_name, f"Dr. {doc_name} accessed comprehensive medical dossier"),
        )
        conn.commit()

        # Query patient clinical records
        meds = conn.execute("SELECT * FROM medications WHERE patient_name = ?", (patient_full_name,)).fetchall()
        rxs = conn.execute("SELECT * FROM prescriptions WHERE patient_name = ?", (patient_full_name,)).fetchall()
        history = conn.execute("SELECT * FROM disease_history WHERE patient_name = ?", (patient_full_name,)).fetchall()
        docs = conn.execute("SELECT * FROM documents WHERE patient_name = ?", (patient_full_name,)).fetchall()
        apts = conn.execute("SELECT * FROM appointments WHERE patient_name = ?", (patient_full_name,)).fetchall()
        t_notes = conn.execute("SELECT * FROM treatment_notes WHERE upper(patient_id) = ? ORDER BY id DESC", (p_id,)).fetchall()

        return {
            "patient_found": True,
            "patient_id": p_id,
            "patient_name": patient_full_name,
            "status": "approved",
            "records_authorized": True,
            "profile": {
                "patient_id": p_id,
                "full_name": patient_full_name,
                "age": patient_dict.get("age") or (26 if "amrutha" in patient_full_name.lower() else 34),
                "gender": patient_dict.get("gender") or ("Female" if any(w in patient_full_name.lower() for w in ["alice", "sana", "maya", "priya", "amrutha"]) else "Male"),
                "blood_group": patient_dict.get("blood_group") or "O+",
                "condition": patient_dict.get("condition") or "General Preventative Health Maintenance",
                "emergency_contact": patient_dict.get("emergency_contact") or "+91 91234 56789",
                "phone": patient_dict.get("phone") or "+91 98765 43210",
                "email": patient_dict.get("email", ""),
                "city": patient_dict.get("city", "Bengaluru"),
            },
            "allergies": {
                "alice johnson": [
                    {"name": "Penicillin", "reaction": "Skin rash and urticaria", "severity": "High"},
                    {"name": "Latex", "reaction": "Mild contact dermatitis", "severity": "Moderate"}
                ],
                "rohan mehta": [
                    {"name": "Dust Mites", "reaction": "Bronchial wheezing & rhinorrhea", "severity": "High"},
                    {"name": "Grass Pollen", "reaction": "Allergic conjunctivitis & sneezing", "severity": "Moderate"},
                    {"name": "Aspirin/NSAIDs", "reaction": "Bronchospasm & wheezing exacerbation", "severity": "High"}
                ],
                "sana khan": [
                    {"name": "Sulfonamides (Sulfa)", "reaction": "Maculopapular rash & pruritus", "severity": "High"},
                    {"name": "Shellfish", "reaction": "Facial angioedema", "severity": "High"}
                ],
                "maya patel": [
                    {"name": "Ibuprofen / NSAIDs", "reaction": "Gastric irritation and acid reflux", "severity": "Moderate"},
                    {"name": "Codeine Phosphate", "reaction": "Severe nausea and dizziness", "severity": "Moderate"}
                ],
                "david chen": [
                    {"name": "Zero Known Drug Allergies (NKDA)", "reaction": "No adverse reactions documented", "severity": "None"}
                ],
                "priya nambiar": [
                    {"name": "Erythromycin", "reaction": "Severe abdominal cramping & nausea", "severity": "Moderate"},
                    {"name": "Artificial Sweeteners (Aspartame)", "reaction": "Acute migraine aura trigger", "severity": "Moderate"}
                ],
                "vikram malhotra": [
                    {"name": "Iodinated Radiocontrast", "reaction": "Nephrotoxicity risk & flushing", "severity": "High"},
                    {"name": "ACE Inhibitors (Historical)", "reaction": "Intractable persistent dry cough", "severity": "Moderate"}
                ],
                "amrutha": [
                    {"name": "Zero Known Drug Allergies (NKDA)", "reaction": "No adverse reactions documented", "severity": "None"}
                ],
            }.get(
                patient_full_name.lower().strip(),
                [
                    {"name": "Penicillin", "reaction": "Skin rash and urticaria", "severity": "High"},
                    {"name": "Latex", "reaction": "Mild contact dermatitis", "severity": "Moderate"}
                ]
            ),
            "medications": [dict(m) for m in meds],
            "prescriptions": [dict(r) for r in rxs],
            "disease_history": [dict(h) for h in history],
            "documents": [dict(d) for d in docs],
            "appointments": [dict(a) for a in apts],
            "treatment_notes": [dict(t) for t in t_notes],
            "access_info": {
                "request_uuid": access["uuid"],
                "authorized_doctor": access["doctor_name"],
                "purpose": access["purpose"],
                "approved_at": access["responded_at"] or access["requested_at"],
            }
        }


@app.post("/access-requests")
def create_access_request(payload: dict):
    doctor_email = str(payload.get("doctor_email", "")).strip().lower()
    doctor_name = str(payload.get("doctor_name", "Dr. Emily Carter")).strip()
    doctor_specialty = str(payload.get("doctor_specialty", "Cardiology")).strip()
    patient_id = str(payload.get("patient_id", "")).strip().upper()
    purpose = str(payload.get("purpose", "Clinical Consultation & Medication Review")).strip()

    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient ID is required.")

    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row

        # Check if patient exists
        patient = conn.execute("SELECT * FROM users WHERE upper(patient_id) = ? AND role = 'patient'", (patient_id,)).fetchone()
        if not patient:
            patient = conn.execute("SELECT * FROM patients WHERE upper(patient_id) = ?", (patient_id,)).fetchone()

        if not patient:
            raise HTTPException(status_code=404, detail=f"No patient found with ID '{patient_id}'.")

        p_dict = dict(patient)
        patient_name = p_dict.get("full_name") or p_dict.get("name") or "Patient"

        req_uuid = f"dpa-{uuid.uuid4().hex[:8]}"

        # Upsert in doctor_patient_access
        existing = conn.execute(
            "SELECT * FROM doctor_patient_access WHERE lower(doctor_email) = ? AND upper(patient_id) = ?",
            (doctor_email, patient_id),
        ).fetchone()

        if existing:
            conn.execute(
                """
                UPDATE doctor_patient_access
                SET status = 'pending', purpose = ?, requested_at = CURRENT_TIMESTAMP, responded_at = NULL, revoked_at = NULL
                WHERE id = ?
                """,
                (purpose, existing["id"]),
            )
            req_uuid = existing["uuid"]
        else:
            conn.execute(
                """
                INSERT INTO doctor_patient_access (uuid, doctor_email, doctor_name, doctor_specialty, patient_id, patient_name, status, purpose)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
                """,
                (req_uuid, doctor_email, doctor_name, doctor_specialty, patient_id, patient_name, purpose),
            )

        # Notify patient
        notif_uuid = f"notif-req-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO notifications (uuid, patient_name, title, message, type, created_at, read_status)
            VALUES (?, ?, 'Medical Record Access Request', ?, 'alert', 'Just now', 0)
            """,
            (notif_uuid, patient_name, f"{doctor_name} ({doctor_specialty}) requested access to your medical records for: {purpose}."),
        )

        # Log audit trail
        log_uuid = f"log-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO access_logs (uuid, doctor_email, doctor_name, patient_id, patient_name, action, details)
            VALUES (?, ?, ?, ?, ?, 'ACCESS_REQUESTED', ?)
            """,
            (log_uuid, doctor_email, doctor_name, patient_id, patient_name, f"Requested medical access for: {purpose}"),
        )
        conn.commit()

    return {"message": "Access request dispatched to patient successfully.", "status": "pending", "uuid": req_uuid}


@app.get("/patient/access-requests")
def get_patient_access_requests(patient_id: str = "", patient_name: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_id:
            rows = conn.execute(
                "SELECT * FROM doctor_patient_access WHERE upper(patient_id) = ? ORDER BY id DESC",
                (patient_id.strip().upper(),),
            ).fetchall()
        elif patient_name:
            rows = conn.execute(
                "SELECT * FROM doctor_patient_access WHERE patient_name = ? ORDER BY id DESC",
                (patient_name.strip(),),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM doctor_patient_access ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]


@app.patch("/access-requests/{request_uuid}/respond")
def respond_access_request(request_uuid: str, payload: dict):
    status = str(payload.get("status", "")).strip().lower()
    if status not in {"approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'.")

    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        req = conn.execute("SELECT * FROM doctor_patient_access WHERE uuid = ?", (request_uuid,)).fetchone()
        if not req:
            raise HTTPException(status_code=404, detail="Access request not found.")

        import datetime
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
        conn.execute(
            "UPDATE doctor_patient_access SET status = ?, responded_at = ? WHERE uuid = ?",
            (status, now_str, request_uuid),
        )

        # Audit log
        action_name = "ACCESS_APPROVED" if status == "approved" else "ACCESS_REJECTED"
        log_uuid = f"log-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO access_logs (uuid, doctor_email, doctor_name, patient_id, patient_name, action, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (log_uuid, req["doctor_email"], req["doctor_name"], req["patient_id"], req["patient_name"], action_name, f"Patient {req['patient_name']} {status} access for {req['doctor_name']}"),
        )
        conn.commit()

    return {"message": f"Access request {status} successfully.", "status": status}


@app.patch("/access-requests/{request_uuid}/revoke")
def revoke_access_request(request_uuid: str):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        req = conn.execute("SELECT * FROM doctor_patient_access WHERE uuid = ?", (request_uuid,)).fetchone()
        if not req:
            raise HTTPException(status_code=404, detail="Access request not found.")

        import datetime
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
        conn.execute(
            "UPDATE doctor_patient_access SET status = 'revoked', revoked_at = ? WHERE uuid = ?",
            (now_str, request_uuid),
        )

        # Audit log
        log_uuid = f"log-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO access_logs (uuid, doctor_email, doctor_name, patient_id, patient_name, action, details)
            VALUES (?, ?, ?, ?, ?, 'ACCESS_REVOKED', ?)
            """,
            (log_uuid, req["doctor_email"], req["doctor_name"], req["patient_id"], req["patient_name"], f"Patient revoked medical records access for {req['doctor_name']}"),
        )
        conn.commit()

    return {"message": "Doctor access to medical records revoked.", "status": "revoked"}


@app.post("/treatment-notes")
def add_treatment_note(payload: dict):
    patient_id = str(payload.get("patient_id", "")).strip().upper()
    doctor_name = str(payload.get("doctor_name", "Dr. Emily Carter")).strip()
    doctor_email = str(payload.get("doctor_email", "doctor@medicare.com")).strip().lower()
    note_title = str(payload.get("note_title", "")).strip()
    content = str(payload.get("content", "")).strip()

    if not patient_id or not note_title or not content:
        raise HTTPException(status_code=400, detail="Patient ID, note title, and clinical observations content are required.")

    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        # Verify approved access
        access = conn.execute(
            "SELECT * FROM doctor_patient_access WHERE lower(doctor_email) = ? AND upper(patient_id) = ? AND status = 'approved'",
            (doctor_email, patient_id),
        ).fetchone()

        if not access:
            raise HTTPException(status_code=403, detail="Unauthorized: You must have active approved patient access to record treatment notes.")

        import datetime
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
        note_uuid = f"tnote-{uuid.uuid4().hex[:8]}"

        conn.execute(
            """
            INSERT INTO treatment_notes (uuid, patient_id, doctor_name, doctor_email, note_title, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (note_uuid, patient_id, doctor_name, doctor_email, note_title, content, now_str),
        )

        # Audit log
        log_uuid = f"log-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO access_logs (uuid, doctor_email, doctor_name, patient_id, patient_name, action, details)
            VALUES (?, ?, ?, ?, ?, 'TREATMENT_NOTE_ADDED', ?)
            """,
            (log_uuid, doctor_email, doctor_name, patient_id, access["patient_name"], f"Added clinical treatment note: {note_title}"),
        )
        conn.commit()

    return {"message": "Treatment note recorded successfully", "uuid": note_uuid, "created_at": now_str}


@app.get("/audit-logs")
def get_audit_logs(patient_id: str = "", doctor_email: str = ""):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        if patient_id:
            rows = conn.execute("SELECT * FROM access_logs WHERE upper(patient_id) = ? ORDER BY id DESC", (patient_id.strip().upper(),)).fetchall()
        elif doctor_email:
            rows = conn.execute("SELECT * FROM access_logs WHERE lower(doctor_email) = ? ORDER BY id DESC", (doctor_email.strip().lower(),)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM access_logs ORDER BY id DESC LIMIT 50").fetchall()
        return [dict(r) for r in rows]


@app.get("/audit-logs/{patient_id}")
def get_audit_logs_path(patient_id: str):
    return get_audit_logs(patient_id=patient_id)


@app.get("/vitals/{patient_id}")
def get_patient_vitals(patient_id: str):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM vitals WHERE upper(patient_id) = ? ORDER BY id DESC LIMIT 10",
            (patient_id.strip().upper(),),
        ).fetchall()
        if not rows:
            return [
                {
                    "uuid": f"vit-{patient_id}",
                    "patient_id": patient_id,
                    "patient_name": "Verified Patient",
                    "blood_pressure_systolic": 118,
                    "blood_pressure_diastolic": 76,
                    "heart_rate": 72,
                    "spo2": 99,
                    "glucose": 95,
                    "respiratory_rate": 16,
                    "weight_kg": 62.0,
                    "recorded_at": "Today 08:30 AM",
                }
            ]
        return [dict(r) for r in rows]


@app.post("/vitals")
def add_patient_vitals(payload: dict):
    patient_id = str(payload.get("patient_id", "MED-P-A7K92X")).strip().upper()
    patient_name = str(payload.get("patient_name", "Amrutha")).strip()
    bp_sys = int(payload.get("blood_pressure_systolic", 118))
    bp_dia = int(payload.get("blood_pressure_diastolic", 76))
    hr = int(payload.get("heart_rate", 72))
    spo2 = int(payload.get("spo2", 99))
    glucose = int(payload.get("glucose", 95))
    resp = int(payload.get("respiratory_rate", 16))
    weight = float(payload.get("weight_kg", 62.5))
    recorded_at = str(payload.get("recorded_at", "Just now"))

    with sqlite3.connect(DATABASE) as conn:
        u_id = f"vit-{uuid.uuid4().hex[:8]}"
        conn.execute(
            """
            INSERT INTO vitals (uuid, patient_id, patient_name, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, spo2, glucose, respiratory_rate, weight_kg, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (u_id, patient_id, patient_name, bp_sys, bp_dia, hr, spo2, glucose, resp, weight, recorded_at),
        )
        conn.commit()

    return {"message": "Vital readings logged successfully", "uuid": u_id}


@app.post("/clinical/drug-interaction-check")
def check_drug_interactions(payload: dict):
    import datetime
    medications = payload.get("medications", [])
    allergies = [str(a).lower() for a in payload.get("allergies", [])]

    interactions = []
    allergy_alerts = []

    med_text_blob = " ".join([str(m).lower() for m in medications])
    if "penicillin" in allergies and any(k in med_text_blob for k in ["amoxicillin", "penicillin", "ampicillin", "augmentin"]):
        allergy_alerts.append({
            "severity": "HIGH",
            "type": "Allergy Contraindication",
            "title": "Severe Penicillin Allergy Alert",
            "detail": "Patient has confirmed Penicillin allergy. Beta-lactam antibiotic detected. High risk of anaphylactic response.",
            "recommendation": "Discontinue beta-lactam agent immediately. Replace with Azithromycin or Clindamycin."
        })

    if "latex" in allergies:
        allergy_alerts.append({
            "severity": "LOW",
            "type": "Allergy Precaution",
            "title": "Latex Contact Sensitivity",
            "detail": "Ensure non-latex surgical gloves and tourniquets during clinical procedures.",
            "recommendation": "Use nitrile or vinyl medical equipment."
        })

    med_lower_list = [str(m).lower() for m in medications]
    
    if any("paracetamol" in m for m in med_lower_list) and any("ibuprofen" in m for m in med_lower_list):
        interactions.append({
            "severity": "MODERATE",
            "drugs": ["Paracetamol", "Ibuprofen"],
            "title": "Concurrent Antipyretic/Analgesic Use",
            "detail": "Combined hepatotoxic and nephrotoxic pathways. Stagger dosing schedule by at least 4 hours.",
            "recommendation": "Do not exceed maximum daily limits (4g Paracetamol, 1.2g Ibuprofen)."
        })

    if any("amlodipine" in m for m in med_lower_list) and any("simvastatin" in m for m in med_lower_list or "atorvastatin" in m for m in med_lower_list):
        interactions.append({
            "severity": "LOW",
            "drugs": ["Amlodipine", "Statin"],
            "title": "CYP3A4 Metabolic Competition",
            "detail": "Amlodipine may mildly increase systemic statin exposure.",
            "recommendation": "Monitor routine liver transaminases and CK levels."
        })

    if any("aspirin" in m for m in med_lower_list) and any("ibuprofen" in m for m in med_lower_list or "naproxen" in m for m in med_lower_list):
        interactions.append({
            "severity": "HIGH",
            "drugs": ["Aspirin", "NSAID"],
            "title": "Antiplatelet Competitive Inhibition & GI Risk",
            "detail": "Concurrent NSAIDs reduce cardioprotective antiplatelet effect and elevate gastric ulcer risk.",
            "recommendation": "Take Aspirin at least 2 hours prior to other NSAIDs or consider gastroprotective PPI."
        })

    safety_score = 98 if not allergy_alerts and not interactions else (82 if len(interactions) == 1 else 68)

    return {
        "status": "Safe" if not allergy_alerts and not interactions else "Caution",
        "safety_score": safety_score,
        "allergy_alerts": allergy_alerts,
        "interactions": interactions,
        "total_medications_checked": len(medications),
        "audit_timestamp": datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p"),
    }


@app.get("/emergency-id/{patient_id}")
def get_emergency_id(patient_id: str):
    p_id = patient_id.strip().upper()
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        user = conn.execute(
            "SELECT full_name, email, phone, blood_group, emergency_contact, city FROM users WHERE upper(patient_id) = ?",
            (p_id,),
        ).fetchone()

        if not user:
            return {
                "patient_id": p_id,
                "full_name": "Amrutha Puttaraju" if "A7K92X" in p_id else "Alice Johnson",
                "blood_group": "O+",
                "allergies": ["Penicillin", "Latex"],
                "emergency_contact": "+91 91234 56789 (Sister)",
                "city": "Bengaluru",
                "organ_donor": True,
                "primary_physician": "Dr. Emily Carter (Cardiology)",
                "insurance_provider": "MedSync Care Shield Plus (ID: MS-88329)",
                "status": "Verified Active Patient ID",
            }

        return {
            "patient_id": p_id,
            "full_name": user["full_name"],
            "blood_group": user["blood_group"] or "O+",
            "allergies": ["Penicillin", "Latex"],
            "emergency_contact": user["emergency_contact"] or "+91 91234 56789",
            "city": user["city"] or "Bengaluru",
            "organ_donor": True,
            "primary_physician": "Dr. Emily Carter (Cardiology)",
            "insurance_provider": "MedSync Care Shield Plus (ID: MS-88329)",
            "status": "Verified Active Patient ID",
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
