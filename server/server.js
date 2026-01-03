import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { User, Course, Enrollment, Message, ForumPost, Feedback } from './models.js';

const app = express();
// Using port 5001 to avoid conflicts with AirPlay/ControlCenter on macOS which often claim 5000
const PORT = process.env.PORT || 5001;
// Allow overriding the URI via environment variable, otherwise default to local
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnease';

app.use(cors());
app.use(express.json());

// Connect to MongoDB with better error logging
console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);
mongoose.connect(MONGO_URI)
  .then((c) => {
    console.log(`✅ MongoDB Connected Successfully to database: ${c.connection.name}`);
    // Trigger Auto-Seed Check
    initializeDatabase();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('Hint: Ensure mongod is running on port 27017 or update MONGO_URI.');
  });

// --- Database Initialization Logic ---
const initializeDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database appears empty. Auto-seeding with initial data...');
      await seedData();
      console.log('✅ Auto-seed complete. Default users created.');
    } else {
      console.log(`📊 Database ready. ${userCount} users found.`);
    }
  } catch (error) {
    console.error('Initialization failed:', error);
  }
};

const seedData = async () => {
  // Clear existing data to be safe (though usually called when empty)
  await User.deleteMany({});
  await Course.deleteMany({});
  await Enrollment.deleteMany({});
  await Message.deleteMany({});
  await ForumPost.deleteMany({});

  // Create IDs manually so we can link them
  const adminId = new mongoose.Types.ObjectId();
  const instructorId = new mongoose.Types.ObjectId();
  const studentId = new mongoose.Types.ObjectId();

  // Create Users
  const users = [
    { _id: adminId, name: 'Admin User', email: 'admin@learnease.com', password: 'password', role: 'ADMIN', joinedDate: '2023-01-01', bio: 'System Administrator' },
    { _id: instructorId, name: 'Jane Instructor', email: 'instructor@learnease.com', password: 'password', role: 'INSTRUCTOR', joinedDate: '2023-01-05', bio: 'Senior Web Developer & Teacher' },
    { _id: studentId, name: 'John Student', email: 'student@learnease.com', password: 'password', role: 'LEARNER', joinedDate: '2023-02-10', bio: 'Aspiring Developer' }
  ];
  
  await User.insertMany(users);
  
  // Create Courses
  const courses = [
    {
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, and Node.js from scratch. This comprehensive course takes you from absolute beginner to full-stack developer.',
      instructorId: instructorId.toString(),
      instructorName: 'Jane Instructor',
      thumbnail: 'https://picsum.photos/id/1/400/225',
      category: 'Development',
      mode: 'SELF_PACED',
      studentsEnrolled: [studentId.toString()],
      modules: [
          { id: 'm1', title: 'Introduction to HTML', type: 'text', content: 'HTML (HyperText Markup Language) is the most basic building block of the Web. It defines the meaning and structure of web content.' },
          { id: 'm2', title: 'HTML Structure', type: 'video', content: 'https://www.youtube.com/embed/k7I429DD-qY' },
          { id: 'm3', title: 'CSS Basics', type: 'text', content: 'CSS is the language we use to style an HTML document. CSS describes how HTML elements should be displayed.' },
          { id: 'm4', title: 'JavaScript Fundamentals', type: 'video', content: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
          { id: 'm5', title: 'Web Dev Quiz', type: 'quiz', content: 'q1' }
      ],
      quizzes: [
        {
          id: 'q1',
          title: 'HTML & CSS Basics',
          questions: [
            { id: 'qq1', question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correctIndex: 0 },
            { id: 'qq2', question: 'Which character is used to indicate an end tag?', options: ['<', '/', '*', '^'], correctIndex: 1 }
          ]
        }
      ]
    },
    {
      title: 'Advanced React Patterns',
      description: 'Master higher-order components, hooks, custom hooks, and the Context API to build scalable React applications.',
      instructorId: instructorId.toString(),
      instructorName: 'Jane Instructor',
      thumbnail: 'https://picsum.photos/id/20/400/225',
      category: 'Development',
      mode: 'INSTRUCTOR_LED',
      studentsEnrolled: [],
      modules: [
        { id: 'r1', title: 'Understanding Hooks', type: 'text', content: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components.' },
        { id: 'r2', title: 'useEffect Deep Dive', type: 'video', content: 'https://www.youtube.com/embed/dH6i3GurZV8' },
        { id: 'r3', title: 'Custom Hooks', type: 'text', content: 'Building your own Hooks lets you extract component logic into reusable functions.' },
        { id: 'r4', title: 'React Quiz', type: 'quiz', content: 'q2' }
      ],
      quizzes: [
        {
          id: 'q2',
          title: 'React Hooks Assessment',
          questions: [
            { id: 'rq1', question: 'Which hook is used for side effects?', options: ['useState', 'useEffect', 'useContext'], correctIndex: 1 },
            { id: 'rq2', question: 'Rules of Hooks: Only call Hooks at the...', options: ['Top Level', 'Inside Loops', 'Inside Nested Functions'], correctIndex: 0 }
          ]
        }
      ]
    },
    {
      title: 'Python for Data Science',
      description: 'An introduction to Python programming with a focus on data analysis libraries like Pandas and NumPy.',
      instructorId: instructorId.toString(),
      instructorName: 'Jane Instructor',
      thumbnail: 'https://picsum.photos/id/2/400/225',
      category: 'Data Science',
      mode: 'SELF_PACED',
      studentsEnrolled: [],
      modules: [
        { id: 'p1', title: 'Why Python?', type: 'text', content: 'Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability.' },
        { id: 'p2', title: 'Installing Anaconda', type: 'video', content: 'https://www.youtube.com/embed/5mDYijMfG_s' },
        { id: 'p3', title: 'Pandas DataFrames', type: 'text', content: 'A DataFrame is a 2-dimensional labeled data structure with columns of potentially different types.' }
      ],
      quizzes: []
    }
  ];

  const createdCourses = await Course.insertMany(courses);
  const webDevCourseId = createdCourses[0]._id.toString();

  // Create Enrollment
  const enrollment = {
      userId: studentId.toString(),
      courseId: webDevCourseId,
      progress: 20,
      completedModules: ['m1'],
      quizScores: {}
  };

  await Enrollment.create(enrollment);

  // Create Messages
  const messages = [
    {
      fromId: studentId.toString(),
      fromName: 'John Student',
      toId: instructorId.toString(),
      courseId: webDevCourseId,
      content: "Hi Jane, I'm stuck on the CSS Flexbox module. Can you explain justify-content?",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: true
    },
    {
      fromId: instructorId.toString(),
      fromName: 'Jane Instructor',
      toId: studentId.toString(),
      courseId: webDevCourseId,
      content: "Hi John! Sure. Think of it as aligning items along the main axis. I've sent you a diagram in the course resources.",
      timestamp: new Date(Date.now() - 82000000).toISOString(),
      read: false
    }
  ];

  await Message.insertMany(messages);

  // Create Forum Posts
  const posts = [
    {
      userId: studentId.toString(),
      userName: 'John Student',
      userRole: 'LEARNER',
      title: 'Best resources for learning React Hooks?',
      content: 'I am looking for some deep dives into useEffect and useMemo. Any recommendations?',
      likes: 5,
      date: new Date().toISOString().split('T')[0],
      category: 'Study Groups',
      replies: [
         {
           id: 'r1',
           userId: instructorId.toString(),
           userName: 'Jane Instructor',
           content: 'The official React documentation is actually the best place to start now!',
           date: new Date().toISOString().split('T')[0]
         }
      ]
    }
  ];

  await ForumPost.insertMany(posts);
};

// --- Middleware: DB Connection Check ---
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('⚠️ Database is not connected. Rejecting request.');
    return res.status(503).json({ error: 'Database not connected. Please check server logs.' });
  }
  next();
});

