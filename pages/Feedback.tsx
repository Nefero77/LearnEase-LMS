import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM;

export const Feedback: React.FC = () => {
  const user = StorageService.getCurrentUser();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    await StorageService.addFeedback({
      userId: user.id,
      userName: user.name,
      rating,
      message
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h2>
        <p className="text-slate-600 mb-6">Your feedback helps us make LearnEase better for everyone.</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium hover:underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">We value your feedback</h1>
      <p className="text-slate-500 mb-8">Tell us about your experience with LearnEase. Reported issues and suggestions are reviewed daily.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">How would you rate your experience?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-full transition transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
              >
                <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
          <textarea required rows={5} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900" placeholder="What do you like? What can we improve?" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
        </div>

        <button type="submit" disabled={rating === 0 || !message} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Submit Feedback</button>
      </form>
    </div>
  );
};