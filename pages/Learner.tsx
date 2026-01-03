import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { User, Course, Enrollment, Message } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

const { Link, useNavigate } = ReactRouterDOM;

export const LearnerDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'learning' | 'messages'>('learning');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
        const userEnrollments = await StorageService.getEnrollments(user.id);
        const allCourses = await StorageService.getCourses();
        const msgs = await StorageService.getMessages(user.id);

        setEnrollments(userEnrollments);
        setCourses(allCourses.filter(c => userEnrollments.some(e => e.courseId === c.id)));
        setMessages(msgs);
    };
    fetchData();
  }, [user.id]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 mb-1">Learner Dashboard</h1>
           <p className="text-slate-500">Welcome back, {user.name}!</p>
        </div>
        <Link to="/courses" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium">
           + Enroll in New Course
        </Link>
      </div>

      <div className="flex gap-6 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('learning')}
          className={`pb-3 px-1 font-medium transition ${activeTab === 'learning' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Learning
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-1 font-medium transition ${activeTab === 'messages' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Messages
        </button>
      </div>

      {activeTab === 'learning' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => {
             const enrollment = enrollments.find(e => e.courseId === course.id);
             return (
               <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col">
                 <div className="h-40 bg-slate-200">
                   <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                 </div>
                 <div className="p-5 flex-grow flex flex-col">
                   <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                   <p className="text-sm text-slate-500 mb-4">{course.instructorName}</p>
                   
                   <div className="mb-4 mt-auto">
                     <div className="flex justify-between text-xs text-slate-600 mb-1">
                       <span>Progress</span>
                       <span>{enrollment?.progress}%</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2">
                       <div 
                         className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                         style={{ width: `${enrollment?.progress || 0}%` }}
                       ></div>
                     </div>
                   </div>

                   <button 
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className="w-full bg-indigo-50 text-indigo-700 py-2 rounded font-medium text-sm hover:bg-indigo-100 transition"
                   >
                     Continue Learning
                   </button>
                 </div>
               </div>
             );
          })}

          {courses.length === 0 && (
            <div className="col-span-full bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Start your journey!</h3>
              <p className="text-indigo-700 mb-4">You are not enrolled in any courses yet.</p>
              <Link to="/courses" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
           {messages.length > 0 ? messages.map(msg => (
              <div key={msg.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.fromId === user.id ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {msg.fromName.charAt(0)}
                       </div>
                       <div>
                          <span className="font-bold text-slate-800 text-sm block">{msg.fromName} {msg.fromId === user.id && '(Me)'}</span>
                          <span className="text-xs text-slate-500">
                             {msg.fromId === user.id ? 'Sent to Instructor' : 'Reply from Instructor'}
                          </span>
                       </div>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(msg.timestamp).toLocaleString()}</span>
                 </div>
                 <div className="mt-2 text-slate-700 text-sm pl-10">
                    {msg.content}
                 </div>
              </div>
           )) : (
              <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                You have no messages.
              </div>
           )}
        </div>
      )}
    </div>
  );
};