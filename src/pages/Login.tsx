
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import LoginTrustIndicators from '@/components/auth/LoginTrustIndicators';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SimpleHeader />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <LoginHeader />
          <LoginForm />
          <LoginTrustIndicators />
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
};

export default Login;
