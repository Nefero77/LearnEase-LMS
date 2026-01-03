import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['LEARNER', 'INSTRUCTOR', 'ADMIN'], default: 'LEARNER' },
  joinedDate: { type: String },
  bio: String
});

const moduleSchema = new mongoose.Schema({
  id: String, // Keep string ID for frontend compatibility
  title: String,
  type: { type: String, enum: ['video', 'text', 'quiz'] },
  content: String,
  duration: String
});

const quizQuestionSchema = new mongoose.Schema({
  id: String,
  question: String,
  options: [String],
  correctIndex: Number
});

const quizSchema = new mongoose.Schema({
  id: String,
  title: String,
  questions: [quizQuestionSchema]
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructorId: String,
  instructorName: String,
  thumbnail: String,
  category: String,
  mode: { type: String, enum: ['SELF_PACED', 'INSTRUCTOR_LED'] },
  modules: [moduleSchema],
  quizzes: [quizSchema],
  studentsEnrolled: [String]
});

const enrollmentSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  progress: Number,
  completedModules: [String],
  quizScores: { type: Map, of: Number }
});

const messageSchema = new mongoose.Schema({
  fromId: String,
  fromName: String,
  toId: String,
  courseId: String,
  content: String,
  timestamp: String,
  read: Boolean
});

const replySchema = new mongoose.Schema({
  id: String,
  userId: String,
  userName: String,
  content: String,
  date: String
});

const forumPostSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userRole: String,
  title: String,
  content: String,
  likes: { type: Number, default: 0 },
  date: String,
  category: String,
  replies: [replySchema]
});

const feedbackSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  rating: Number,
  message: String,
  date: String
});

export const User = mongoose.model('User', userSchema);
export const Course = mongoose.model('Course', courseSchema);
export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export const Message = mongoose.model('Message', messageSchema);
export const ForumPost = mongoose.model('ForumPost', forumPostSchema);
export const Feedback = mongoose.model('Feedback', feedbackSchema);