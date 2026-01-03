import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const u = StorageService.getCurrentUser();
    if (u) {
      setUser(u);
      setFormData({ name: u.name, email: u.email, bio: u.bio || '', password: u.password || '' });
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser: User = {
        ...user,
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        password: formData.password
      };
      
      await StorageService.updateUser(updatedUser);
      setUser(updatedUser);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!user) return <div className="p-8">Please login to view profile.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold">My Profile</h1>
           <p className="text-indigo-100 opacity-90">Manage your account settings</p>
        </div>
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-700 text-2xl font-bold uppercase shadow-lg">
          {user.name.charAt(0)}
        </div>
      </div>
      
      <div className="p-8">
        {message && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-6 text-sm">{message}</div>}
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" required className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" required className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Role</label>
            <input type="text" disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded px-3 py-2" value={user.role} />
            <p className="text-xs text-slate-400 mt-1">Role cannot be changed.</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Bio / About Me</label>
             <textarea className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24 bg-white text-slate-900" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell us a bit about yourself..."></textarea>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">Security</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition font-medium shadow-sm">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};