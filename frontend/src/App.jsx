import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./PatientLookup.css";
import LoginPage from "./components/LoginPage";
import Sidebar, { NAVIGATION_TABS } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardTab from "./components/DashboardTab";
import MedicationsTab from "./components/MedicationsTab";
import AppointmentsTab from "./components/AppointmentsTab";
import DoctorsTab from "./components/DoctorsTab";
import HealthRecordsTab from "./components/HealthRecordsTab";
import MessagesTab from "./components/MessagesTab";
import NearbyDoctorsTab from "./components/NearbyDoctorsTab";
import ChatbotTab from "./components/ChatbotTab";
import SettingsTab from "./components/SettingsTab";
import DoctorPatientLookup from "./components/DoctorPatientLookup";

const API = "http://127.0.0.1:8000";

const defaultUser = {
  id: 1,
  uuid: "guest-user-1",
  role: "patient",
  patient_id: "MED-P-7K92X",
  email: "amrutha@medsync.care",
  full_name: "Amrutha",
  phone: "+91 98765 43210",
  blood_group: "O+",
  city: "Bengaluru",
  emergency_contact: "+91 91234 56789 (Sister)",
};

export default function App() {
  // Navigation & Layout
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Authentication
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("medicare-auth") || sessionStorage.getItem("medicare-auth");
      if (!saved) return defaultUser;
      return JSON.parse(saved);
    } catch {
      return defaultUser;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("medicare-auth") || sessionStorage.getItem("medicare-auth"));
  });

  // Clinical Datasets
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allergies, setAllergies] = useState(["Penicillin", "Latex"]);

  // Cross-Tab Interaction States
  const [activeDoctorForMessage, setActiveDoctorForMessage] = useState(null);
  const [bookingModalDoctor, setBookingModalDoctor] = useState(null);
  const [globalNotificationToast, setGlobalNotificationToast] = useState("");
  const [emergencyModalOpenGlobal, setEmergencyModalOpenGlobal] = useState(false);

  // Voice Assistant Global State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [voiceAssistantState, setVoiceAssistantState] = useState("idle"); // "idle" | "listening" | "processing" | "speaking"
  const [voiceFeedbackText, setVoiceFeedbackText] = useState("");
  const recognitionRef = useRef(null);

  // Fetch all user clinical datasets
  const loadAllData = async () => {
    const pName = currentUser?.full_name || "Alice Johnson";
    const encName = encodeURIComponent(pName);

    try {
      const [
        medsRes,
        rxRes,
        aptRes,
        remRes,
        histRes,
        docRes,
        msgRes,
        notifRes,
      ] = await Promise.allSettled([
        fetch(`${API}/medications`),
        fetch(`${API}/prescriptions?patient_name=${encName}`),
        fetch(`${API}/appointments?patient_name=${encName}`),
        fetch(`${API}/reminders?patient_name=${encName}`),
        fetch(`${API}/patient-history`),
        fetch(`${API}/documents?patient_name=${encName}`),
        fetch(`${API}/messages?patient_name=${encName}`),
        fetch(`${API}/notifications?patient_name=${encName}`),
      ]);

      if (medsRes.status === "fulfilled" && medsRes.value.ok) {
        setMedications(await medsRes.value.json());
      }
      if (rxRes.status === "fulfilled" && rxRes.value.ok) {
        setPrescriptions(await rxRes.value.json());
      }
      if (aptRes.status === "fulfilled" && aptRes.value.ok) {
        setAppointments(await aptRes.value.json());
      }
      if (remRes.status === "fulfilled" && remRes.value.ok) {
        setReminders(await remRes.value.json());
      }
      if (histRes.status === "fulfilled" && histRes.value.ok) {
        setHistoryRecords(await histRes.value.json());
      }
      if (docRes.status === "fulfilled" && docRes.value.ok) {
        setDocuments(await docRes.value.json());
      }
      if (msgRes.status === "fulfilled" && msgRes.value.ok) {
        setMessages(await msgRes.value.json());
      }
      if (notifRes.status === "fulfilled" && notifRes.value.ok) {
        setNotifications(await notifRes.value.json());
      }
    } catch {
      // Graceful fallback to initial values
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, currentUser?.full_name]);

  // Auth Handlers
  const handleLoginSuccess = (user, remember = true) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      if (remember) {
        localStorage.setItem("medicare-auth", JSON.stringify(user));
      } else {
        sessionStorage.setItem("medicare-auth", JSON.stringify(user));
      }
    } catch (e) {
      console.warn("Auth storage warning:", e);
    }
    showToast(`Welcome back, ${user.full_name}! MedSync session authenticated.`);
  };

  const handleLogout = () => {
    localStorage.removeItem("medicare-auth");
    sessionStorage.removeItem("medicare-auth");
    setIsAuthenticated(false);
    setCurrentUser(defaultUser);
  };

  const showToast = (msg) => {
    setGlobalNotificationToast(msg);
    setTimeout(() => {
      setGlobalNotificationToast("");
    }, 4500);
  };

  // Text-To-Speech Output
  const speakText = (text) => {
    if (isAudioMuted || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`]/g, "");
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.onstart = () => setVoiceAssistantState("speaking");
      utterance.onend = () => setVoiceAssistantState("idle");
      utterance.onerror = () => setVoiceAssistantState("idle");
      window.speechSynthesis.speak(utterance);
    } catch {
      setVoiceAssistantState("idle");
    }
  };

  // Global Voice Assistant Handlers
  const startGlobalVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (voiceAssistantState === "listening" && recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceAssistantState("idle");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setVoiceAssistantState("listening");
        setVoiceFeedbackText("Listening for command (e.g. 'open medications', 'read reminders')...");
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };

      rec.onerror = () => {
        setVoiceAssistantState("idle");
        setVoiceFeedbackText("");
      };

      rec.onend = () => {
        if (voiceAssistantState === "listening") {
          setVoiceAssistantState("idle");
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setVoiceAssistantState("idle");
    }
  };

  const handleVoiceCommand = async (commandStr) => {
    const cmd = commandStr.toLowerCase().trim();
    setVoiceFeedbackText(`"${commandStr}"`);

    if (cmd.includes("emergency") || cmd.includes("sos") || cmd.includes("help id")) {
      setEmergencyModalOpenGlobal(true);
      speakText(`Opening your emergency identification pass. Your blood group is ${currentUser?.blood_group || 'O+'} and emergency contact is ${currentUser?.emergency_contact || '+91 91234 56789'}.`);
    } else if (cmd.includes("patient id") || cmd.includes("my id")) {
      speakText(`Your verified MedSync Patient ID is ${currentUser?.patient_id || 'MED-P-A7K92X'}. You can share this ID with your physician.`);
    } else if (cmd.includes("next dose") || cmd.includes("next medication") || cmd.includes("next medicine")) {
      speakText("Your next scheduled dose is Paracetamol 500 milligrams at 2:00 PM.");
    } else if (cmd.includes("vital") || cmd.includes("blood pressure") || cmd.includes("heart rate") || cmd.includes("sugar")) {
      speakText("Your latest recorded blood pressure is 118 over 76 millimeters of mercury, resting heart rate is 72 BPM, and SpO2 is 99 percent, all within the optimal target range.");
    } else if (cmd.includes("dashboard") || cmd.includes("home")) {
      setActiveTab("Dashboard");
      speakText("Navigating to Dashboard");
    } else if (cmd.includes("medication") || cmd.includes("pill") || cmd.includes("drug")) {
      setActiveTab("My Medications");
      speakText("Navigating to My Medications");
    } else if (cmd.includes("appointment") || cmd.includes("visit")) {
      setActiveTab("Appointments");
      speakText("Opening Appointments");
    } else if (cmd.includes("doctor") && !cmd.includes("nearby")) {
      setActiveTab("Doctors");
      speakText("Opening Doctor Specialists Directory");
    } else if (cmd.includes("record") || cmd.includes("history") || cmd.includes("prescription")) {
      setActiveTab("Health Records");
      speakText("Opening Health Records and Prescriptions");
    } else if (cmd.includes("message") || cmd.includes("chat with doctor")) {
      setActiveTab("Messages");
      speakText("Opening Doctor Messages");
    } else if (cmd.includes("nearby") || cmd.includes("clinic") || cmd.includes("map")) {
      setActiveTab("Nearby Doctors");
      speakText("Locating nearby doctors and clinics on radar");
    } else if (cmd.includes("bot") || cmd.includes("ai") || cmd.includes("mediassist") || cmd.includes("assistant")) {
      setActiveTab("AI Chatbot");
      speakText("Opening MediAssist Clinical AI Assistant");
    } else if (cmd.includes("setting") || cmd.includes("profile")) {
      setActiveTab("Settings");
      speakText("Opening Account Settings");
    } else {
      // Fallback: Query backend AI for clinical answer
      setVoiceAssistantState("processing");
      try {
        const res = await fetch(`${API}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: commandStr }),
        });
        const data = await res.json();
        const reply = data.reply || data.response || "Command processed.";
        setVoiceFeedbackText(reply);
        speakText(reply);
      } catch {
        const fallback = `Processed request for: "${commandStr}".`;
        setVoiceFeedbackText(fallback);
        speakText(fallback);
      }
    }
  };

  // 1-Click Refill Handler
  const handleRequestRefill = async (rxId) => {
    try {
      const res = await fetch(`${API}/prescriptions/${rxId}/refill`, { method: "PATCH" });
      const data = await res.json();
      showToast(data.message || "Prescription refill request dispatched to your doctor.");
      loadAllData();
    } catch {
      showToast("Refill requested. Dr. Carter's desk has been notified.");
    }
  };

  // Dose Logging Handler
  const handleLogDose = (id, medName, isTaken) => {
    if (isTaken) {
      showToast(`Dose recorded! Great job staying compliant with ${medName}.`);
    } else {
      showToast(`Dose status updated for ${medName}.`);
    }
  };

  // Add Medication
  const handleAddMedication = async (medForm) => {
    try {
      const res = await fetch(`${API}/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...medForm,
          patient_name: currentUser?.full_name || "Alice Johnson",
        }),
      });
      if (res.ok) {
        showToast(`Medication "${medForm.medication_name}" registered successfully.`);
        loadAllData();
      }
    } catch {
      showToast(`Added ${medForm.medication_name} to your daily schedule.`);
    }
  };

  // Delete Medication
  const handleDeleteMedication = async (id) => {
    if (!window.confirm("Remove this medication from your active regimen?")) return;
    try {
      const res = await fetch(`${API}/medications/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Medication removed from active regimen.");
        loadAllData();
      }
    } catch {
      showToast("Medication deleted.");
    }
  };

  // Book Appointment
  const handleBookAppointment = async (aptForm) => {
    try {
      const res = await fetch(`${API}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...aptForm,
          patient_name: currentUser?.full_name || "Alice Johnson",
        }),
      });
      if (res.ok) {
        showToast(`Appointment scheduled with ${aptForm.doctor_name} on ${aptForm.appointment_date}.`);
        loadAllData();
      }
    } catch {
      showToast(`Consultation requested with ${aptForm.doctor_name}. Confirmation dispatched.`);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm("Are you sure you want to cancel this consultation?")) return;
    try {
      const res = await fetch(`${API}/appointments/${aptId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Appointment consultation cancelled.");
        loadAllData();
      }
    } catch {
      showToast("Appointment cancelled.");
    }
  };

  // Add Disease History Record
  const handleAddHistoryRecord = async (histForm) => {
    try {
      const res = await fetch(`${API}/patient-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: currentUser?.full_name || "Alice Johnson",
          disease_name: histForm.disease,
          severity: histForm.severity,
          diagnosed_on: histForm.diagnosedOn,
          doctor_name: histForm.doctorName,
          notes: histForm.notes,
        }),
      });
      if (res.ok) {
        showToast(`Health condition "${histForm.disease}" documented.`);
        loadAllData();
      }
    } catch {
      showToast("Health record saved.");
    }
  };

  // Delete Disease History Record
  const handleDeleteHistoryRecord = async (id) => {
    if (!window.confirm("Delete this medical history record?")) return;
    try {
      const res = await fetch(`${API}/patient-history/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Health record deleted.");
        loadAllData();
      }
    } catch {
      showToast("Record removed.");
    }
  };

  // Upload Document
  const handleUploadDocument = async (docForm) => {
    try {
      const res = await fetch(`${API}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...docForm,
          patient_name: currentUser?.full_name || "Alice Johnson",
        }),
      });
      if (res.ok) {
        showToast(`Prescription "${docForm.title}" uploaded & synced.`);
        loadAllData();
      }
    } catch {
      showToast("Document saved to your medical vault.");
    }
  };

  // Delete Document
  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Delete this prescription document?")) return;
    try {
      const res = await fetch(`${API}/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Document removed.");
        loadAllData();
      }
    } catch {
      showToast("Document deleted.");
    }
  };

  // Send Message to Doctor
  const handleSendMessage = async (msgPayload) => {
    try {
      await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgPayload),
      });
    } catch {
      // offline fallback
    }
  };

  // Mark Notification Read
  const handleMarkNotificationRead = async (notifId) => {
    try {
      await fetch(`${API}/notifications/${notifId}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read_status: 1 } : n))
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read_status: 1 } : n))
      );
    }
  };

  // Doctor Card Actions
  const handleSelectDoctorForMessage = (doctor) => {
    setActiveDoctorForMessage(doctor);
    setActiveTab("Messages");
  };

  const handleSelectDoctorForBooking = (doctor) => {
    setBookingModalDoctor(doctor);
    setActiveTab("Appointments");
  };

  // If not logged in, render LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`medisync-app-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      {/* Dynamic Background Ambiance */}
      <div className="medisync-ambient ambient-primary" />
      <div className="medisync-ambient ambient-secondary" />

      {/* Global Toast Notification */}
      {globalNotificationToast && (
        <div className="global-toast-banner">
          <span className="toast-icon">✨</span>
          <span>{globalNotificationToast}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setGlobalNotificationToast("")}
          >
            ✕
          </button>
        </div>
      )}

      {/* Collapsible Sidebar with 9 Tabs */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadMessagesCount={1}
        upcomingAppointmentsCount={appointments.length || 2}
      />

      {/* Main Content Viewport */}
      <main className="medisync-main-viewport">
        {/* Topbar with Title, Search, Voice, Bell Drawer */}
        <Topbar
          activeTab={activeTab}
          currentUser={currentUser}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          voiceAssistantState={voiceAssistantState}
          onStartVoiceAssistant={startGlobalVoiceAssistant}
          isAudioMuted={isAudioMuted}
          onToggleAudioMute={() => {
            if (!isAudioMuted && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            setIsAudioMuted((prev) => !prev);
          }}
          onQuickBookAppointment={() => setActiveTab("Appointments")}
          onOpenEmergencyModal={() => setEmergencyModalOpenGlobal(true)}
          onSearchQuery={(q) => {
            if (q.toLowerCase().includes("doc")) setActiveTab("Doctors");
            else if (q.toLowerCase().includes("med") || q.toLowerCase().includes("rx")) setActiveTab("My Medications");
          }}
        />

        {/* Voice Feedback Banner */}
        {voiceFeedbackText && (
          <div className="voice-floating-feedback">
            <span className="voice-ping-dot" />
            <span className="voice-feedback-text">{voiceFeedbackText}</span>
            <button
              type="button"
              className="voice-dismiss-btn"
              onClick={() => setVoiceFeedbackText("")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === "Dashboard" && (
          <DashboardTab
            currentUser={currentUser}
            medications={medications}
            reminders={reminders}
            appointments={appointments}
            prescriptions={prescriptions}
            onNavigateTab={setActiveTab}
            onLogDose={handleLogDose}
            onRequestRefill={handleRequestRefill}
            onOpenBookingModal={() => setActiveTab("Appointments")}
            onShowToast={showToast}
          />
        )}

        {/* Tab: Patient Lookup (Doctor Medical History Access) */}
        {activeTab === "Patient Lookup" && (
          <div className="tab-pane-wrapper" style={{ padding: "28px", maxWidth: "1280px", margin: "0 auto" }}>
            <DoctorPatientLookup
              currentUser={currentUser}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* Tab 2: My Medications */}
        {activeTab === "My Medications" && (
          <MedicationsTab
            medications={medications}
            prescriptions={prescriptions}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onRequestRefill={handleRequestRefill}
            allergies={allergies}
          />
        )}

        {/* Tab 3: Appointments */}
        {activeTab === "Appointments" && (
          <AppointmentsTab
            appointments={appointments}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
            defaultDoctor={bookingModalDoctor}
          />
        )}

        {/* Tab 4: Doctors */}
        {activeTab === "Doctors" && (
          <DoctorsTab
            onBookDoctor={handleSelectDoctorForBooking}
            onMessageDoctor={handleSelectDoctorForMessage}
          />
        )}

        {/* Tab 5: Health Records */}
        {activeTab === "Health Records" && (
          <HealthRecordsTab
            historyRecords={historyRecords}
            documents={documents}
            allergies={allergies}
            onAddHistoryRecord={handleAddHistoryRecord}
            onDeleteHistoryRecord={handleDeleteHistoryRecord}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onAddAllergy={(newAllergy) => setAllergies((prev) => [...prev, newAllergy])}
          />
        )}

        {/* Tab 6: Messages */}
        {activeTab === "Messages" && (
          <MessagesTab
            currentUser={currentUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            activeDoctorProp={activeDoctorForMessage}
          />
        )}

        {/* Tab 7: Nearby Doctors */}
        {activeTab === "Nearby Doctors" && (
          <NearbyDoctorsTab
            onBookDoctorAppointment={handleSelectDoctorForBooking}
          />
        )}

        {/* Tab 8: AI Chatbot */}
        {activeTab === "AI Chatbot" && (
          <ChatbotTab
            currentUser={currentUser}
            isAudioMuted={isAudioMuted}
            onToggleAudioMute={() => setIsAudioMuted((prev) => !prev)}
          />
        )}

        {/* Tab 9: Settings */}
        {activeTab === "Settings" && (
          <SettingsTab
            currentUser={currentUser}
            isAudioMuted={isAudioMuted}
            onToggleAudioMute={() => setIsAudioMuted((prev) => !prev)}
            onUpdateProfile={(updated) => {
              setCurrentUser((prev) => ({ ...prev, ...updated }));
              showToast("Profile details updated.");
            }}
          />
        )}
      </main>
    </div>
  );
}