// --- Health Check ---
app.get('/', (req, res) => {
  res.send('LearnEase API is running!');
});

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Login attempt for: ${email}`);
  
  try {
    const user = await User.findOne({ email, password }); 
    
    if (user) {
      console.log(`✅ User found in DB: ${user._id} (${user.role})`);
      const { password: dbPassword, ...userWithoutPass } = user.toObject();
      userWithoutPass.id = user._id.toString();
      res.json(userWithoutPass);
    } else {
      console.log(`❌ Login failed: Invalid credentials for ${email}`);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (e) {
    console.error('Login Error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  console.log(`📝 Registering new user: ${req.body.email}`);
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const newUser = new User({ ...req.body, joinedDate: new Date().toISOString().split('T')[0] });
    const savedUser = await newUser.save();
    
    console.log(`✅ User registered successfully: ${savedUser._id}`);
    
    const { password, ...userWithoutPass } = savedUser.toObject();
    userWithoutPass.id = savedUser._id.toString();
    res.json(userWithoutPass);
  } catch (e) {
    console.error('Registration Error:', e);
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(u => ({...u.toObject(), id: u._id.toString()})));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// NEW: Get Specific User
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
        const { password, ...u } = user.toObject();
        u.id = user._id.toString();
        res.json(u);
    } else {
        res.status(404).send('User not found');
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// --- Course Routes ---
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses.map(c => ({...c.toObject(), id: c._id.toString()})));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if(course) res.json({...course.toObject(), id: course._id.toString()});
    else res.status(404).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/courses', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const saved = await newCourse.save();
    console.log(`📚 New Course Created: ${saved.title}`);
    res.json({...saved.toObject(), id: saved._id.toString()});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({...updated.toObject(), id: updated._id.toString()});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/courses/:id', async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// --- Enrollment Routes ---
app.get('/api/enrollments', async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (courseId) query.courseId = courseId;
    const enrollments = await Enrollment.find(query);
    res.json(enrollments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/enrollments', async (req, res) => {
  try {
    const exists = await Enrollment.findOne({ userId: req.body.userId, courseId: req.body.courseId });
    if (!exists) {
      const newEnrollment = new Enrollment(req.body);
      await newEnrollment.save();
      // Update course student list
      await Course.findByIdAndUpdate(req.body.courseId, { $push: { studentsEnrolled: req.body.userId } });
      console.log(`🎓 User ${req.body.userId} enrolled in ${req.body.courseId}`);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/enrollments', async (req, res) => {
  try {
    const { userId, courseId, ...update } = req.body;
    await Enrollment.findOneAndUpdate({ userId, courseId }, update);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Message Routes ---
app.get('/api/messages', async (req, res) => {
  try {
    const { userId } = req.query;
    const messages = await Message.find({ $or: [{ toId: userId }, { fromId: userId }] });
    res.json(messages.map(m => ({...m.toObject(), id: m._id.toString()})));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = new Message({ ...req.body, timestamp: new Date().toISOString() });
    await msg.save();
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Forum Routes ---
app.get('/api/forum', async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ date: -1 });
    res.json(posts.map(p => ({...p.toObject(), id: p._id.toString()})));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/forum', async (req, res) => {
  try {
    const post = new ForumPost({ ...req.body, date: new Date().toISOString().split('T')[0] });
    const saved = await post.save();
    res.json({...saved.toObject(), id: saved._id.toString()});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/forum/:id/like', async (req, res) => {
  await ForumPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
  res.json({ success: true });
});

app.post('/api/forum/:id/reply', async (req, res) => {
  const reply = { ...req.body, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
  await ForumPost.findByIdAndUpdate(req.params.id, { $push: { replies: reply } });
  res.json({ success: true });
});

// --- Feedback ---
app.post('/api/feedback', async (req, res) => {
  const fb = new Feedback({ ...req.body, date: new Date().toISOString().split('T')[0] });
  await fb.save();
  res.json(fb);
});

// --- Manual Seed Endpoint (now basically a reset) ---
app.post('/api/seed', async (req, res) => {
  try {
    console.log('⚡ Manual Reset requested.');
    await seedData();
    res.json({ message: "Database reset and seeded successfully!" });
  } catch (e) {
    console.error("❌ Seed Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`   (Accessible via http://0.0.0.0:${PORT})`);
});