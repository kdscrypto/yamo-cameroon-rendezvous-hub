
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { PasswordResetStatus } from '@/components/auth/PasswordResetStatus';
import { usePasswordReset } from '@/hooks/usePasswordReset';

const ResetPassword = () => {
  const { isLoading, isValidSession, isCheckingSession, updatePassword } = usePasswordReset();

  // Show loading state while we're validating the session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <PasswordResetStatus isLoading={true} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <PasswordResetStatus isError={true} />
        </div>
        <Footer />
      </div>
    );
  }

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
