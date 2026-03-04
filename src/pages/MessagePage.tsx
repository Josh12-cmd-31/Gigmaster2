import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, User, Search, Phone, Video, Info, MessageSquare } from 'lucide-react';

export default function MessagePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock contacts for demo
    setContacts([
      { id: 1, name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online', lastMsg: 'I can start on that logo today!' },
      { id: 2, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=2', status: 'offline', lastMsg: 'The revisions are complete.' },
      { id: 3, name: 'Marcus Thorne', avatar: 'https://i.pravatar.cc/150?u=3', status: 'online', lastMsg: 'Thanks for the order!' },
    ]);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}`);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'chat') {
        setMessages(prev => [...prev, msg]);
      }
    };

    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    if (selectedUser && user) {
      fetch(`/api/messages/${user.id}/${selectedUser.id}`)
        .then(res => res.json())
        .then(data => setMessages(data));
    }
  }, [selectedUser, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser || !user) return;

    const msg = {
      type: 'chat',
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    ws.current?.send(JSON.stringify(msg));
    setContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-100px)]">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 h-full flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedUser(contact)}
                className={`w-full p-4 flex gap-3 hover:bg-slate-50 transition-colors border-l-4 ${
                  selectedUser?.id === contact.id ? 'border-primary bg-blue-50/30' : 'border-transparent'
                }`}
              >
                <div className="relative">
                  <img src={contact.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  {contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="text-left flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 text-sm">{contact.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">12:45 PM</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{contact.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-slate-50/30">
          {selectedUser ? (
            <>
              <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedUser.name}</h3>
                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <button className="hover:text-primary"><Phone className="w-5 h-5" /></button>
                  <button className="hover:text-primary"><Video className="w-5 h-5" /></button>
                  <button className="hover:text-primary"><Info className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${
                      msg.sender_id === user?.id 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      {msg.content}
                      <div className={`text-[10px] mt-1 font-bold uppercase opacity-60 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input 
                    type="text" 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-blue-900 transition-colors shadow-lg">
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10" />
              </div>
              <p className="font-bold">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
