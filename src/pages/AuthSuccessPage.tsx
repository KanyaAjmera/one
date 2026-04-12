import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function AuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error("Authentication failed:", error);
        navigate('/');
        return;
      }

      if (token) {
        try {
          // Immediately use the token to fetch the user profile
          const res = await api.get('/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.data.success) {
            // Set session globally via AuthContext
            login(token, res.data.user);
            navigate('/demo');
            window.scrollTo(0, 0);
          } else {
            navigate('/');
          }
        } catch (err) {
          console.error("Token validation failed:", err);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    processAuth();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="flex items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <h2 className="text-xl font-semibold tracking-wide">Authenticating...</h2>
      </div>
    </div>
  );
}
