
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { useSimplePasswordReset } from '@/hooks/useSimplePasswordReset';

const ResetPassword = () => {
  const { updatePassword, isLoading } = useSimplePasswordReset();

  console.log('ResetPassword: Page loaded, URL:', window.location.href);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <PasswordResetForm onSubmit={updatePassword} isLoading={isLoading} />
      </div>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
