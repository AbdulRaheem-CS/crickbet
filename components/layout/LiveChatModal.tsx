'use client';

/**
 * LiveChatModal
 * Full-screen modal for user ↔ admin support chat
 * Two tabs: Chat (active conversation) | History (past messages)
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { chatAPI } from '@/lib/api-client';
import { io, Socket } from 'socket.io-client';
import {
  FaTimes, FaPaperPlane, FaHeadset, FaComments, FaHistory,
} from 'react-icons/fa';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

interface Message {
  _id: string;
  conversationId: string;
  sender: { _id: string; username: string; email: string; role?: string };
  senderRole: 'user' | 'admin';
  message: string;
  createdAt: string;
}

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChatModal({ isOpen, onClose }: LiveChatModalProps) {
  const { user } = useAuth();
  const chatRouter = useRouter();
  const [tab, setTab] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await chatAPI.getMyMessages({ limit: 100 });
      setMessages((res as any)?.data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Socket connection for real-time messages
  useEffect(() => {
    if (!isOpen || !user) return;

    fetchMessages();

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('authToken') || localStorage.getItem('token')
      : null;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('chat:newMessage', (data: { conversationId: string; message: Message }) => {
      // Only accept messages for this user's conversation
      if (data.conversationId === `chat_${user.id}`) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, user, fetchMessages, scrollToBottom]);

  // Scroll to bottom when messages change or tab switches to chat
  useEffect(() => {
    if (tab === 'chat') scrollToBottom();
  }, [messages, tab, scrollToBottom]);

  const handleSend = async () => {
    if (!inputMsg.trim() || sending) return;
    try {
      setSending(true);
      const res = await chatAPI.sendMessage(inputMsg.trim());
      const newMsg = (res as any)?.data;
      if (newMsg) {
        setMessages(prev => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
      setInputMsg('');
      scrollToBottom();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  // If not logged in, show a prompt
  if (!user) {
    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <FaHeadset className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Login Required</h3>
          <p className="text-sm text-gray-500 mb-5">Please log in to start a live chat with our support team.</p>
          <button
            onClick={() => { onClose(); chatRouter.push('/login'); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Format time
  const fmtTime = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const fmtDate = (d: string) => {
    const dt = new Date(d);
    const today = new Date();
    if (dt.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dt.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dt.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Group messages by date for history tab
  const groupedByDate: Record<string, Message[]> = {};
  messages.forEach(m => {
    const key = new Date(m.createdAt).toDateString();
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(m);
  });

  return (
    <div className="fixed inset-0 z-[10001] flex flex-col bg-white md:items-center md:justify-center md:bg-black/60">
      {/* Desktop: centered card; Mobile: full screen */}
      <div className="flex flex-col w-full h-full md:w-[420px] md:h-[600px] md:rounded-2xl md:shadow-2xl md:overflow-hidden bg-white">

        {/* Header */}
        <div className="bg-[#005DAC] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <FaHeadset className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Live Support</h3>
              <span className="text-[10px] opacity-80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition p-1">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          <button
            onClick={() => setTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition border-b-2 ${
              tab === 'chat'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <FaComments className="w-3.5 h-3.5" />
            Chat
          </button>
          
        </div>

        {/* Content */}
        {tab === 'chat' ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <FaHeadset className="w-12 h-12 text-blue-200 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Welcome to Live Support!</p>
                  <p className="text-xs text-gray-400 mt-1">Send a message to start chatting with our team.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderRole === 'user';
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                        }`}
                      >
                        {!isMe && (
                          <div className="text-[10px] font-semibold text-blue-600 mb-0.5">Support</div>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={`text-[9px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                          {fmtTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2 flex items-end gap-2">
              <textarea
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message…"
                rows={1}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24 overflow-y-auto"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputMsg.trim() || sending}
                className="shrink-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <FaPaperPlane className="w-4 h-4" />
                )}
              </button>
            </div>
          </>
        ) : (
          /* History tab */
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <FaHistory className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No chat history yet.</p>
              </div>
            ) : (
              Object.entries(groupedByDate).map(([dateKey, msgs]) => (
                <div key={dateKey} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-2">
                      {fmtDate(msgs[0].createdAt)}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  {msgs.map(msg => {
                    const isMe = msg.senderRole === 'user';
                    return (
                      <div key={msg._id} className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-blue-100 text-blue-800 rounded-br-sm'
                              : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                          }`}
                        >
                          {!isMe && <div className="text-[9px] font-semibold text-blue-500 mb-0.5">Support</div>}
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className="text-[8px] text-gray-400 text-right mt-0.5">{fmtTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
