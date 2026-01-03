import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Role } from '../types';

const { useNavigate, Link } = ReactRouterDOM;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const user = await StorageService.login(email, password);
    setLoading(false);
    
    if (user) {
      if (user.role === Role.LEARNER) {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100 mt-12">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Welcome Back</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input 
            type="email" 
            required 
            className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            required 
            className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register here</Link>
      </p>
      
      <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
        <p className="mb-2 font-semibold">Default Credentials:</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <span>Student: student@learnease.com</span><span>Pass: password</span>
          <span>Instructor: instructor@learnease.com</span><span>Pass: password</span>
          <span>Admin: admin@learnease.com</span><span>Pass: password</span>
        </div>
      </div>
    </div>
  );
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: Role.LEARNER });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // 1. Register User in MongoDB
      await StorageService.register({ ...formData });
      
      // 2. Auto-login immediately to validate the new user against DB
      const user = await StorageService.login(formData.email, formData.password);
      
      if (!user) {
         throw new Error('Auto-login failed after registration.');
      }
      
      if (formData.role === Role.LEARNER) {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (e: any) {
      console.error(e);
      // Try to parse API error if available
      let msg = 'Registration failed. Email might be in use or server unavailable.';
      if (e.message && e.message.includes('API Error')) {
        msg = e.message;
      }
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100 mt-12">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Create Account</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input 
            type="text" required 
            className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input 
            type="email" required 
            className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" required 
            className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">I want to...</label>
          <select 
            className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value as Role})}
          >
            <option value={Role.LEARNER}>Learn new skills (Student)</option>
            <option value={Role.INSTRUCTOR}>Teach courses (Instructor)</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition mt-2 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};