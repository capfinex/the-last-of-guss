import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RoundsPage } from './pages/RoundsPage';
import { RoundPage } from './pages/RoundPage';
import { useAuthStore } from './stores/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/rounds"
            element={
              <ProtectedRoute>
                <RoundsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rounds/:id"
            element={
              <ProtectedRoute>
                <RoundPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/rounds" replace />} />
          <Route path="*" element={<Navigate to="/rounds" replace />} />
        </Routes>
      </div>
    </Router>
  );
};