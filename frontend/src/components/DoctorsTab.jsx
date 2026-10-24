import React, { useState } from 'react';
import {
  Users,
  Search,
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ShieldCheck,
} from './Icons';

export default function DoctorsTab({
  onBookDoctor,
  onMessageDoctor,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialists = [
    {
      id: 'doc-1',
      name: 'Dr. Emily Carter',
      specialty: 'Family Medicine',
      qualifications: 'MD, FACC - Harvard Medical Alum',
      clinic: 'HeartCare Clinic, St. Jude Center',
      location: '12th Main Rd, Indiranagar, Bengaluru',
      rating: 4.9,
      reviewsCount: 142,
      experience: '14+ Years',
      fee: '$60 (₹650)',
      availability: 'Today at 03:00 PM',
      phone: '+91 98765 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      about: 'Specializes in preventative cardiology, hypertension management, and comprehensive family pharmacotherapy.',
    },
    {
      id: 'doc-2',
      name: 'Dr. Suresh Rao',
      specialty: 'General Physician',
      qualifications: 'MBBS, MD (Internal Medicine)',
      clinic: 'Apollo Health City',
      location: '80 Feet Rd, Koramangala, Bengaluru',
      rating: 4.8,
      reviewsCount: 218,
      experience: '18+ Years',
      fee: '$45 (₹500)',
      availability: 'Tomorrow at 10:30 AM',
      phone: '+91 98765 22334',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      about: 'Comprehensive adult primary care, diabetic metabolic screening, and multi-drug interaction reviews.',
    },
    {
      id: 'doc-3',
      name: 'Dr. Amara Singh',
      specialty: 'Cardiologist',
      qualifications: 'MD, DM (Cardiology), FESC',
      clinic: 'Green Valley Clinic',
      location: '80 Feet Road, Koramangala, Bengaluru',
      rating: 4.9,
      reviewsCount: 165,
      experience: '12+ Years',
      fee: '$65 (₹700)',
      availability: 'Today at 04:30 PM',
      phone: '+91 98765 33441',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813580-c11458e0a6e0?auto=format&fit=crop&w=400&q=80',
      about: 'Interventional cardiology, post-stent antiplatelet therapy, and ischemic heart disease management.',
    },
    {
      id: 'doc-4',
      name: 'Dr. Neha Kapoor',
      specialty: 'Dermatologist',
      qualifications: 'MD (Dermatology), DNB',
      clinic: 'Skin & Allergy Clinic',
      location: 'Sector 1, HSR Layout, Bengaluru',
      rating: 4.9,
      reviewsCount: 96,
      experience: '11+ Years',
      fee: '$50 (₹600)',
      availability: 'Today at 05:15 PM',
      phone: '+91 98765 33445',
      avatarUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80',
      about: 'Expert in drug-induced cutaneous eruptions, immunological allergic rhinitis, and clinical dermatology.',
    },
    {
      id: 'doc-5',
      name: 'Dr. Priya Sharma',
      specialty: 'Pediatrician',
      qualifications: 'MD (Pediatrics), MRCPCH',
      clinic: 'Bloom Children’s Hospital',
      location: 'Whitefield Medical Corridor, Bengaluru',
      rating: 5.0,
      reviewsCount: 164,
      experience: '12+ Years',
      fee: '$50 (₹550)',
      availability: 'Friday at 09:30 AM',
      phone: '+91 98765 55667',
      avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
      about: 'Dedicated pediatric care, childhood immunization tracking, neonatal nutrition, and asthma monitoring.',
    },
    {
      id: 'doc-6',
      name: 'Dr. Noah Patel',
      specialty: 'Family Medicine',
      qualifications: 'MBBS, DFM (Royal College GP)',
      clinic: 'CityCare Health',
      location: '27th Main Rd, Sector 1, HSR Layout, Bengaluru',
      rating: 4.8,
      reviewsCount: 124,
      experience: '16+ Years',
      fee: '$45 (₹500)',
      availability: 'Today at 02:00 PM',
      phone: '+91 98765 44112',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      about: 'Geriatric health coordination, polypharmacy reconciliation, and chronic metabolic disease oversight.',
    },
    {
      id: 'doc-7',
      name: 'Dr. Leila Hassan',
      specialty: 'Endocrinologist',
      qualifications: 'MD, DM (Endocrinology), FACE',
      clinic: 'Northside Wellness & Diabetes Institute',
      location: 'ITPL Main Rd, Whitefield, Bengaluru',
      rating: 4.9,
      reviewsCount: 98,
      experience: '11+ Years',
      fee: '$65 (₹700)',
      availability: 'Tomorrow at 09:30 AM',
      phone: '+91 98765 55223',
      avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
      about: 'Specializes in thyroid disorders, gestational endocrinology, insulin pump therapy, and metabolic syndrome.',
    },
    {
      id: 'doc-8',
      name: 'Dr. Rajesh Nair',
      specialty: 'Neurologist',
      qualifications: 'DM (Neurology), NIMHANS Alum',
      clinic: 'NeuroLife Institute & Spine Care',
      location: '9th Block, Jayanagar, Bengaluru',
      rating: 4.7,
      reviewsCount: 154,
      experience: '17+ Years',
      fee: '$75 (₹800)',
      availability: 'Thu, Oct 30 at 11:00 AM',
      phone: '+91 98765 44556',
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
      about: 'Specializes in chronic migraine neurovascular protocols, neuropathic pain management, and stroke prevention.',
    },
    {
      id: 'doc-9',
      name: 'Dr. Ananya Sen',
      specialty: 'Orthopedic Specialist',
      qualifications: 'MS (Orthopedics), MCh, FRCS',
      clinic: 'Fortis Orthopedic Center',
      location: 'Cunningham Road, Vasanth Nagar, Bengaluru',
      rating: 4.8,
      reviewsCount: 176,
      experience: '13+ Years',
      fee: '$70 (₹750)',
      availability: 'Today at 03:30 PM',
      phone: '+91 98765 66778',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813580-c11458e0a6e0?auto=format&fit=crop&w=400&q=80',
      about: 'Degenerative joint disease, knee osteoarthritis preservation, and sports injury rehabilitation.',
    },
    {
      id: 'doc-10',
      name: 'Dr. Tariq Mansoor',
      specialty: 'Pulmonologist',
      qualifications: 'MD, FCCP (USA) - Pulmonary Medicine',
      clinic: 'Metro Pulmonary & Sleep Medicine Pavilion',
      location: 'Outer Ring Rd, Marathahalli, Bengaluru',
      rating: 4.9,
      reviewsCount: 240,
      experience: '19+ Years',
      fee: '$65 (₹700)',
      availability: 'Today at 05:00 PM',
      phone: '+91 98765 77889',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      about: 'Bronchial asthma management, spirometry interpretation, chronic cough, and sleep-disordered breathing.',
    },
  ];

  const specialtiesList = [
    'All',
    'Family Medicine',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Endocrinologist',
    'Neurologist',
    'Orthopedic Specialist',
    'Pulmonologist',
  ];

  const filteredDoctors = specialists.filter((doc) => {
    const matchSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    if (selectedSpecialty === 'All') return true;
    return doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
  });

  return (
    <div className="doctors-tab-container">
      {/* Header Bar */}
      <div className="section-header-bar">
        <div>
          <h2>Care Team &amp; Specialist Directory</h2>
          <p>
            Connect with {specialists.length} board-certified healthcare specialists across verified clinical facilities.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-strip">
        <div className="filter-search-box">
          <Search width={16} height={16} />
          <input
            type="text"
            placeholder="Search doctor by name, specialty, clinic, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills-group">
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              type="button"
              className={`filter-pill ${selectedSpecialty === spec ? 'active' : ''}`}
              onClick={() => setSelectedSpecialty(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="doctors-directory-grid">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="doctor-card">
            <div className="doctor-card-header">
              <div className="doctor-avatar-wrap">
                <img src={doc.avatarUrl} alt={doc.name} className="doctor-avatar-img" />
                <span className="online-presence-dot" title="Available for consultation" />
              </div>

              <div className="doctor-headline">
                <div className="flex-row items-center justify-between">
                  <h3>{doc.name}</h3>
                  <span className="doc-rating-badge">★ {doc.rating} ({doc.reviewsCount})</span>
                </div>
                <span className="doc-specialty-title">{doc.specialty}</span>
                <span className="doc-qualifications">{doc.qualifications}</span>
              </div>
            </div>

            <p className="doc-about-snippet">{doc.about}</p>

            <div className="doc-metadata-grid">
              <div className="doc-meta-cell">
                <span className="meta-cell-label">Clinic / Hospital</span>
                <strong className="meta-cell-value">{doc.clinic}</strong>
              </div>
              <div className="doc-meta-cell">
                <span className="meta-cell-label">Experience</span>
                <strong className="meta-cell-value">{doc.experience}</strong>
              </div>
              <div className="doc-meta-cell">
                <span className="meta-cell-label">Location</span>
                <strong className="meta-cell-value">{doc.location}</strong>
              </div>
              <div className="doc-meta-cell">
                <span className="meta-cell-label">Consultation Fee</span>
                <strong className="meta-cell-value text-teal">{doc.fee}</strong>
              </div>
            </div>

            <div className="doc-availability-tag">
              <Clock width={14} height={14} />
              <span>
                Next Slot: <strong>{doc.availability}</strong>
              </span>
            </div>

            <div className="doctor-card-footer">
              <button
                type="button"
                className="btn-card-msg"
                onClick={() => onMessageDoctor && onMessageDoctor(doc)}
                title="Send direct message to doctor"
              >
                <MessageSquare width={16} height={16} />
                <span>Message</span>
              </button>

              <button
                type="button"
                className="btn-card-book"
                onClick={() => onBookDoctor && onBookDoctor(doc)}
              >
                <Calendar width={16} height={16} />
                <span>Book Visit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
