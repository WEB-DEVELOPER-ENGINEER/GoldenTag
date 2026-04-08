import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { PublicProfile } from './pages/PublicProfile';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Digital Profile Hub
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Your centralized digital presence
                  </p>
                  <div className="space-x-4">
                    <Link
                      to="/login"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="inline-block px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            } />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/:username" element={<PublicProfile />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
