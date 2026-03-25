import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import './index.css';
import './components/AppShell.css';

/* ── Route Guards ── */

// Redirects unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? <AppShell>{children}</AppShell>
    : <Navigate to="/login" replace />;
};

// Analytics is support-only
const SupportRoute = ({ children }) => {
  const { isAuthenticated, isSupport } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSupport) return <Navigate to="/dashboard" replace />;
  return <AppShell>{children}</AppShell>;
};

// Already-authenticated users go straight to dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public marketing page */}
        <Route path="/" element={<Home />} />

        {/* Auth pages (no shell) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* App pages (wrapped in AppShell) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <SupportRoute>
              <Analytics />
            </SupportRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/* Inner component so we can use useTheme() inside ThemeProvider */
function ThemedApp() {
  const { isDark } = useTheme();
  return (
    <>
      <AppRoutes />

      {/* Global toast container — theme synced with app theme */}
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
        style={{ zIndex: 9999 }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* SocketProvider must be inside AuthProvider so it can access user state */}
        <SocketProvider>
          <ThemedApp />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

