export enum Role {
  LEARNER = 'LEARNER',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  joinedDate: string;
  bio?: string;
}

export interface Module {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  content: string;
  duration?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  thumbnail: string;
  category: string;
  mode: 'SELF_PACED' | 'INSTRUCTOR_LED';
  modules: Module[];
  quizzes: Quiz[];
  studentsEnrolled: string[];
}

export interface Enrollment {
  userId: string;
  courseId: string;
  progress: number;
  completedModules: string[];
  quizScores: Record<string, number>;
}

export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  courseId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  message: string;
  date: string;
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  title: string;
  content: string;
  likes: number;
  date: string;
  category: string;
  replies: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    date: string;
  }[];
}
