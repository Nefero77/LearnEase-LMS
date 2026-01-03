import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Course, Enrollment, Module, Quiz } from '../types';

const { useParams, useNavigate, Link } = ReactRouterDOM;

export const CourseViewer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const user = StorageService.getCurrentUser();
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [enrollment, setEnrollment] = useState<Enrollment | undefined>(undefined);
  const [activeModule, setActiveModule] = useState<Module | undefined>(undefined);
  const [showCompletion, setShowCompletion] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgContent, setMsgContent] = useState('');

  const [quizState, setQuizState] = useState<{
    answers: Record<string, number>;
    submitted: boolean;
    score: number;
  }>({ answers: {}, submitted: false, score: 0 });

  useEffect(() => {
    if (!user || !courseId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
        try {
          const c = await StorageService.getCourseById(courseId);
          if (c) {
              setCourse(c);
              const enrollments = await StorageService.getEnrollments(user.id);
              const enr = enrollments.find(e => e.courseId === courseId);
              
              if (enr) {
                  setEnrollment(enr);
                  if (c.modules.length > 0) {
                      const firstUnfinished = c.modules.find(m => !enr.completedModules.includes(m.id));
                      if (!firstUnfinished && enr.progress === 100) {
                          setShowCompletion(true);
                          setActiveModule(c.modules[0]); 
                      } else {
                          setActiveModule(firstUnfinished || c.modules[0]);
                      }
                  }
              } else {
                  navigate('/courses');
              }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
    };
    fetchData();
  }, [courseId, user, navigate]);

  const handleModuleComplete = async () => {
    if (!enrollment || !activeModule || !course || !user) return;

    let newCompleted = [...enrollment.completedModules];
    if (!newCompleted.includes(activeModule.id)) {
      newCompleted.push(activeModule.id);
    }

    const progress = Math.round((newCompleted.length / course.modules.length) * 100);

    const updatedEnrollment = {
      ...enrollment,
      completedModules: newCompleted,
      progress
    };

    await StorageService.updateEnrollment(updatedEnrollment);
    setEnrollment(updatedEnrollment);
    
    const idx = course.modules.findIndex(m => m.id === activeModule.id);
    if (idx < course.modules.length - 1) {
      setActiveModule(course.modules[idx + 1]);
      setQuizState({ answers: {}, submitted: false, score: 0 });
    } else {
      setShowCompletion(true);
    }
  };

  const submitQuiz = (quiz: Quiz) => {
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (quizState.answers[q.id] === q.correctIndex) correctCount++;
    });
    
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    setQuizState(prev => ({ ...prev, submitted: true, score }));
    
    if (score >= 50) {
      handleModuleComplete();
    }
  };

  const handleSendMessage = async () => {
    if (!course || !user || !msgContent.trim()) return;
    await StorageService.sendMessage({
      fromId: user.id,
      fromName: user.name,
      toId: course.instructorId,
      courseId: course.id,
      content: msgContent
    });
    setMsgContent('');
    setShowMsgModal(false);
    alert('Message sent to instructor!');
  };

  if (loading) return <div className="p-8">Loading course content...</div>;
  if (!course) return <div className="p-8">Course not found.</div>;
  
  // Handle empty course
  if (!activeModule || course.modules.length === 0) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Content Available Yet</h2>
        <p className="text-slate-600 mb-6">The instructor hasn't added any modules to this course yet. Please check back later.</p>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative z-0">
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 flex flex-col gap-2">
          <Link to="/dashboard" className="w-full bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium hover:bg-slate-50 text-center">Back to Dashboard</Link>
          <h2 className="font-bold text-slate-800 text-sm leading-tight">{course.title}</h2>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${enrollment?.progress}%` }}></div>
          </div>
          <p className="text-xs text-slate-500">{enrollment?.progress}% Complete</p>
        </div>
        <div className="flex-grow overflow-y-auto">
          {course.modules.map((mod, idx) => (
            <button
              type="button"
              key={mod.id}
              onClick={() => {
                setShowCompletion(false);
                setActiveModule(mod);
                setQuizState({ answers: {}, submitted: false, score: 0 });
              }}
              className={`w-full text-left p-4 text-sm flex items-center justify-between hover:bg-slate-100 border-b border-slate-100 ${activeModule.id === mod.id && !showCompletion ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600'}`}
            >
              <div className="flex items-center gap-2"><span className="text-xs text-slate-400 font-mono">{idx + 1}.</span>{mod.title}</div>
              {enrollment?.completedModules.includes(mod.id) && <span className="text-green-500">✓</span>}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200">
          <button onClick={() => setShowMsgModal(true)} className="w-full py-2 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded">Ask Instructor</button>
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-y-auto p-8 relative">
        {showCompletion ? (
           <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-sm">✓</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Congratulations, {user?.name.split(' ')[0]}!</h2>
              <p className="text-lg text-slate-600 mb-8 max-w-md">You have successfully completed <strong>{course.title}</strong>.</p>
              <div className="flex gap-4">
                 <Link to="/" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Return to Homepage</Link>
                 <button onClick={() => { setShowCompletion(false); setActiveModule(course.modules[0]); }} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg">Review Course</button>
              </div>
           </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">{activeModule.title}</h1>
            {activeModule.type === 'video' && (
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-6 shadow-md">
                <iframe width="100%" height="100%" src={activeModule.content} title={activeModule.title} className="border-0" allowFullScreen></iframe>
              </div>
            )}
            {activeModule.type === 'text' && (
              <div className="prose prose-slate max-w-none mb-6 text-slate-700 leading-relaxed"><p>{activeModule.content}</p></div>
            )}
            {activeModule.type === 'quiz' && (() => {
              const quiz = course.quizzes.find(q => q.id === activeModule.content);
              if (!quiz) return <div>Quiz not found.</div>;
              return (
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h3 className="font-bold text-lg mb-4 text-indigo-700">Assessment: {quiz.title}</h3>
                  {quizState.submitted && (
                    <div className={`p-4 mb-4 rounded ${quizState.score >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      You scored {quizState.score}%. {quizState.score >= 50 ? 'Great job! Module completed.' : 'Try again to proceed.'}
                    </div>
                  )}
                  <div className="space-y-6">
                    {quiz.questions.map((q, qIdx) => (
                      <div key={q.id}>
                        <p className="font-medium text-slate-800 mb-2">{qIdx + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => (
                            <label key={oIdx} className={`flex items-center p-3 rounded border cursor-pointer transition ${
                              quizState.submitted && q.correctIndex === oIdx ? 'bg-green-50 border-green-300 ring-1 ring-green-500' :
                              quizState.submitted && quizState.answers[q.id] === oIdx && q.correctIndex !== oIdx ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200 hover:border-indigo-300'
                            }`}>
                              <input type="radio" name={q.id} value={oIdx} disabled={quizState.submitted} checked={quizState.answers[q.id] === oIdx} onChange={() => setQuizState(prev => ({ ...prev, answers: { ...prev.answers, [q.id]: oIdx } }))} className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                              <span className="ml-2 text-sm text-slate-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!quizState.submitted && (
                    <button onClick={() => submitQuiz(quiz)} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition">Submit Answers</button>
                  )}
                </div>
              );
            })()}
            <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
               <button disabled={course.modules[0].id === activeModule.id} onClick={() => { const idx = course.modules.findIndex(m => m.id === activeModule.id); if (idx > 0) setActiveModule(course.modules[idx - 1]); }} className="px-4 py-2 text-slate-500 hover:text-slate-800 disabled:opacity-50">&larr; Previous</button>
               {activeModule.type !== 'quiz' && (
                 <button onClick={handleModuleComplete} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 shadow-sm">
                   {enrollment.completedModules.length >= course.modules.length - 1 ? 'Finish Course' : 'Mark as Complete & Next'} &rarr;
                 </button>
               )}
            </div>
          </div>
        )}
      </div>

      {showMsgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Ask Instructor</h3>
            <textarea className="w-full border border-slate-300 rounded p-3 h-32 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900" placeholder="What are you struggling with?" value={msgContent} onChange={e => setMsgContent(e.target.value)}></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowMsgModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded">Cancel</button>
              <button onClick={handleSendMessage} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};