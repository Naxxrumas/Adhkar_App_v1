import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/hooks/useAuth';
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';
import { ThemeProvider } from './src/hooks/useTheme';
import Login from './src/components/auth/Login';
import Register from './src/components/auth/Register';
import Dashboard from './src/components/dashboard/Dashboard';
import { isSupabaseConfigured } from './src/services/supabase';

const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8d7da', color: '#721c24', padding: '20px', textAlign: 'center' }}>
        <div>
          <h2>Environment Configuration Error - خطأ في إعدادات البيئة</h2>
          <p>The application is missing required Supabase environment variables.</p>
          <p>Please ensure that <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> are set in Vercel Environment Variables.</p>
          <p>يرجى التأكد من إضافة المتغيرات المطلوبة في إعدادات البيئة على Vercel.</p>
        </div>
      </div>
    );
  }

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
