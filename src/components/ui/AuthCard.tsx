import { useState } from "react";
import { Lock, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-md">
      
      {/* Blurred Deep Blue Background Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#1a368c] opacity-80 mix-blend-screen blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#2550d5] opacity-60 mix-blend-screen blur-[80px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[80%] h-[80%] bg-[#0f2466] opacity-90 mix-blend-screen blur-[90px] rounded-full pointer-events-none -z-10"></div>

      <div className="w-full p-10 rounded-[2rem] backdrop-blur-2xl bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden font-sans text-white transition-all duration-500">
        <div className="flex flex-col relative z-10">
        {/* Header */}
        <div className="text-center space-y-3 mt-4 mb-8">
          <h2 className="text-4xl font-extrabold text-white tracking-wide">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-300 text-[15px]">
            {isLogin ? "Sign in to continue" : "Sign up to get started"}
          </p>
        </div>

        {/* Forms */}
        <form 
          className="space-y-6" 
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/demo');
            window.scrollTo(0, 0);
          }}
        >
          {!isLogin && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <User className="h-[22px] w-[22px] text-gray-300 transition-colors group-focus-within:text-white" />
              </div>
              <input
                type="text"
                className="w-full bg-transparent border-0 border-b-2 border-white/30 py-3 pl-11 pr-4 text-[15px] text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-300"
                placeholder="Username"
              />
            </div>
          )}

          <div className="relative group mt-4">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <User className="h-[22px] w-[22px] text-gray-300 transition-colors group-focus-within:text-white" />
            </div>
            <input
              type="email"
              className="w-full bg-transparent border-0 border-b-2 border-white/30 py-3 pl-11 pr-4 text-[15px] text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-300"
              placeholder="Email Address"
            />
          </div>

          <div className="relative group mt-4">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <Lock className="h-[22px] w-[22px] text-gray-300 transition-colors group-focus-within:text-white" />
            </div>
            <input
              type="password"
              className="w-full bg-transparent border-0 border-b-2 border-white/30 py-3 pl-11 pr-4 text-[15px] text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-300"
              placeholder="Password"
            />
          </div>

          <div className="flex justify-start mt-6 mb-2">
            <a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors">
              Forgot Password?
            </a>
          </div>

          <button className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-lg rounded-xl py-4 mt-8 transition-all flex items-center justify-center gap-3 shadow-lg">
            <span>{isLogin ? "Login" : "Sign Up"}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="relative flex items-center py-8">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            navigate('/demo');
            window.scrollTo(0, 0);
          }}
          className="w-full bg-[#e8e9ea] hover:bg-gray-300 text-[#303134] font-semibold text-[16px] rounded-xl py-3.5 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Login with Google
        </button>

        <p className="text-center text-[14px] text-gray-400 mt-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#3b82f6] hover:text-blue-400 font-bold ml-1 transition-colors"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

        </div>
      </div>
    </div>
  );
}
