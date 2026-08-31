import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AIAssistant.css';

const AdminAIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi Admin! I am your EduFlux AI Assistant. I can help you manage students, parse admission documents/CSVs, and analyze fees.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // reset file input
    event.target.value = null;

    const newMessages = [...messages, { 
      role: 'user', 
      content: '', 
      file: file.name
    }];
    setMessages(newMessages);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/ai/upload-student-data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessages([...newMessages, { 
        role: 'bot', 
        content: response.data.response,
        action: response.data.action,
        payload: response.data.payload
      }]);
    } catch (error) {
      console.error("File upload failed", error);
      const errorMsg = error.response?.data?.response || "Failed to process the document. Please try again.";
      setMessages([...newMessages, { role: 'bot', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRegistration = async (payload) => {
    setLoading(true);
    
    // add an optimistic message
    const tempMessages = [...messages, { role: 'user', content: 'Confirming registration...' }];
    setMessages(tempMessages);
    
    try {
      const response = await api.post('/ai/confirm-registration', payload);
      setMessages([...tempMessages, { 
        role: 'bot', 
        content: response.data.response,
        action: response.data.action,
        payload: response.data.payload
      }]);
    } catch (error) {
      console.error("Registration confirmation failed", error);
      const errorMsg = error.response?.data?.response || "Failed to register students. Please try again.";
      setMessages([...tempMessages, { role: 'bot', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Are there any pending fees?",
    "Show me students with overdue fees",
    "Register this student"
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
              {msg.file && (
                <div className="chat-file-bubble">
                  <div className="file-icon">📄</div>
                  <div className="file-name">{msg.file}</div>
                </div>
              )}
              {msg.content && <div style={{ marginTop: msg.file ? '8px' : '0', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
              
              {/* Registration Preview (Single or Batch) */}
              {msg.action === 'PREVIEW_REGISTRATION' && msg.payload && (
                <div style={{ marginTop: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #cbd5e1', color: '#1e293b' }}>
                  {msg.payload.length === 1 ? (
                    // Single Student Preview
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Student Found</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                        <div><strong>Name:</strong> {msg.payload[0].name || <span style={{color: 'red'}}>Missing</span>}</div>
                        <div><strong>DOB:</strong> {msg.payload[0].dob || <span style={{color: 'red'}}>Missing</span>}</div>
                        <div><strong>Email:</strong> {msg.payload[0].email || <span style={{color: 'red'}}>Missing</span>}</div>
                        <div><strong>Mobile:</strong> {msg.payload[0].mobileNo || <span style={{color: 'red'}}>Missing</span>}</div>
                        <div><strong>Course:</strong> {msg.payload[0].courseName || 'N/A'}</div>
                        <div><strong>Semester:</strong> {msg.payload[0].semester || 'N/A'}</div>
                        <div style={{ gridColumn: 'span 2' }}><strong>Guardian:</strong> {msg.payload[0].guardianName || 'N/A'} ({msg.payload[0].guardianRelationship || 'N/A'})</div>
                      </div>
                      
                      {!msg.payload[0].valid && (
                        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', fontSize: '12px', color: '#991b1b' }}>
                          {msg.payload[0].isDuplicate && <p style={{margin: '0 0 4px'}}>⚠️ Student account already exists with this email.</p>}
                          {msg.payload[0].missingFields?.length > 0 && <p style={{margin: 0}}>⚠️ Missing required information: {msg.payload[0].missingFields.join(', ')}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Batch CSV Preview
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Batch Registration Preview</h4>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px' }}>
                        <div><strong>Total Records:</strong> {msg.payload.length}</div>
                        <div style={{color: '#16a34a'}}><strong>Valid:</strong> {msg.payload.filter(p => p.valid).length}</div>
                        <div style={{color: '#dc2626'}}><strong>Invalid/Duplicate:</strong> {msg.payload.filter(p => !p.valid).length}</div>
                      </div>
                      <div style={{ overflowX: 'auto', maxHeight: '200px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', backgroundColor: 'white' }}>
                          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9' }}>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                              <th style={{ padding: '6px' }}>Name</th>
                              <th style={{ padding: '6px' }}>Email</th>
                              <th style={{ padding: '6px' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {msg.payload.map((s, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px' }}>{s.name || '-'}</td>
                                <td style={{ padding: '6px' }}>{s.email || '-'}</td>
                                <td style={{ padding: '6px', color: s.valid ? '#16a34a' : '#dc2626' }}>
                                  {s.valid ? 'Ready' : (s.isDuplicate ? 'Duplicate Email' : 'Missing Info')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleConfirmRegistration(msg.payload)}
                      disabled={!msg.payload.some(p => p.valid)}
                      style={{ 
                        padding: '8px 16px', 
                        background: msg.payload.some(p => p.valid) ? '#10b981' : '#cbd5e1', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: msg.payload.some(p => p.valid) ? 'pointer' : 'not-allowed',
                        fontWeight: '500'
                      }}
                    >
                      {msg.payload.length === 1 ? 'Create Student Account' : 'Confirm Batch Registration'}
                    </button>
                    <button style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Success Credentials Display */}
              {msg.action === 'CREATE_STUDENTS' && msg.payload && (
                <div style={{ marginTop: '16px', backgroundColor: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155' }}>Registration Results</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '8px', color: '#64748b' }}>Name</th>
                          <th style={{ padding: '8px', color: '#64748b' }}>Student ID</th>
                          <th style={{ padding: '8px', color: '#64748b' }}>Temp Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {msg.payload.map((s, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px', fontWeight: '500' }}>{s.student?.user?.name || '-'}</td>
                            <td style={{ padding: '8px', color: '#3b82f6' }}>{s.student?.enrollmentNumber || '-'}</td>
                            <td style={{ padding: '8px', fontFamily: 'monospace' }}>{s.temporaryPassword || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button 
                    onClick={() => {
                      const text = msg.payload.map(s => `Name: ${s.student?.user?.name}\nID: ${s.student?.enrollmentNumber}\nPassword: ${s.temporaryPassword}`).join('\n\n');
                      navigator.clipboard.writeText(text);
                      alert('Credentials copied to clipboard!');
                    }}
                    style={{ marginTop: '12px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#475569' }}
                  >
                    📋 Copy All Credentials
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
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*,application/pdf,.csv,text/csv,text/plain"
            onChange={handleFileUpload}
          />
          <button 
            className="chat-attach-btn" 
            onClick={() => fileInputRef.current.click()}
            title="Attach Student Form (PDF/Image/CSV)"
          >
            📎
          </button>
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
