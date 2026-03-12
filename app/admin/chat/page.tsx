'use client';

/**
 * Admin Live Chat Page
 * Real-time chat support for admin to receive and reply to user messages
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { chatAPI } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';
import {
  FiMessageSquare, FiSend, FiSearch, FiRefreshCw,
  FiUser, FiClock, FiCheck, FiCheckCircle, FiChevronLeft,
} from 'react-icons/fi';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

interface Conversation {
  _id: string;
  conversationId: string;
  user: {
    _id: string;
    username: string;
    email: string;
    phone?: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: string;
  unreadByAdmin: number;
  status: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  senderRole: 'user' | 'admin';
  message: string;
  readByAdmin: boolean;
  readByUser: boolean;
  createdAt: string;
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [unreadTotal, setUnreadTotal] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [mobileShowMessages, setMobileShowMessages] = useState(false);

  // Initialize socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('admin:joinChat');
    });

    socket.on('chat:newMessage', (data: { conversationId: string; message: Message }) => {
      const { conversationId, message } = data;

      // If we're viewing this conversation, add the message
      setSelectedConv(prev => {
        if (prev && prev.conversationId === conversationId) {
          setMessages(msgs => {
            // Avoid duplicates
            if (msgs.some(m => m._id === message._id)) return msgs;
            return [...msgs, message];
          });
        }
        return prev;
      });

      // Update conversation list
      setConversations(prev => {
        const existing = prev.find(c => c.conversationId === conversationId);
        if (existing) {
          return prev.map(c =>
            c.conversationId === conversationId
              ? {
                  ...c,
                  lastMessage: message.message.slice(0, 100),
                  lastMessageAt: message.createdAt,
                  lastMessageBy: message.senderRole,
                  unreadByAdmin: message.senderRole === 'user' ? c.unreadByAdmin + 1 : c.unreadByAdmin,
                }
              : c
          ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        } else {
          // New conversation — refresh
          fetchConversations();
          return prev;
        }
      });

      // Update unread count
      if (message.senderRole === 'user') {
        setUnreadTotal(prev => prev + 1);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getConversations({ status: statusFilter, limit: 50 });
      const data = (res as any)?.data ?? [];
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await chatAPI.getUnreadCount();
      const count = (res as any)?.data?.count ?? 0;
      setUnreadTotal(count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  // Fetch messages for selected conversation
  const loadMessages = useCallback(async (conv: Conversation) => {
    try {
      setMessagesLoading(true);
      const res = await chatAPI.getConversationMessages(conv.conversationId, { limit: 100 });
      const data = (res as any)?.data ?? [];
      setMessages(data);

      // Mark as read — update local state
      setConversations(prev =>
        prev.map(c =>
          c.conversationId === conv.conversationId
            ? { ...c, unreadByAdmin: 0 }
            : c
        )
      );
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [fetchUnreadCount]);

  // Select a conversation
  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    setMobileShowMessages(true);
    loadMessages(conv);
  };

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a reply
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;

    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await chatAPI.adminReply(selectedConv.conversationId, msgText);
      const sentMsg = (res as any)?.data;
      if (sentMsg) {
        setMessages(prev => {
          if (prev.some(m => m._id === sentMsg._id)) return prev;
          return [...prev, sentMsg];
        });

        // Update conversation in list
        setConversations(prev =>
          prev.map(c =>
            c.conversationId === selectedConv.conversationId
              ? {
                  ...c,
                  lastMessage: msgText.slice(0, 100),
                  lastMessageAt: sentMsg.createdAt,
                  lastMessageBy: 'admin',
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send reply', err);
      setNewMessage(msgText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>((groups, msg) => {
    const date = formatDate(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
    return groups;
  }, []);

  // Filter conversations by search
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.user?.username?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FiMessageSquare className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Live Chat Support</h1>
          {unreadTotal > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadTotal} unread
            </span>
          )}
        </div>
        <button
          onClick={() => { fetchConversations(); fetchUnreadCount(); }}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* Conversation List — Left Panel */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${mobileShowMessages ? 'hidden md:flex' : 'flex'}`}>
          {/* Search & Filter */}
          <div className="p-3 border-b border-gray-200 space-y-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1">
              {['all', 'active', 'closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FiMessageSquare className="w-12 h-12 mb-3" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-blue-50 transition text-left ${
                    selectedConv?.conversationId === conv.conversationId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">
                      {conv.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {conv.user?.username || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 truncate pr-2">
                        {conv.lastMessageBy === 'admin' && (
                          <span className="text-blue-500 mr-1">You:</span>
                        )}
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      {conv.unreadByAdmin > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadByAdmin > 9 ? '9+' : conv.unreadByAdmin}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Panel — Right */}
        <div className={`flex-1 flex flex-col ${mobileShowMessages ? 'flex' : 'hidden md:flex'}`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => { setMobileShowMessages(false); setSelectedConv(null); }}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    {selectedConv.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {selectedConv.user?.username || 'Unknown User'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConv.user?.email || ''}
                    {selectedConv.user?.phone && ` • ${selectedConv.user.phone}`}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedConv.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {selectedConv.status}
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FiMessageSquare className="w-12 h-12 mb-3" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  groupedMessages.map((group, gi) => (
                    <div key={gi}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">{group.date}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {group.messages.map((msg) => {
                        const isAdmin = msg.senderRole === 'admin';
                        return (
                          <div
                            key={msg._id}
                            className={`flex mb-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] ${isAdmin ? 'order-1' : ''}`}>
                              <div
                                className={`px-4 py-2.5 rounded-2xl ${
                                  isAdmin
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                                }`}
                              >
                                {!isAdmin && (
                                  <p className="text-xs font-semibold text-blue-600 mb-1">
                                    {msg.sender?.username || 'User'}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-gray-400">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isAdmin && (
                                  msg.readByUser ? (
                                    <FiCheckCircle className="w-3 h-3 text-blue-400" />
                                  ) : (
                                    <FiCheck className="w-3 h-3 text-gray-400" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FiMessageSquare className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-1">Select a conversation</h3>
              <p className="text-sm">Choose a user from the list to start replying</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
