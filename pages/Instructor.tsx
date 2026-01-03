import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { AIService } from '../services/ai';
import { Course, User, Message, Enrollment, Module } from '../types';

export const InstructorDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'messages'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [aiLoading, setAiLoading] = useState(false);

  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourseForStats, setSelectedCourseForStats] = useState<Course | null>(null);
  const [enrolledStudentsData, setEnrolledStudentsData] = useState<{student: User, enrollment: Enrollment}[]>([]);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadCourses();
    loadMessages();
  }, []);

  const loadCourses = async () => {
    const all = await StorageService.getCourses();
    setCourses(all.filter(c => c.instructorId === user.id));
  };

  const loadMessages = async () => {
    const msgs = await StorageService.getMessages(user.id);
    setMessages(msgs.filter(m => m.toId === user.id));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await StorageService.deleteCourse(id);
      loadCourses();
    }
  };

  const handleEdit = (course: Course) => {
    setCurrentCourse(course);
    setIsEditing(true);
  };

  const handleViewStudents = async (course: Course) => {
    const enrollments = await StorageService.getCourseEnrollments(course.id);
    const data: {student: User, enrollment: Enrollment}[] = [];
    
    for (const e of enrollments) {
        const student = await StorageService.getUserById(e.userId);
        if (student) data.push({ student, enrollment: e });
    }
    
    setEnrolledStudentsData(data);
    setSelectedCourseForStats(course);
    setShowStudentsModal(true);
  };

  const handleCreate = () => {
    setCurrentCourse({
      title: '',
      description: '',
      category: 'Development',
      mode: 'INSTRUCTOR_LED', 
      thumbnail: `https://picsum.photos/400/225?random=${Math.floor(Math.random() * 100)}`,
      instructorId: user.id,
      instructorName: user.name,
      modules: [],
      quizzes: [],
      studentsEnrolled: []
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCourse.title && currentCourse.description) {
      // Basic check to encourage content
      if (!currentCourse.modules || currentCourse.modules.length === 0) {
        if(!confirm("Warning: This course has no modules. Students will see an empty course. Save anyway?")) {
            return;
        }
      }

      const courseToSave = {
        ...currentCourse,
        id: currentCourse.id || undefined, // Allow backend to gen ID if new
        instructorId: user.id,
        instructorName: user.name,
        modules: currentCourse.modules || [],
        quizzes: currentCourse.quizzes || [],
        studentsEnrolled: currentCourse.studentsEnrolled || []
      } as Course;

      await StorageService.saveCourse(courseToSave);
      setIsEditing(false);
      loadCourses();
    }
  };

  const handleSendReply = async () => {
    if (!replyingTo || !replyContent.trim()) return;

    await StorageService.sendMessage({
      fromId: user.id,
      fromName: user.name,
      toId: replyingTo.fromId,
      courseId: replyingTo.courseId,
      content: replyContent
    });
    
    setReplyingTo(null);
    setReplyContent('');
    alert('Reply sent successfully.');
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

  // Module Management Helpers
  const handleAddModule = () => {
    const newModule: Module = {
        id: `m${Date.now()}`,
        title: 'New Module',
        type: 'text',
        content: ''
    };
    setCurrentCourse(prev => ({
        ...prev,
        modules: [...(prev.modules || []), newModule]
    }));
  };

  const handleUpdateModule = (index: number, field: keyof Module, value: string) => {
    const updatedModules = [...(currentCourse.modules || [])];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setCurrentCourse(prev => ({ ...prev, modules: updatedModules }));
  };

  const handleDeleteModule = (index: number) => {
    const updatedModules = [...(currentCourse.modules || [])];
    updatedModules.splice(index, 1);
    setCurrentCourse(prev => ({ ...prev, modules: updatedModules }));
  };

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{currentCourse.id ? 'Edit Course' : 'Create New Course'}</h2>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700">Cancel</button>
        </div>
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Course Title</label>
                <input 
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900" 
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
                  className="w-full border border-slate-300 p-2 rounded h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900" 
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
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900" 
                  value={currentCourse.thumbnail || ''} 
                  onChange={e => setCurrentCourse({...currentCourse, thumbnail: e.target.value})}
                />
                {currentCourse.thumbnail && (
                  <img src={currentCourse.thumbnail} alt="Preview" className="mt-2 h-32 w-full object-cover rounded bg-slate-100" />
                )}
              </div>
            </div>
          </div>

          {/* Module Editor */}
          <div className="border-t border-slate-200 pt-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-800">Course Modules</h3>
               <button type="button" onClick={handleAddModule} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100 font-medium">+ Add Module</button>
             </div>
             
             <div className="space-y-4">
                {currentCourse.modules && currentCourse.modules.length > 0 ? (
                    currentCourse.modules.map((mod, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                           <div className="flex gap-4 mb-2">
                              <div className="flex-grow">
                                 <label className="block text-xs font-semibold text-slate-500 mb-1">Module Title</label>
                                 <input 
                                   className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white" 
                                   value={mod.title}
                                   onChange={e => handleUpdateModule(idx, 'title', e.target.value)}
                                   placeholder="e.g. Introduction to CSS"
                                 />
                              </div>
                              <div className="w-1/3">
                                 <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                                 <select 
                                   className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                                   value={mod.type}
                                   onChange={e => handleUpdateModule(idx, 'type', e.target.value)}
                                 >
                                    <option value="text">Text Lesson</option>
                                    <option value="video">Video (Embed URL)</option>
                                    <option value="quiz">Quiz (ID)</option>
                                 </select>
                              </div>
                              <div className="flex items-end">
                                 <button type="button" onClick={() => handleDeleteModule(idx)} className="text-red-500 hover:text-red-700 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                 </button>
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1">Content / URL</label>
                              {mod.type === 'text' ? (
                                  <textarea 
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm h-20 bg-white"
                                    value={mod.content}
                                    onChange={e => handleUpdateModule(idx, 'content', e.target.value)}
                                    placeholder="Enter lesson content..."
                                  />
                              ) : (
                                  <input 
                                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                                    value={mod.content}
                                    onChange={e => handleUpdateModule(idx, 'content', e.target.value)}
                                    placeholder={mod.type === 'video' ? 'e.g. https://www.youtube.com/embed/...' : 'Quiz ID'}
                                  />
                              )}
                           </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-slate-50 rounded border border-dashed border-slate-300 text-slate-500 text-sm">
                        No modules added yet. Click "Add Module" to start building your course.
                    </div>
                )}
             </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
             <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded hover:bg-slate-50">Cancel</button>
             <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Course</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Instructor Dashboard</h1>
           <p className="text-slate-500">Welcome, {user.name}</p>
        </div>
        <div className="flex gap-4">
           {activeTab === 'courses' && (
            <button onClick={handleCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
              + Create Course
            </button>
           )}
        </div>
      </div>

      <div className="flex gap-6 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-1 font-medium transition ${activeTab === 'courses' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Courses
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-1 font-medium transition ${activeTab === 'messages' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Student Messages
        </button>
      </div>

      {activeTab === 'courses' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">Course</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Category</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Mode</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Students</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{course.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{course.modules?.length || 0} Modules</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{course.category}</td>
                  <td className="p-4 text-sm">
                    {course.mode === 'INSTRUCTOR_LED' ? (
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">Instructor Led</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Self Paced</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{course.studentsEnrolled.length} enrolled</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleViewStudents(course)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-2">Students</button>
                    <button onClick={() => handleEdit(course)} className="text-slate-600 hover:text-slate-800 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(course.id)} className="text-red-500 hover:text-red-700 text-sm font-medium ml-2">Delete</button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    You haven't created any courses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => {
            const course = courses.find(c => c.id === msg.courseId);
            return (
              <div key={msg.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="font-bold text-slate-800">{msg.fromName}</span>
                      <span className="text-slate-400 text-xs">asked in</span>
                      <span className="text-indigo-600 text-sm font-medium">{course?.title || 'Unknown Course'}</span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 mt-2">
                    {msg.content}
                  </div>
                </div>
                <div className="flex items-center">
                  <button 
                    className="text-sm bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm"
                    onClick={() => setReplyingTo(msg)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
             <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
               No questions yet.
             </div>
          )}
        </div>
      )}

      {showStudentsModal && selectedCourseForStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800">Course Progress</h3>
                    <p className="text-slate-500 text-sm">{selectedCourseForStats.title}</p>
                 </div>
                 <button onClick={() => setShowStudentsModal(false)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                       <tr>
                          <th className="p-4 border-b border-slate-200">Student Name</th>
                          <th className="p-4 border-b border-slate-200">Email</th>
                          <th className="p-4 border-b border-slate-200 w-1/3">Progress</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                       {enrolledStudentsData.map(({ student, enrollment }) => (
                         <tr key={student.id} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-800">{student.name}</td>
                            <td className="p-4 text-slate-600">{student.email}</td>
                            <td className="p-4">
                               <div className="flex items-center gap-3">
                                  <div className="flex-grow bg-slate-200 rounded-full h-2">
                                     <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-700 w-8">{enrollment.progress}%</span>
                               </div>
                            </td>
                         </tr>
                       ))}
                       {enrolledStudentsData.length === 0 && (
                          <tr><td colSpan={3} className="p-8 text-center text-slate-500 italic">No students.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {replyingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reply to Student</h3>
            <textarea
               className="w-full border border-slate-300 rounded p-3 h-32 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
               placeholder="Type your reply here..."
               value={replyContent}
               onChange={e => setReplyContent(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
               <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded">Cancel</button>
               <button onClick={handleSendReply} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};