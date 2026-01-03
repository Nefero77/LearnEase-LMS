const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['LEARNER', 'INSTRUCTOR', 'ADMIN'], default: 'LEARNER' },
  joinedDate: { type: String },
  bio: String
});