import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { AIService } from '../services/ai';
import { User, Course, Role } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const currentUser = StorageService.getCurrentUser();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setUsers(await StorageService.getUsers());
    setInstructors(await StorageService.getInstructors());
    setCourses(await StorageService.getCourses());
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure? This cannot be undone.')) {
      await StorageService.deleteUser(id);
      refreshData();
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await StorageService.deleteCourse(id);
      refreshData();
    }
  };

  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsEditingCourse(true);
  };

  const handleCreateCourse = () => {
    setCurrentCourse({
      title: '',
      description: '',
      category: 'Development',
      mode: 'INSTRUCTOR_LED',
      thumbnail: `https://picsum.photos/400/225?random=${Math.floor(Math.random() * 100)}`,
      instructorId: currentUser?.id,
      instructorName: currentUser?.name,
      modules: [],
      quizzes: [],
      studentsEnrolled: []
    });
    setIsEditingCourse(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCourse.title && currentCourse.description && currentCourse.instructorId) {
      const instructor = users.find(u => u.id === currentCourse.instructorId);
      
      const courseToSave = {
        ...currentCourse,
        id: currentCourse.id || undefined,
        instructorName: instructor?.name || currentCourse.instructorName,
        modules: currentCourse.modules || [],
        quizzes: currentCourse.quizzes || [],
        studentsEnrolled: currentCourse.studentsEnrolled || []
      } as Course;

      await StorageService.saveCourse(courseToSave);
      setIsEditingCourse(false);
      refreshData();
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const generateAIDescription = async () => {
    if (!currentCourse.title) {
      alert("Please enter a title first.");
      return;
    }
    setAiLoading(true);
    const desc = await AIService.generateCourseDescription(currentCourse.title!, currentCourse.category || 'General');
    setCurrentCourse(prev => ({ ...prev, description: desc }));
    setAiLoading(false);
  };

  const data = [
    { name: 'Learners', count: users.filter(u => u.role === Role.LEARNER).length },
    { name: 'Instructors', count: users.filter(u => u.role === Role.INSTRUCTOR).length },
    { name: 'Admins', count: users.filter(u => u.role === Role.ADMIN).length },
    { name: 'Courses', count: courses.length },
  ];

  if (isEditingCourse) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{currentCourse.id ? 'Edit Course' : 'Create New Course'}</h2>
          <button onClick={() => setIsEditingCourse(false)} className="text-slate-500 hover:text-slate-700">Cancel</button>
        </div>
        <form onSubmit={handleSaveCourse} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Course Title</label>
                <input 
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" 
                  value={currentCourse.title || ''} 
                  onChange={e => setCurrentCourse({...currentCourse, title: e.target.value})} 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select 
                    className="w-full border border-slate-300 p-2 rounded bg-white text-slate-900"
                    value={currentCourse.category}
                    onChange={e => setCurrentCourse({...currentCourse, category: e.target.value})}
                  >
                    <option>Development</option>
                    <option>Business</option>
                    <option>Design</option>
                    <option>Data Science</option>
                    <option>Marketing</option>
                    <option>Cybersecurity</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Learning Mode</label>
                  <select 
                    className="w-full border border-slate-300 p-2 rounded bg-white text-slate-900"
                    value={currentCourse.mode}
                    onChange={e => setCurrentCourse({...currentCourse, mode: e.target.value as any})}
                  >
                    <option value="INSTRUCTOR_LED">Instructor Led</option>
                    <option value="SELF_PACED">Self Paced</option>
                  </select>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700">Assigned Instructor</label>
                 <select 
                    className="w-full border border-slate-300 p-2 rounded bg-white text-slate-900"
                    value={currentCourse.instructorId}
                    onChange={e => setCurrentCourse({...currentCourse, instructorId: e.target.value})}
                    required
                 >
                   <option value="">Select Instructor</option>
                   {instructors.map(inst => (
                     <option key={inst.id} value={inst.id}>{inst.name} ({inst.email})</option>
                   ))}
                   {currentUser && !instructors.find(i => i.id === currentUser.id) && (
                      <option value={currentUser.id}>{currentUser.name} (Me)</option>
                   )}
                 </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 flex justify-between">
                  <span>Description</span>
                  <button 
                    type="button" 
                    onClick={generateAIDescription}
                    disabled={aiLoading}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                     {aiLoading ? 'Generating...' : '✨ Generate with AI'}
                  </button>
                </label>
                <textarea 
                  className="w-full border border-slate-300 p-2 rounded h-32 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" 
                  value={currentCourse.description || ''} 
                  onChange={e => setCurrentCourse({...currentCourse, description: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Thumbnail URL</label>
                <input 
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" 
                  value={currentCourse.thumbnail || ''} 
                  onChange={e => setCurrentCourse({...currentCourse, thumbnail: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
             <button type="button" onClick={() => setIsEditingCourse(false)} className="px-4 py-2 border rounded hover:bg-slate-50">Cancel</button>
             <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Course</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">System overview and resource management</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'overview' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'users' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Users</button>
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'courses' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Courses</button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-lg mb-6 text-slate-800">Platform Metrics</h3>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data}>
                   <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                   <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={50} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-800">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Backend API</span>
                 <span className="font-mono text-sm">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.role}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50" disabled={user.role === Role.ADMIN}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Course Management</h3>
            <button onClick={handleCreateCourse} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">+ Create Course</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr><th className="p-4">Title</th><th className="p-4">Instructor</th><th className="p-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map(course => (
                    <tr key={course.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">{course.title}</td>
                      <td className="p-4">{course.instructorName}</td>
                      <td className="p-4 text-right space-x-3">
                        <button onClick={() => handleEditCourse(course)} className="text-indigo-600 hover:text-indigo-800 text-sm">Edit</button>
                        <button onClick={() => handleDeleteCourse(course.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};