import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';

const DefaultDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.role) {
        navigate('/choose-role');
        return;
      }

      // Redirect based on role
      switch (profile.role) {
        case 'buyer':
          navigate('/buyer-dashboard');
          break;
        case 'seller':
          navigate('/seller-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/choose-role');
      }
    };

    redirectToDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return null;
};

export default DefaultDashboard;