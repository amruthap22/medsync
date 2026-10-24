import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Users,
  MapPin,
  CheckCircle2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
} from './Icons';

export default function AppointmentsTab({
  appointments = [],
  onBookAppointment,
  onCancelAppointment,
  defaultDoctor = null,
}) {
  const [activeSubTab, setActiveSubTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'canceled'
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [bookDoctor, setBookDoctor] = useState('Dr. Priya Sharma');
  const [bookDate, setBookDate] = useState('2026-04-28');
  const [bookTime, setBookTime] = useState('10:00 AM');

  const initialAppointmentsList = [
    {
      id: 'apt-1',
      doctorName: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      date: 'April 10, 2026',
      day: 10,
      time: '10:00 AM',
      status: 'Confirmed',
      avatar: 'https://images.unsplash.com/photo-1594824813580-c11458e0a6e0?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'apt-2',
      doctorName: 'Dr. Rahul Menon',
      specialty: 'Cardiologist',
      date: 'April 15, 2026',
      day: 15,
      time: '02:30 PM',
      status: 'Confirmed',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'apt-3',
      doctorName: 'Dr. Sneha Reddy',
      specialty: 'Dermatologist',
      date: 'April 23, 2026',
      day: 23,
      time: '11:15 AM',
      status: 'Pending',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80',
    },
  ];

  const [aptsList, setAptsList] = useState(initialAppointmentsList);

  // Calendar days generation for April 2026 (Starts on Wednesday)
  const calendarDays = [
    { num: 29, isPrev: true },
    { num: 30, isPrev: true },
    { num: 31, isPrev: true },
    ...Array.from({ length: 30 }, (_, i) => ({
      num: i + 1,
      hasApt: i + 1 === 10 || i + 1 === 15 || i + 1 === 23,
    })),
    { num: 1, isNext: true },
    { num: 2, isNext: true },
  ];

  const handleCancel = (id, name) => {
    setAptsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Canceled' } : a))
    );
    if (onCancelAppointment) onCancelAppointment(id);
    setToastMessage(`Appointment with ${name} canceled.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleReschedule = (name) => {
    setToastMessage(`Reschedule request submitted for ${name}.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const newApt = {
      id: `apt-${Date.now()}`,
      doctorName: bookDoctor,
      specialty: bookDoctor.includes('Rahul') ? 'Cardiologist' : (bookDoctor.includes('Sneha') ? 'Dermatologist' : 'General Physician'),
      date: bookDate,
      day: parseInt(bookDate.split('-')[2] || '28', 10),
      time: bookTime,
      status: 'Confirmed',
      avatar: 'https://images.unsplash.com/photo-1594824813580-c11458e0a6e0?auto=format&fit=crop&w=120&q=80',
    };
    setAptsList((prev) => [newApt, ...prev]);
    setModalOpen(false);
    if (onBookAppointment) {
      onBookAppointment({
        doctor_name: bookDoctor,
        specialty: newApt.specialty,
        appointment_date: bookDate,
        appointment_time: bookTime,
      });
    }
    setToastMessage(`✓ Appointment scheduled with ${bookDoctor} for ${bookDate} at ${bookTime}`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredApts = aptsList.filter((apt) => {
    if (activeSubTab === 'upcoming') {
      if (apt.status === 'Canceled') return false;
      if (selectedDate && apt.day !== selectedDate) return false;
      return true;
    }
    if (activeSubTab === 'canceled') return apt.status === 'Canceled';
    if (activeSubTab === 'completed') return apt.status === 'Completed';
    return true;
  });

  return (
    <div className="medisync-appointments-tab-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="tab-floating-toast">
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage('')}>✕</button>
        </div>
      )}

      {/* Top Header Row with Tabs and Book Button */}
      <div className="meds-header-row">
        <div className="meds-tabs-switch">
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('upcoming')}
          >
            Upcoming (3)
          </button>
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('completed')}
          >
            Completed
          </button>
          <button
            type="button"
            className={`meds-tab-pill ${activeSubTab === 'canceled' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('canceled')}
          >
            Canceled
          </button>
        </div>

        <button
          type="button"
          className="btn-add-med-primary"
          onClick={() => setModalOpen(true)}
        >
          <Plus width={16} height={16} />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Main Two Columns (Matching Screen 8) */}
      <div className="apts-layout-grid">
        {/* Left Column: Interactive Month Calendar */}
        <div className="dash-panel-card apts-calendar-panel">
          <div className="calendar-month-header">
            <button type="button" className="cal-nav-btn">&larr;</button>
            <strong className="cal-month-title">April 2026</strong>
            <button type="button" className="cal-nav-btn">&rarr;</button>
          </div>

          <div className="calendar-weekdays-row">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          <div className="calendar-grid-cells">
            {calendarDays.map((d, idx) => (
              <div
                key={idx}
                className={`cal-day-cell ${d.isPrev || d.isNext ? 'outside-month' : ''} ${
                  selectedDate === d.num ? 'selected-day' : ''
                } ${d.hasApt ? 'has-appointment' : ''}`}
                onClick={() => !d.isPrev && !d.isNext && setSelectedDate(d.num)}
              >
                <span className="cal-day-num">{d.num}</span>
                {d.hasApt && <span className="cal-apt-dot" />}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Appointment Cards */}
        <div className="apts-cards-list-column">
          {selectedDate && (
            <div className="apts-date-filter-bar">
              <span>Showing consultations for <strong>April {selectedDate}, 2026</strong></span>
              <button
                type="button"
                className="btn-clear-date-filter"
                onClick={() => setSelectedDate(null)}
              >
                Show All Dates
              </button>
            </div>
          )}

          {filteredApts.length === 0 ? (
            <div className="apts-empty-state">
              <Calendar width={28} height={28} className="text-muted" />
              <p>No appointments found for the selected view.</p>
              <button
                type="button"
                className="btn-add-med-primary"
                onClick={() => setModalOpen(true)}
                style={{ marginTop: '10px' }}
              >
                Book a Consultation
              </button>
            </div>
          ) : (
            filteredApts.map((apt) => (
              <div key={apt.id} className="appointment-record-card">
                <img src={apt.avatar} alt={apt.doctorName} className="apt-doc-avatar" />

                <div className="apt-record-meta">
                  <div className="apt-doc-title-row">
                    <h4>{apt.doctorName}</h4>
                    <span className={`apt-status-pill ${apt.status === 'Confirmed' ? 'status-confirmed' : (apt.status === 'Canceled' ? 'status-canceled' : 'status-pending')}`}>
                      {apt.status}
                    </span>
                  </div>
                  <span className="apt-doc-specialty">{apt.specialty}</span>
                  <div className="apt-time-details-row">
                    <span className="apt-detail-badge"><Calendar width={13} height={13} /> {apt.date}</span>
                    <span className="apt-detail-badge"><Clock width={13} height={13} /> {apt.time}</span>
                  </div>
                </div>

                <div className="apt-card-actions">
                  {apt.status !== 'Canceled' && (
                    <>
                      <button
                        type="button"
                        className="btn-apt-secondary"
                        onClick={() => handleReschedule(apt.doctorName)}
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="btn-apt-danger"
                        onClick={() => handleCancel(apt.id, apt.doctorName)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book Doctor Appointment</h3>
              <button type="button" className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Select Doctor</label>
                <select
                  value={bookDoctor}
                  onChange={(e) => setBookDoctor(e.target.value)}
                >
                  <option value="Dr. Priya Sharma">Dr. Priya Sharma • General Physician</option>
                  <option value="Dr. Rahul Menon">Dr. Rahul Menon • Cardiologist</option>
                  <option value="Dr. Sneha Reddy">Dr. Sneha Reddy • Dermatologist</option>
                  <option value="Dr. Emily Carter">Dr. Emily Carter • Cardiology Specialist</option>
                </select>
              </div>
              <div className="form-group">
                <label>Appointment Date</label>
                <input
                  type="date"
                  required
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Preferred Time Slot</label>
                <select
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                >
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff' }}>Confirm Booking &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
