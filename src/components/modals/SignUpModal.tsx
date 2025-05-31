
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import ModalHeader from "./login/ModalHeader";
import GoogleLoginButton from "./login/GoogleLoginButton";
import SignUpForm from "./signup/SignUpForm";
import FormDivider from "./shared/FormDivider";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp?: (name: string, email: string, password: string) => void;
  onGoogleSignUp?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUpModal = ({ isOpen, onClose, onSignUp, onGoogleSignUp, onSwitchToLogin }: SignUpModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleSignUp = async (name: string, email: string, password: string) => {
    if (onSignUp) {
      setIsLoading(true);
      try {
        await onSignUp(name, email, password);
        onClose();
      } catch (error) {
        console.error("Sign up error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    if (onGoogleSignUp) {
      setIsLoading(true);
      try {
        await onGoogleSignUp();
        onClose();
      } catch (error) {
        console.error("Google sign up error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] h-auto max-h-[90vh]' : 'max-w-md'} p-0 bg-white rounded-2xl overflow-hidden`}>
        <ModalHeader onClose={onClose} />

        {/* Content */}
        <div className="p-6 space-y-6">
          <GoogleLoginButton onClick={handleGoogleSignUp} isLoading={isLoading} />

          <FormDivider text="Or sign up with email" />

          <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />

          {/* Sign In Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
            >
              Sign in
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpModal;
