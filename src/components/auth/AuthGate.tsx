
import React, { useState } from "react";
import AnimatedSignIn from "@/components/ui/animated-sign-in";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthGateProps {
  onAuthSuccess: () => void;
}

const AuthGate = ({ onAuthSuccess }: AuthGateProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('AuthGate: Attempting login');
      const { error } = await signIn(email, password);
      if (!error) {
        console.log('AuthGate: Login successful, calling onAuthSuccess');
        onAuthSuccess();
      }
    } catch (error) {
      console.error("AuthGate: Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('AuthGate: Attempting sign up');
      const { error } = await signUp(email, password, name);
      if (!error) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        // Don't call onAuthSuccess here since email confirmation might be required
      }
    } catch (error) {
      console.error("AuthGate: Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log('AuthGate: Attempting Google login');
      const { error } = await signInWithGoogle();
      if (!error) {
        console.log('AuthGate: Google login initiated');
        // Don't call onAuthSuccess here as the redirect will handle the auth state change
      }
    } catch (error) {
      console.error("AuthGate: Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <AnimatedSignIn
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      onGoogleLogin={handleGoogleLogin}
      onSwitchMode={handleSwitchMode}
      isSignUp={isSignUp}
      isLoading={isLoading}
    />
  );
};

export default AuthGate;
