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
        <div className="min-h-screen bg-ink-50 bg-gradient-mesh">
          <Routes>
            <Route path="/" element={
              <div className="flex items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden">
                {/* Ambient background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-float"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sage-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                </div>
                
                <div className="text-center max-w-2xl mx-auto animate-fade-in relative z-10">
                  {/* Refined Logo */}
                  <div className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-ink-900 shadow-elevation-3 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <svg className="w-12 h-12 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text tracking-tight">
                    Profile Hub
                  </h1>
                  <p className="text-xl md:text-2xl text-ink-600 mb-14 max-w-xl mx-auto text-balance leading-relaxed">
                    Your digital identity, refined. One link to rule them all.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
                    <Link to="/login" className="btn-primary w-full sm:w-auto min-w-[160px]">
                      Sign In
                    </Link>
                    <Link to="/register" className="btn-secondary w-full sm:w-auto min-w-[160px]">
                      Create Account
                    </Link>
                  </div>
                  
                  {/* Refined feature highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-700 group-hover:bg-ink-900 group-hover:text-white transition-all duration-300 shadow-elevation-1">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-ink-800">Instant Setup</span>
                      <span className="text-xs text-ink-500">Live in seconds</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-700 group-hover:bg-ink-900 group-hover:text-white transition-all duration-300 shadow-elevation-1">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-ink-800">Mobile Perfected</span>
                      <span className="text-xs text-ink-500">Flawless on any device</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 group">
                      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-700 group-hover:bg-ink-900 group-hover:text-white transition-all duration-300 shadow-elevation-1">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <span className="font-semibold text-ink-800">Fully Yours</span>
                      <span className="text-xs text-ink-500">Complete control</span>
                    </div>
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
