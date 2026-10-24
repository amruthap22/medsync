import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  Volume2,
  VolumeX,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from './Icons';

export default function ChatbotTab({
  currentUser,
  isAudioMuted = false,
  onToggleAudioMute,
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${currentUser?.full_name || 'Alice'}! I am MediAssist, your MedSync AI health and medication adherence assistant. I can answer questions regarding medication dosing, contraindications, missed doses, and healthy lifestyle habits. How may I support your care today?`,
      time: '10:00 AM',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const speakText = (text) => {
    if (isAudioMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean speech text
      const clean = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  const handleSend = async (userQuestion) => {
    const q = (userQuestion || inputVal).trim();
    if (!q) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      const botResponse = data.reply || data.response || "I have noted your health inquiry. Please adhere to your prescribing doctor's instructions.";

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(botResponse);
    } catch {
      const fallback = `Based on standard clinical guidelines for "${q}": Always take prescriptions exactly as scheduled by your doctor. If you experience dizziness or adverse symptoms, consult Dr. Carter or visit the nearest healthcare facility.`;
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallback,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      speakText(fallback);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const quickPrompts = [
    'How do I take Metformin safely?',
    'What should I do if I miss a dose of Lisinopril?',
    'Check interactions between Aspirin and Lisinopril',
    'Tips for maintaining a healthy blood pressure',
    'Common side effects of Atorvastatin',
  ];

  return (
    <div className="chatbot-tab-container">
      {/* Header Bar */}
      <div className="section-header-bar">
        <div>
          <h2>MediAssist AI &bull; Clinical Health Assistant</h2>
          <p>Ask medication adherence questions, check safe drug usage, and review lifestyle advice.</p>
        </div>

        <button
          type="button"
          className="btn-toggle-audio"
          onClick={onToggleAudioMute}
          title="Toggle Voice Readout"
        >
          {isAudioMuted ? <VolumeX width={18} height={18} /> : <Volume2 width={18} height={18} />}
          <span>{isAudioMuted ? 'Voice: Muted' : 'Voice: Active'}</span>
        </button>
      </div>

      {/* Prominent Medical Safety Disclaimer */}
      <div className="medical-safety-disclaimer-card">
        <AlertTriangle width={20} height={20} className="disclaimer-alert-icon" />
        <div className="disclaimer-text">
          <strong>Official Medical Information Disclaimer:</strong>
          <p>
            MediAssist is powered by artificial intelligence and provides general medication and wellness educational information. It is <em>not</em> a substitute for professional clinical judgment, diagnosis, or emergency care. For acute chest pain, shortness of breath, or allergic distress, contact emergency medical services immediately.
          </p>
        </div>
      </div>

      {/* Chat Area Card */}
      <div className="chatbot-main-card">
        {/* Messages Stream */}
        <div className="chatbot-messages-stream">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div key={m.id} className={`chat-message-row ${isBot ? 'bot-row' : 'user-row'}`}>
                <div className="chat-avatar-icon">
                  {isBot ? <Bot width={18} height={18} /> : 'U'}
                </div>
                <div className="chat-bubble-container">
                  <div className="chat-sender-name">
                    {isBot ? 'MediAssist AI' : (currentUser?.full_name || 'You')}
                  </div>
                  <div className="chat-text-content">
                    {m.text.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                  <span className="chat-timestamp">{m.time}</span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="chat-message-row bot-row">
              <div className="chat-avatar-icon">
                <Bot width={18} height={18} />
              </div>
              <div className="chat-bubble-container">
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="chatbot-prompts-bar">
          <span className="prompts-title">
            <Sparkles width={14} height={14} /> Suggested Questions:
          </span>
          <div className="prompts-list">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="prompt-chip-btn"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar with Mic STT */}
        <div className="chatbot-input-bar">
          <button
            type="button"
            className={`mic-dictate-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleSpeechRecognition}
            title={isListening ? 'Stop listening' : 'Speak your question'}
          >
            <Mic width={18} height={18} />
          </button>

          <input
            type="text"
            placeholder={isListening ? 'Listening to your voice...' : 'Ask about dosage schedules, side effects, or drug interactions...'}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            type="button"
            className="chatbot-send-btn"
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || loading}
          >
            <Send width={16} height={16} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
