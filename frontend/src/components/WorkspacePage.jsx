import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WorkspacePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadConversations();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ FIX: Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      loadConversationMessages(currentConversation.id);
    }
  }, [currentConversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      console.log('📚 Loading conversations...');
      const response = await axios.get(`${API_URL}/api/chat/conversations`);
      console.log('✅ Conversations loaded:', response.data.conversations);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      // Keep empty if backend fails
      setConversations([]);
    }
  };

  // ✅ NEW: Function to load messages for a specific conversation
  const loadConversationMessages = async (conversationId) => {
    try {
      console.log(`📖 Loading messages for conversation ${conversationId}...`);
      const response = await axios.get(`${API_URL}/api/chat/conversations/${conversationId}`);
      console.log('✅ Messages loaded:', response.data.messages);
      
      // Convert backend format to frontend format
      const formattedMessages = response.data.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error(`❌ Failed to load conversation ${conversationId}:`, error);
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    console.log('🆕 Creating new chat');
    setCurrentConversation(null);
    setMessages([]);
    setInput('');
  };

  // ✅ FIX: Handle conversation selection
  const handleSelectConversation = async (conv) => {
    console.log('📂 Selecting conversation:', conv.id);
    setCurrentConversation(conv);
    // Messages will be loaded by useEffect
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    console.log('🚀 Sending message to backend:', input);

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      console.log('📤 Making API request to:', `${API_URL}/api/chat/generate`);
      
      const response = await axios.post(`${API_URL}/api/chat/generate`, {
        message: currentInput,
        conversation_id: currentConversation?.id || null,
      });

      console.log('✅ API Response received:', response.data);

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: response.data.timestamp,
      };

      setMessages(prev => [...prev, aiMessage]);

      // ✅ FIX: Update or create conversation
      if (!currentConversation && response.data.conversation_id) {
        const newConv = {
          id: response.data.conversation_id,
          title: currentInput.slice(0, 50) + (currentInput.length > 50 ? '...' : ''),
          updated_at: response.data.timestamp,
          created_at: response.data.timestamp,
          message_count: 2
        };
        setCurrentConversation(newConv);
        await loadConversations(); // Reload to show in sidebar
      } else if (currentConversation) {
        // Update existing conversation's timestamp
        await loadConversations();
      }

    } catch (error) {
      console.error('❌ API Error:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = {
        role: 'assistant',
        content: `❌ **Error**: Failed to generate code.\n\n${error.response?.data?.detail || error.message}\n\nPlease check:\n1. Backend is running on ${API_URL}\n2. Model is loaded\n3. Check browser console for details`,
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Delete conversation
  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent selecting the conversation
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting conversation ${conversationId}`);
      await axios.delete(`${API_URL}/api/chat/conversations/${conversationId}`);
      
      // If deleting current conversation, clear it
      if (currentConversation?.id === conversationId) {
        handleNewChat();
      }
      
      // Reload conversations list
      await loadConversations();
      console.log('✅ Conversation deleted');
    } catch (error) {
      console.error('❌ Failed to delete conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  const suggestedPrompts = [
    {
      title: 'Refactor legacy code',
      description: 'Clean up a large file, add types, and improve structure without breaking behavior.',
    },
    {
      title: 'Generate new API',
      description: 'Scaffold REST or GraphQL endpoints, including validation and tests.',
    },
    {
      title: 'Explain this file',
      description: 'Paste or attach code and get a clear walkthrough of how it works.',
    },
  ];

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: '#000' }}>
      {/* Sidebar */}
      <div style={{
        width: '320px',
        backgroundColor: '#1f2937',
        borderRight: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #374151' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
            Chat history
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved
          </p>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.75rem', 
                fontSize: '0.875rem',
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>

          <button
            onClick={handleNewChat}
            className="btn btn-secondary"
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              fontSize: '0.875rem',
              backgroundColor: '#8b5cf6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + New chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 1rem', fontSize: '0.875rem' }}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
                Recent
              </div>
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '0.25rem',
                    backgroundColor: currentConversation?.id === conv.id ? '#374151' : 'transparent',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={(e) => {
                    if (currentConversation?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentConversation?.id !== conv.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: 'white', 
                      marginBottom: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {new Date(conv.updated_at).toLocaleDateString()} · {conv.message_count || 0} messages
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    style={{
                      padding: '0.25rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      marginLeft: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#9ca3af' }}>Backend Status</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>● Online</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            API: {API_URL}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Model: Luffy Code Assistant
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid #374151', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>
              {currentConversation?.title || 'New chat'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              {currentConversation 
                ? `Conversation ${currentConversation.id} · ${messages.length} messages`
                : 'Start a new conversation'}
            </p>
          </div>
          <div>
            <select className="input" style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              color: 'white',
              borderRadius: '8px'
            }}>
              <option>codegen-latest</option>
              <option>codegen-fast</option>
              <option>codegen-stable</option>
            </select>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {messages.length === 0 ? (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                  What are you building today?
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                  Describe a feature, file, or repo and I will help you generate, refactor, and explain the code.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt.title)}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: '1px solid #374151',
                      transition: 'border-color 0.2s',
                      backgroundColor: '#1f2937',
                      borderRadius: '12px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#374151'}
                  >
                    <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>{prompt.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{prompt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="chat-message"
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '1.5rem'
                  }}
                >
                  {message.role === 'user' ? (
                    <div style={{
                      backgroundColor: '#374151',
                      borderRadius: '12px',
                      padding: '1rem',
                      maxWidth: '70%',
                      color: 'white'
                    }}>
                      <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message.content}</p>
                    </div>
                  ) : (
                    <div style={{ maxWidth: '100%' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: message.error ? '#ef4444' : '#8b5cf6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          AI
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            Assistant · {message.error ? 'Error' : 'Response'}
                          </div>
                          <div style={{
                            backgroundColor: '#1f2937',
                            border: `1px solid ${message.error ? '#ef4444' : '#374151'}`,
                            borderRadius: '12px',
                            padding: '1rem',
                            color: 'white'
                          }}>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>{message.content}</p>
                          </div>
                          {!message.error && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content);
                                  alert('Code copied to clipboard!');
                                }}
                                className="btn" 
                                style={{
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.875rem',
                                  backgroundColor: 'transparent',
                                  border: '1px solid #374151',
                                  color: 'white',
                                  cursor: 'pointer',
                                  borderRadius: '8px'
                                }}
                              >
                                📋 Copy
                              </button>
                              <button className="btn" style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                backgroundColor: 'transparent',
                                border: '1px solid #374151',
                                color: 'white',
                                cursor: 'pointer',
                                borderRadius: '8px'
                              }}>
                                📁 Insert into file
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    AI
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="spinner"></div>
                      <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Luffy is generating code...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid #374151', padding: '1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '1.25rem'
                }}
              >
                📎
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Describe the code you want to generate, refactor, or debug..."
                className="textarea"
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: 'white',
                  resize: 'none',
                  minHeight: '80px',
                  fontSize: '1rem'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn btn-secondary"
                style={{
                  padding: '0.75rem 1.5rem',
                  height: 'fit-content',
                  alignSelf: 'flex-end',
                  opacity: (!input.trim() || loading) ? 0.5 : 1,
                  cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                  backgroundColor: '#8b5cf6',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
              Press Enter to send · Shift+Enter for new line
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
              <span style={{ color: '#a78bfa' }}>Luffy Code Assistant</span> · Fine-tuned Gemma 2B model
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;