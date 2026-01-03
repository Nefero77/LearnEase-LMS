import { User, Course, Role, Enrollment, Message, FeedbackItem, ForumPost } from '../types';

const API_URL = 'http://127.0.0.1:5001/api';
const KEYS = { CURRENT_USER: 'learnease_current_user' };

// Helper for Fetch
const api = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error ${res.status}: ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    throw error;
  }
};

export const StorageService = {
  // --- System ---
  seed: async () => {
    return await api('/seed', { method: 'POST' });
  },

  // --- Auth & Users ---
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const user = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    } catch (e) {
      console.error('Login Service Error:', e);
      localStorage.removeItem(KEYS.CURRENT_USER); // Clear potentially stale data
      return null;
    }
  },
  
  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  // Synchronous getter for UI state, assumes session validity checked by App
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },

  // NEW: Validate user session against the DB
  validateSession: async (): Promise<boolean> => {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    if (!u) return false;
    
    try {
      const user = JSON.parse(u);
      // Hit the specific ID endpoint to verify existence
      await api(`/users/${user.id}`);
      return true;
    } catch (e) {
      // If 404 or error, session is invalid
      localStorage.removeItem(KEYS.CURRENT_USER);
      return false;
    }
  },

  register: async (user: Omit<User, 'id' | 'joinedDate'>): Promise<User> => {
    const newUser = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    return newUser;
  },

  updateUser: async (user: User) => {
    await api(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
    // Update local cache to reflect changes
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getUsers: async (): Promise<User[]> => {
    return await api('/users');
  },
  
  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      // Strict DB Fetch
      return await api(`/users/${id}`);
    } catch (e) {
      console.warn(`User ${id} not found in DB`);
      return undefined;
    }
  },

  getInstructors: async (): Promise<User[]> => {
    const users = await api('/users');
    return users.filter((u: User) => u.role === Role.INSTRUCTOR);
  },

  deleteUser: async (id: string) => {
    await api(`/users/${id}`, { method: 'DELETE' });
  },

  // --- Courses ---
  getCourses: async (): Promise<Course[]> => {
    return await api('/courses');
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    try {
      return await api(`/courses/${id}`);
    } catch { return undefined; }
  },

  saveCourse: async (course: Course) => {
    if (course.id && !course.id.startsWith('new')) {
      return await api(`/courses/${course.id}`, {
        method: 'PUT',
        body: JSON.stringify(course)
      });
    } else {
      const { id, ...rest } = course; // Remove temp ID
      return await api('/courses', {
        method: 'POST',
        body: JSON.stringify(rest)
      });
    }
  },

  deleteCourse: async (id: string) => {
    await api(`/courses/${id}`, { method: 'DELETE' });
  },

  // --- Enrollments ---
  getEnrollments: async (userId: string): Promise<Enrollment[]> => {
    return await api(`/enrollments?userId=${userId}`);
  },

  getCourseEnrollments: async (courseId: string): Promise<Enrollment[]> => {
    return await api(`/enrollments?courseId=${courseId}`);
  },

  enroll: async (userId: string, courseId: string) => {
    await api('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ 
        userId, 
        courseId, 
        progress: 0, 
        completedModules: [], 
        quizScores: {} 
      })
    });
  },

  updateEnrollment: async (enrollment: Enrollment) => {
    await api('/enrollments', {
      method: 'PUT',
      body: JSON.stringify(enrollment)
    });
  },

  // --- Messages ---
  getMessages: async (userId: string): Promise<Message[]> => {
    return await api(`/messages?userId=${userId}`);
  },

  sendMessage: async (msg: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    await api('/messages', {
      method: 'POST',
      body: JSON.stringify(msg)
    });
  },

  // --- Feedback ---
  addFeedback: async (fb: Omit<FeedbackItem, 'id' | 'date'>) => {
    await api('/feedback', {
      method: 'POST',
      body: JSON.stringify(fb)
    });
  },

  // --- Forum ---
  getForumPosts: async (): Promise<ForumPost[]> => {
    return await api('/forum');
  },

  addForumPost: async (post: Omit<ForumPost, 'id' | 'date' | 'likes' | 'replies'>) => {
    await api('/forum', {
      method: 'POST',
      body: JSON.stringify(post)
    });
  },

  likePost: async (postId: string) => {
    await api(`/forum/${postId}/like`, { method: 'POST' });
  },

  replyToPost: async (postId: string, reply: {userId: string, userName: string, content: string}) => {
    await api(`/forum/${postId}/reply`, {
      method: 'POST',
      body: JSON.stringify(reply)
    });
  }
};