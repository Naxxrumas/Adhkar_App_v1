import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/hooks/useAuth';
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';
import { ThemeProvider } from './src/hooks/useTheme';
import Login from './src/components/auth/Login';
import Register from './src/components/auth/Register';
import Dashboard from './src/components/dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
