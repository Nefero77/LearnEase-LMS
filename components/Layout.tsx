import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Role } from '../types';
import { AIService } from '../services/ai';

const { Link, useNavigate, useLocation } = ReactRouterDOM;

// Icons
const Icons = {
  BookOpen: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  MessageCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = StorageService.getCurrentUser();
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([
    { role: 'ai', text: 'Hi! I am your AI Learning Assistant. Ask me anything about your courses!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleLogout = () => {
    StorageService.logout();
    navigate('/');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const context = location.pathname.includes('course') ? "the current course material" : "general learning topics";
    const response = await AIService.chatWithTutor(userMsg, context);

    setIsTyping(false);
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl hover:text-indigo-100 transition">
              <Icons.BookOpen />
              <span>LearnEase</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/courses" className="hover:text-indigo-200 transition">Courses</Link>
              <Link to="/community" className="hover:text-indigo-200 transition">Community</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="hover:text-indigo-200 transition">Dashboard</Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 ml-4 pl-4 border-l border-indigo-500 hover:text-indigo-200 transition py-2">
                       <span className="text-sm font-medium">{user.name}</span>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {/* Dropdown with bridge for hover stability */}
                    <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                      <div className="bg-white rounded-md shadow-lg py-1 border border-slate-200">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">My Profile</Link>
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-indigo-200 transition">Login</Link>
                  <Link to="/register" className="bg-white text-indigo-600 px-4 py-2 rounded-md font-semibold hover:bg-indigo-50 transition shadow-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Icons.BookOpen /> LearnEase
            </h3>
            <p className="text-sm max-w-xs">Empowering education everywhere. Join our community of lifelong learners today.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Discover</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-white transition">All Courses</Link></li>
              <li><Link to="/community" className="hover:text-white transition">Community Forum</Link></li>
              <li><Link to="/resources" className="hover:text-white transition">Learning Resources</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/feedback" className="hover:text-white transition">Send Feedback</Link></li>
              <li><span className="cursor-not-allowed opacity-50">Help Center</span></li>
              <li><span className="cursor-not-allowed opacity-50">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; 2024 LearnEase LMS. All rights reserved.
        </div>
      </footer>

      {/* AI Chat Widget (Only for logged in users) */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {showChat && (
            <div className="mb-4 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col h-96">
              <div className="bg-indigo-600 p-3 text-white flex justify-between items-center">
                <span className="font-medium flex items-center gap-2">
                   ✨ AI Tutor
                </span>
                <button onClick={() => setShowChat(false)} className="hover:bg-indigo-700 p-1 rounded">
                  <Icons.X />
                </button>
              </div>
              <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-3">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-200 rounded-full px-3 py-1 text-xs text-slate-500 animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-grow px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-indigo-500 bg-white text-slate-900"
                />
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition">
                  <Icons.Send />
                </button>
              </form>
            </div>
          )}
          <button 
            onClick={() => setShowChat(!showChat)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-105"
          >
            <Icons.MessageCircle />
          </button>
        </div>
      )}
    </div>
  );
};