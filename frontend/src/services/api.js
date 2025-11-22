import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const chatAPI = {
  sendMessage: async (message, conversationId = null) => {
    try {
      const response = await api.post('/api/chat/generate', {
        message,
        conversation_id: conversationId,
      });
      return response.data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  },

  getConversations: async () => {
    try {
      const response = await api.get('/api/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  },

  getConversation: async (id) => {
    try {
      const response = await api.get(`/api/chat/conversations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  },

  deleteConversation: async (id) => {
    try {
      const response = await api.delete(`/api/chat/conversations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  },
};

export const codeAPI = {
  generateCode: async (prompt, language = 'python') => {
    try {
      const response = await api.post('/api/code/generate', {
        prompt,
        language,
      });
      return response.data;
    } catch (error) {
      console.error('Generate code error:', error);
      throw error;
    }
  },

  refactorCode: async (code, instructions) => {
    try {
      const response = await api.post('/api/code/refactor', {
        code,
        instructions,
      });
      return response.data;
    } catch (error) {
      console.error('Refactor code error:', error);
      throw error;
    }
  },

  explainCode: async (code) => {
    try {
      const response = await api.post('/api/code/explain', {
        code,
      });
      return response.data;
    } catch (error) {
      console.error('Explain code error:', error);
      throw error;
    }
  },
};

export default api;