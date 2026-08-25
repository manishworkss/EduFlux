import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi there! I am your AI Fee Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/ask', { query: textToSend });
      setMessages([...newMessages, { role: 'bot', content: response.data.response }]);
    } catch (error) {
      console.error("AI request failed", error);
      setMessages([...newMessages, { role: 'bot', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What is my total pending fee?",
    "When is my next payment due?",
    "Show me my overdue fees."
  ];

  return (
    <div>
      <h2 className="section-title">AI Fee Assistant</h2>
      
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-avatar">🤖</div>
          <div className="ai-chat-header-info">
            <h3>EduFlux AI</h3>
            <p>Always here to help with your fee queries.</p>
          </div>
        </div>

        <div className="ai-chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble bot" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
              Typing...
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
            placeholder="Type your question here..." 
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

export default AIAssistant;
