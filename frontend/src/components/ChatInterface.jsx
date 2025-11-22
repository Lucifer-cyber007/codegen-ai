import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, RotateCcw } from 'lucide-react';
import { chatAPI } from '../services/api';
import CodeBlock from './CodeBlock';

const ChatInterface = ({ conversation, onConversationUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, conversation?.id);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            {conversation?.title || 'New chat'}
          </h2>
          <p className="text-sm text-gray-400">
            Working in workspace <span className="text-white">web-app-dashboard</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:border-gray-600 focus:outline-none">
            <option>codegen-latest</option>
            <option>codegen-fast</option>
            <option>codegen-stable</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">What are you building today?</h3>
              <p className="text-gray-400">
                Describe a feature, file, or repo and I will help you generate, refactor, and
                explain the code.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt.title)}
                  className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-left hover:border-gray-700 transition"
                >
                  <h4 className="font-medium mb-2">{prompt.title}</h4>
                  <p className="text-sm text-gray-400">{prompt.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.role === 'user' ? 'flex justify-end' : ''
                }`}
              >
                {message.role === 'user' ? (
                  <div className="bg-gray-800 rounded-lg p-4 max-w-2xl">
                    <p className="text-white whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  <div className="max-w-full">
                    <div className="flex items-start space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">AI</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">Assistant · Draft</div>
                      </div>
                    </div>
                    <div className="ml-11">
                      <CodeBlock content={message.content} />
                      {!message.error && (
                        <div className="flex items-center space-x-2 mt-4">
                          <button className="px-3 py-1.5 text-sm border border-gray-700 rounded-lg hover:border-gray-600 transition">
                            Copy
                          </button>
                          <button className="px-3 py-1.5 text-sm border border-gray-700 rounded-lg hover:border-gray-600 transition">
                            Insert into file
                          </button>
                          <button className="px-3 py-1.5 text-sm border border-gray-700 rounded-lg hover:border-gray-600 transition">
                            Ask follow-up
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="spinner"></div>
                    <span className="text-sm text-gray-400">Generating response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-2">
            <button
              type="button"
              className="p-3 text-gray-400 hover:text-white transition"
            >
              <Paperclip size={20} />
            </button>
            <button
              type="button"
              className="p-3 text-gray-400 hover:text-white transition"
            >
              <RotateCcw size={20} />
            </button>
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the code you want to generate, refactor, or debug..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg resize-none focus:border-gray-700 focus:outline-none"
                rows="3"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 bg-white text-black rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send · Shift+Enter for new line
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            <span className="text-purple-400">codegen-latest</span> · Optimized for editing existing codebases
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;