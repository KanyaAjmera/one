import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';
import { NODE_API_URL } from '../config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const { isLightMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/login', { email, password });
        if (res.data.success) {
          login(res.data.token, res.data.user);
          onClose(); // Close modal on success
        }
      } else {
        const res = await api.post('/signup', { name, email, password });
        if (res.data.success) {
          login(res.data.token, res.data.user);
          onClose(); // Close modal on success
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword(''); // Reset password field
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${
              isLightMode 
                ? 'bg-white/90 border-gray-200 text-gray-800 shadow-xl' 
                : 'bg-black/80 backdrop-blur-md border-white/20 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)]'
            }`}
          >
            {/* Header */}
            <div className={`relative px-6 py-8 border-b ${isLightMode ? 'border-gray-100 bg-gray-50/50' : 'border-white/10'}`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-3xl font-bold tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className={`mt-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {isLogin 
                  ? 'Enter your details to access your account' 
                  : 'Join antigravity and explore the future'}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-center"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className={`h-5 w-5 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                            isLightMode 
                              ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400' 
                              : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          }`}
                          placeholder="Your Name"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                      isLightMode 
                        ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400' 
                        : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                    placeholder="Email Address"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                      isLightMode 
                        ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400' 
                        : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    }`}
                    placeholder="Password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Google Login Separator */}
              <div className="relative flex items-center py-6">
                <div className={`flex-grow border-t ${isLightMode ? 'border-gray-200' : 'border-white/20'}`}></div>
                <span className={`flex-shrink-0 mx-4 text-xs font-medium uppercase tracking-widest ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  OR CONTINUE WITH
                </span>
                <div className={`flex-grow border-t ${isLightMode ? 'border-gray-200' : 'border-white/20'}`}></div>
              </div>

              {/* Google Login Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `${NODE_API_URL}/api/auth/google`;
                }}
                className={`w-full font-semibold text-[15px] rounded-xl py-3 transition-all flex items-center justify-center gap-3 border ${
                  isLightMode 
                    ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm' 
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t text-center ${isLightMode ? 'bg-gray-50 border-gray-100' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="font-medium text-indigo-500 hover:text-indigo-400 transition-colors focus:outline-none focus:underline"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
