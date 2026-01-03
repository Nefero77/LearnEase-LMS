import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home, CourseCatalog } from './pages/Public';
import { Login, Register } from './pages/Auth';
import { LearnerDashboard } from './pages/Learner';
import { InstructorDashboard } from './pages/Instructor';
import { AdminDashboard } from './pages/Admin';
import { CourseViewer } from './pages/CourseViewer';
import { Resources } from './pages/Resources';
import { Feedback } from './pages/Feedback';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';
import { StorageService } from './services/storage';
import { Role } from './types';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: Role[] }) => {
  const user = StorageService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Route Switcher for /dashboard based on role
const DashboardRouter: React.FC = () => {
  const user = StorageService.getCurrentUser();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case Role.ADMIN:
      return <AdminDashboard />;
    case Role.INSTRUCTOR:
      return <InstructorDashboard user={user} />;
    case Role.LEARNER:
    default:
      return <LearnerDashboard user={user} />;
  }
};

const App: React.FC = () => {
  
  // STRICT DB VALIDATION: Check if user exists in DB on load
  useEffect(() => {
    const validate = async () => {
      const isValid = await StorageService.validateSession();
      if (!isValid && StorageService.getCurrentUser()) {
        console.warn('Session invalid: User not found in DB. Logging out.');
        StorageService.logout();
        window.location.reload();
      }
    };
    validate();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/learn/:courseId"
            element={
              <ProtectedRoute allowedRoles={[Role.LEARNER, Role.INSTRUCTOR, Role.ADMIN]}>
                <CourseViewer />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/feedback" 
            element={<Feedback />} 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;