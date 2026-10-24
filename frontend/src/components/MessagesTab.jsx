import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  PhoneCall,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  Search,
} from './Icons';

export default function MessagesTab({
  currentUser,
  messages = [],
  onSendMessage,
  activeDoctorProp = null,
}) {
  const contactsList = [
    {
      id: 'doc-1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      avatar: 'https://images.unsplash.com/photo-1594824813580-c11458e0a6e0?auto=format&fit=crop&w=120&q=80',
      status: 'Online',
      lastMessage: 'Great! Please continue your medication and let me know if you experience any issues.',
      time: '10:35 AM',
      unread: false,
    },
    {
      id: 'support',
      name: 'MedSync Support',
      specialty: 'Clinical Helpdesk',
      avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=120&q=80',
      status: 'Online',
      lastMessage: 'How can we help you with your prescriptions today?',
      time: 'Yesterday',
      unread: false,
    },
    {
      id: 'doc-2',
      name: 'Dr. Rahul Menon',
      specialty: 'Cardiologist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80',
      status: 'Offline',
      lastMessage: 'Your lab report looks completely normal.',
      time: 'Apr 18',
      unread: false,
    },
    {
      id: 'system',
      name: 'System Notification',
      specialty: 'MedSync Care Alert',
      avatar: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=120&q=80',
      status: 'Bot',
      lastMessage: 'Appointment confirmed for tomorrow at 10:00 AM.',
      time: 'Apr 15',
      unread: false,
    },
  ];

  const [activeContact, setActiveContact] = useState(contactsList[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [inputText, setInputText] = useState('');

  // Initial chat messages matching Screen 10
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'doctor',
      text: 'Hello! How are you feeling today?',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'patient',
      text: "I'm feeling much better, thank you!",
      time: '10:32 AM',
    },
    {
      id: 3,
      sender: 'doctor',
      text: 'Great! Please continue your medication and let me know if you experience any issues.',
      time: '10:35 AM',
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'patient',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated doctor response after 1.5s
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'doctor',
          text: 'Understood! I have logged this into your clinical care notes. Stay hydrated and rest well.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const filteredContacts = contactsList.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.specialty.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="medisync-messages-tab-container">
      <div className="messages-layout-grid">
        {/* Left Column: Conversations List */}
        <div className="dash-panel-card messages-contacts-column">
          <div className="contacts-search-box">
            <Search width={16} height={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          <div className="contacts-list-stream">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item-card ${activeContact.id === contact.id ? 'active' : ''}`}
                onClick={() => setActiveContact(contact)}
              >
                <div className="contact-avatar-wrap">
                  <img src={contact.avatar} alt={contact.name} className="contact-avatar-img" />
                  {contact.status === 'Online' && <span className="online-status-dot" />}
                </div>

                <div className="contact-info-meta">
                  <div className="contact-title-row">
                    <strong>{contact.name}</strong>
                    <span className="contact-time-label">{contact.time}</span>
                  </div>
                  <span className="contact-spec-label">{contact.specialty}</span>
                  <p className="contact-last-msg-preview">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="dash-panel-card messages-chat-window">
          {/* Chat Window Header */}
          <div className="chat-window-header">
            <div className="chat-recipient-meta">
              <div className="chat-recipient-avatar">
                <img src={activeContact.avatar} alt={activeContact.name} />
                {activeContact.status === 'Online' && <span className="online-status-dot" />}
              </div>
              <div className="chat-recipient-names">
                <h3>{activeContact.name}</h3>
                <span className="chat-recipient-status-tag">
                  {activeContact.status === 'Online' ? '● Online' : activeContact.specialty}
                </span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button type="button" className="btn-chat-call" title="Start voice consultation">
                <PhoneCall width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chat-messages-stream">
            <div className="chat-date-divider">
              <span>Today</span>
            </div>

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.sender === 'patient' ? 'bubble-patient-row' : 'bubble-doctor-row'}`}
              >
                <div className={`chat-bubble ${msg.sender === 'patient' ? 'bubble-patient' : 'bubble-doctor'}`}>
                  <p>{msg.text}</p>
                  <span className="bubble-timestamp">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <form className="chat-input-toolbar" onSubmit={handleSend}>
            <button type="button" className="btn-attach-file" title="Attach file or lab report">
              <Paperclip width={18} height={18} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="btn-send-message" title="Send message">
              <Send width={16} height={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
