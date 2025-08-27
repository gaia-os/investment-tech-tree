'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { ChatMessage, ChatHistory, ChatContext } from '@/lib/types';
import { GeminiChatClient } from '@/lib/geminiClient';

interface ChatProps {
  context: ChatContext;
}

const Chat = ({ context }: ChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geminiClient, setGeminiClient] = useState<GeminiChatClient | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Gemini client
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      setGeminiClient(new GeminiChatClient(apiKey));
    } else {
      console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set');
    }
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('tech-tree-chat-history');
      if (savedHistory) {
        const history: ChatHistory = JSON.parse(savedHistory);
        setMessages(history.messages);

        // Restore scroll position after messages are loaded
        setTimeout(() => {
          const savedScrollPosition = localStorage.getItem(
            'tech-tree-chat-scroll',
          );
          if (savedScrollPosition && messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = parseInt(
              savedScrollPosition,
              10,
            );
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const history: ChatHistory = {
        messages,
        lastUpdated: Date.now(),
      };
      try {
        localStorage.setItem('tech-tree-chat-history', JSON.stringify(history));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom only when user sends a message
  useEffect(() => {
    // Only scroll if the last message is from the user or if it's the first message
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'user') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !geminiClient) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiClient.sendMessage(
        userMessage.content,
        context,
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content:
          'Sorry, there was an error processing your request. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('tech-tree-chat-history');
    localStorage.removeItem('tech-tree-chat-scroll');
  };

  const saveScrollPosition = () => {
    if (messagesContainerRef.current) {
      localStorage.setItem(
        'tech-tree-chat-scroll',
        messagesContainerRef.current.scrollTop.toString(),
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Tech Tree Chat</h3>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={saveScrollPosition}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">Ask anything about the Tech Tree:</p>
            <ul className="text-sm text-left max-w-md mx-auto mt-2 space-y-1">
              <li>
                • What is the difference between Tokamaks and Stellarators?
              </li>
              <li>• Which technologies have the highest TRL?</li>
              <li>• How does a Molten Salt Reactor work?</li>
            </ul>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 border'
                }`}
              >
                <div className="break-words">
                  {message.type === 'assistant' ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          // Remove ```html and ``` markers from the response
                          message.content
                            .replace(/^```html\s*/i, '')
                            .replace(/\s*```$/, ''),
                          {
                            ALLOWED_TAGS: [
                              'h2',
                              'h3',
                              'h4',
                              'p',
                              'ul',
                              'ol',
                              'li',
                              'strong',
                              'em',
                              'table',
                              'thead',
                              'tbody',
                              'tr',
                              'td',
                              'th',
                              'code',
                              'pre',
                              'br',
                            ],
                            ALLOWED_ATTR: ['class'],
                          },
                        ),
                      }}
                      className="prose prose-sm max-w-none"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 border">
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-gray-500" />
                <span className="text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the Tech Tree..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || !geminiClient}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Chat;
