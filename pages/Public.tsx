import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Course, User, Role } from '../types';
import { LearnerDashboard } from './Learner';

const { Link, useNavigate } = ReactRouterDOM;

export const Home: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const currentUser = StorageService.getCurrentUser();

  useEffect(() => {
    // Get the first 3 courses to display as featured
    const loadData = async () => {
        const allCourses = await StorageService.getCourses();
        setFeaturedCourses(allCourses.slice(0, 3));
    };
    loadData();
  }, []);

  return (
    <div className="space-y-24 pb-12">
      {/* If Learner is logged in, show Dashboard Content at top */}
      {currentUser && currentUser.role === Role.LEARNER ? (
        <section className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-50 animate-fade-in-down">
          <LearnerDashboard user={currentUser} />
        </section>
      ) : (
        /* Standard Hero Section for Guests or other roles */
        <section className="text-center py-24 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-2xl relative overflow-hidden mx-2 md:mx-0">
          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="bg-white/10 text-indigo-50 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 inline-block backdrop-blur-sm border border-white/20">
              🚀 Launch your career today
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Unlock Your Potential with <span className="text-indigo-200">LearnEase</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Whether you want to learn at your own pace or join a live cohort, we have the tools, community, and expert mentorship you need.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {currentUser ? (
                <Link to="/dashboard" className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-xl hover:bg-indigo-50 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register" className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-xl hover:bg-indigo-50 transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  Start Learning for Free
                </Link>
              )}
              <Link to="/courses" className="px-8 py-4 bg-indigo-800/40 text-white font-bold rounded-xl border border-indigo-400/30 hover:bg-indigo-800/60 transition backdrop-blur-sm flex items-center justify-center gap-2">
                Explore Courses
              </Link>
            </div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        </section>
      )}

      {/* Features Grid - "Stuff" */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-800">Why Choose LearnEase?</h2>
          <p className="text-slate-500 mt-3 text-lg">We provide a comprehensive ecosystem for your growth.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Diverse Course Catalog</h3>
            <p className="text-slate-600 leading-relaxed">From coding to design, marketing to finance. Access high-quality content created by industry experts.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Community Driven</h3>
            <p className="text-slate-600 leading-relaxed">Join discussion forums, find study buddies, and get direct feedback from instructors on your work.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">AI-Powered Tutoring</h3>
            <p className="text-slate-600 leading-relaxed">Stuck on a problem? Our integrated AI tutor provides instant guidance to help you keep moving forward.</p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="bg-slate-100 py-20 -mx-4 md:-mx-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Featured Courses</h2>
              <p className="text-slate-600 mt-2 text-lg">Start with our most popular learning paths.</p>
            </div>
            <Link to="/courses" className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-2 group">
              View Full Catalog <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group">
                <div className="h-48 overflow-hidden relative">
                   <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-indigo-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                     {course.category}
                   </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">{course.description}</p>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {course.instructorName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{course.instructorName}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      course.mode === 'INSTRUCTOR_LED' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {course.mode === 'INSTRUCTOR_LED' ? 'Live' : 'Self-Paced'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-4">
        <div>
          <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">About Us</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-2 mb-6">Democratizing Education for Everyone</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            We aim to bridge the gap between traditional learning and modern digital needs. Our platform is designed to be accessible, engaging, and effective for everyone—from students to professionals.
          </p>
          <ul className="space-y-4">
            {[
              "Accessible on all mobile & desktop devices",
              "Certification upon course completion",
              "Real-world projects and assessments"
            ].map((item, i) => (
              <li key={i} className="flex items-center text-slate-700 font-medium">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition duration-500">
             <img src="https://picsum.photos/800/600?random=10" alt="Students learning" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-900 rounded-3xl p-12 text-center text-white mx-2 md:mx-0">
        <h2 className="text-3xl font-bold mb-4">Ready to start your journey?</h2>
        <p className="text-indigo-200 mb-8 max-w-xl mx-auto">Join thousands of learners who are already mastering new skills on LearnEase.</p>
        <Link to="/register" className="inline-block bg-white text-indigo-900 font-bold px-10 py-4 rounded-xl shadow-lg hover:bg-indigo-50 transition">
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export const CourseCatalog: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'courses' | 'instructors'>('courses');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'SELF_PACED' | 'INSTRUCTOR_LED'>('ALL');
  
  const navigate = useNavigate();
  const currentUser = StorageService.getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
        setCourses(await StorageService.getCourses());
        setInstructors(await StorageService.getInstructors());
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.category.toLowerCase().includes(search.toLowerCase());
    const matchesMode = modeFilter === 'ALL' || c.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await StorageService.enroll(currentUser.id, courseId);
    navigate(`/learn/${courseId}`);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Learning Catalog</h2>
          <p className="text-slate-500 mt-1">Explore our diverse range of topics and expert instructors</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
           <div className="bg-slate-100 p-1 rounded-lg flex">
             <button onClick={() => setView('courses')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'courses' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Courses</button>
             <button onClick={() => setView('instructors')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'instructors' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Instructors</button>
           </div>
        </div>
      </div>

      {view === 'courses' ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full bg-white text-slate-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <select 
              className="bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
            >
              <option value="ALL">All Modes</option>
              <option value="SELF_PACED">Self-Paced Learning</option>
              <option value="INSTRUCTOR_LED">Instructor-Led</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-slate-100 flex flex-col relative group">
                <div className="absolute top-3 right-3 z-10">
                   {course.mode === 'INSTRUCTOR_LED' ? (
                     <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-purple-200">
                       Instructor Led
                     </span>
                   ) : (
                     <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-green-200">
                       Self Paced
                     </span>
                   )}
                </div>
                <div className="h-48 overflow-hidden bg-slate-200">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition hover:scale-105 duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit mb-2">{course.category}</span>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition">{course.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">{course.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                         {course.instructorName.charAt(0)}
                       </div>
                       <div className="text-sm text-slate-500">
                         <span className="font-medium text-slate-700">{course.instructorName}</span>
                       </div>
                    </div>
                    <button onClick={() => handleEnroll(course.id)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                      Enroll &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCourses.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                No courses found matching your criteria.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map(inst => {
            const instCourses = courses.filter(c => c.instructorId === inst.id);
            return (
              <div key={inst.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 text-xl font-bold shadow-inner">
                    {inst.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{inst.name}</h3>
                    <p className="text-sm text-slate-500">{instCourses.length} Active Courses</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-6 flex-grow">{inst.bio || 'Expert Instructor at LearnEase.'}</p>
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Available Courses</h4>
                  {instCourses.length > 0 ? (
                    <ul className="space-y-2">
                      {instCourses.map(c => (
                        <li key={c.id} className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer flex justify-between items-center" onClick={() => handleEnroll(c.id)}>
                          <span>{c.title}</span>
                          <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{c.mode === 'SELF_PACED' ? 'Self' : 'Live'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No active courses.</p>
                  )}
                </div>
                <button className="mt-4 w-full border border-indigo-200 text-indigo-600 py-2 rounded text-sm hover:bg-indigo-50 transition">
                  View Profile
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};