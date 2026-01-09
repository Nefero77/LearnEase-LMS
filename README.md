# 📚 LearnEase LMS

**LearnEase** is a full-stack Learning Management System (LMS). It features role-based access control, interactive course management, real-time progress tracking, and an **AI-powered tutor**.

Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and **Tailwind CSS**.

---
<a href = 'https://docs.google.com/spreadsheets/d/10b74jgPe6m5NmWJ7bLy3F1uXo9cVpofvp5TeZxeaQWs/edit?usp=sharing'>Manual Tests of First Build</a>
## 🚀 Features

### 👥 Role-Based Access Control (RBAC)
*   **Learners:** Browse catalogs, enroll in courses, track progress, take quizzes, and chat with the AI tutor.
*   **Instructors:** Create/Edit courses, manage modules (Video/Text/Quiz), view enrolled student analytics, and reply to messages.
*   **Admins:** System overview, manage users, and moderate content.

### 🧠 AI Integration (Gemini)
*   **AI Tutor:** Context-aware chat widget that answers student questions based on current course material.
*   **Content Generation:** Instructors can auto-generate course descriptions and quiz questions using AI.

### 🏫 Course Management
*   **Multimedia Support:** Modules can be text lessons, embedded YouTube videos, or interactive quizzes.
*   **Progress Tracking:** Visual progress bars and completion certification logic.

### 💬 Community & Tools
*   **Forum:** Discussion board for students and instructors.
*   **Messaging:** Direct messaging system between students and instructors.
*   **Resources:** Curated list of external learning tools.

---

## 🛠️ Tech Stack

**Frontend:**
*   **React (v19):** UI Library with Hooks and Context.
*   **TypeScript:** Type safety and better developer experience.
*   **Tailwind CSS:** Utility-first styling for responsive design.
*   **React Router DOM:** Client-side routing.
*   **Recharts:** Data visualization for dashboards.

**Backend:**
*   **Node.js & Express:** RESTful API server.
*   **Mongoose:** ODM for MongoDB interaction.
*   **Google GenAI SDK:** Integration with Gemini models.

**Database:**
*   **MongoDB:** database for storing users, courses, and enrollments.

---

## ⚙️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
1.  **Node.js** (v16 or higher)
2.  **MongoDB** (Local instance running on port 27017 OR a MongoDB Atlas URI)
3.  **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com))

### 1. Installation

Clone the repository and install dependencies:

```bash
# Install dependencies
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory (or ensure your environment has these variables):

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/learnease
API_KEY=your_google_gemini_api_key_here
```

### 3. Run the Application

You need to run the backend server and the frontend development server simultaneously.

**Terminal 1: Start the Backend**
```bash
node server/server.js
```
*On the first run, the server will auto-seed the database with default users and courses.*

**Terminal 2: Start the Frontend**
```bash
npm start
```
*Open http://localhost:3000 (or the port specified by your bundler) in your browser.*

---

## 🔑 Default Credentials

The application automatically seeds the database with these demo users:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Learner** | `student@learnease.com` | `password` |
| **Instructor** | `instructor@learnease.com` | `password` |
| **Admin** | `admin@learnease.com` | `password` |

---

## 🧪 Testing

The project includes endpoints for manual testing and data resetting.

*   **Reset Database:** Send a POST request to `http://localhost:5001/api/seed` to wipe and re-seed data.
*   **Health Check:** Visit `http://localhost:5001/` to verify the API is running.

---

## 📂 Project Structure

```bash
├── components/          # Reusable UI components (Layout, Navbar, etc.)
├── pages/               # Main page views (Public, Learner, Instructor, Admin)
├── server/              # Backend logic
│   ├── server.js        # Express server entry point
│   └── models.js        # Mongoose database schemas
├── services/            # Frontend API services
│   ├── api.ts           # Axios/Fetch wrappers
│   ├── ai.ts            # Google Gemini integration logic
│   └── storage.ts       # Centralized service for DB interactions
├── types.ts             # TypeScript interfaces and Enum definitions
├── App.tsx              # Main React Application component & Routing
├── index.html           # HTML entry point (Tailwind CDN & Import Maps)
└── metadata.json        # Project metadata

