
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedPasswordResetForm } from '@/components/auth/UnifiedPasswordResetForm';
import { usePasswordResetFlow } from '@/hooks/usePasswordResetFlow';

const ResetPassword = () => {
  const { 
    isLoading, 
    isValidLink, 
    isCheckingLink, 
    updatePassword, 
    requestNewLink 
  } = usePasswordResetFlow();

  console.log('ResetPassword: Page loaded, URL:', window.location.href);
  console.log('ResetPassword: Link validation state:', { isValidLink, isCheckingLink });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <UnifiedPasswordResetForm 
          onSubmit={updatePassword}
          onRequestNewLink={requestNewLink}
          isLoading={isLoading}
          isValidLink={isValidLink}
          isCheckingLink={isCheckingLink}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
