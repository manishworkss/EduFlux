import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AIAssistant.css';

const AdminAIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi Admin! I am your EduFlux AI Assistant. I can help you manage students and analyze fees.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/ask', { query: textToSend });
      setMessages([...newMessages, { 
        role: 'bot', 
        content: response.data.response,
        action: response.data.action,
        payload: response.data.payload
      }]);
    } catch (error) {
      console.error("AI request failed", error);
      setMessages([...newMessages, { role: 'bot', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    if (action === 'CREATE_STUDENT_PROMPT') {
      navigate('/admin/students');
    }
  };

  const suggestions = [
    "Are there any pending fees?",
    "Show me students with overdue fees",
    "Create student account for new admission"
  ];

  return (
    <div>
      <h2 className="section-title">Admin AI Assistant</h2>
      
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-avatar">🤖</div>
          <div className="ai-chat-header-info">
            <h3>EduFlux AI - Admin Mode</h3>
            <p>Your secure assistant for center operations.</p>
          </div>
        </div>

        <div className="ai-chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.content}
              {msg.action && msg.action !== 'NONE' && (
                <div style={{ marginTop: '12px' }}>
                  <button 
                    onClick={() => handleAction(msg.action)}
                    style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}
                  >
                    Confirm & Execute
                  </button>
                  <button style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble bot" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' }}>Suggested Questions:</div>
            <div className="suggestions">
              {suggestions.map((sug, idx) => (
                <button key={idx} className="suggestion-chip" onClick={() => handleSend(sug)}>
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-area">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask me to create a student or check fees..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button className="chat-send-btn" onClick={() => handleSend()} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAIAssistant;
