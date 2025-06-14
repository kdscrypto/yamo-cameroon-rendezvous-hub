
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthCard from '@/components/auth/AuthCard';
import RegistrationForm from '@/components/auth/RegistrationForm';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
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
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <AuthCard
          title="Inscription"
          description="Créez votre compte Yamo"
        >
          <RegistrationForm isLoading={isLoading} setIsLoading={setIsLoading} />
        </AuthCard>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
