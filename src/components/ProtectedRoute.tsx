import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfileComplete?: boolean;
}

const ProtectedRoute = ({ children, requireProfileComplete = true }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setIsAuthenticated(true);

      // Check profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('completion_percentage')
        .eq('id', user.id)
        .single();

      const isComplete = profile?.completion_percentage >= 70; // 70% threshold
      setProfileComplete(isComplete);

      // Redirect to complete profile if needed
      if (requireProfileComplete && !isComplete) {
        navigate('/complete-profile');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate, requireProfileComplete]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;