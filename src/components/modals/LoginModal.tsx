
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ModalHeader from "./login/ModalHeader";
import GoogleLoginButton from "./login/GoogleLoginButton";
import LoginForm from "./login/LoginForm";
import FormDivider from "./shared/FormDivider";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
  onForgotPassword?: (email: string) => void;
  onSwitchToSignUp?: () => void;
}

const LoginModal = ({ isOpen, onClose, onLogin, onGoogleLogin, onForgotPassword, onSwitchToSignUp }: LoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogin = async (email: string, password: string) => {
    if (onLogin) {
      setIsLoading(true);
      try {
        await onLogin(email, password);
        onClose();
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (onGoogleLogin) {
      setIsLoading(true);
      try {
        await onGoogleLogin();
        onClose();
      } catch (error) {
        console.error("Google login error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPasswordModalOpen(true);
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    if (onForgotPassword) {
      setIsLoading(true);
      try {
        await onForgotPassword(email);
      } catch (error) {
        console.error("Forgot password error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] h-auto max-h-[90vh]' : 'max-w-md'} p-0 bg-white rounded-2xl overflow-hidden`}>
          <ModalHeader onClose={onClose} />

          {/* Content */}
          <div className="p-6 space-y-6">
            <GoogleLoginButton onClick={handleGoogleLogin} isLoading={isLoading} />

            <FormDivider text="Or sign in with email" />

            <LoginForm 
              onSubmit={handleLogin} 
              onForgotPassword={handleForgotPasswordClick}
              isLoading={isLoading} 
            />

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={onSwitchToSignUp}
                className="text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
              >
                Sign up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onResetPassword={handleForgotPasswordSubmit}
        isLoading={isLoading}
      />
    </>
  );
};

export default LoginModal;
