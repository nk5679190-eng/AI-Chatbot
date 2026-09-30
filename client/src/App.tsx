import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingChatbotWidget } from './components/FloatingChatbotWidget';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentChatPage } from './pages/StudentChatPage';
import { FAQPage } from './pages/FAQPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { AgentDashboard } from './pages/AgentDashboard';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminFAQPage } from './pages/AdminFAQPage';
import { AdminTeamPage } from './pages/AdminTeamPage';
import { AdminWhatsAppPage } from './pages/AdminWhatsAppPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="py-20 text-center text-slate-400">Verifying session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<StudentChatPage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Pages */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'AGENT', 'ADMIN']}>
                <CreateTicketPage />
              </ProtectedRoute>
            }
          />

          {/* Agent & Shared Ticket Pages */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/tickets/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'AGENT', 'ADMIN']}>
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Pages */}
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'AGENT']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'AGENT']}>
                <AdminFAQPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/whatsapp"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminWhatsAppPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Floating Chatbot Widget on all pages */}
      <FloatingChatbotWidget />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
