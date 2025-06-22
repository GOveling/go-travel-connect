
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async (email: string, password: string) => {
    console.log('AuthGate: handleLogin called with:', email);
    
    if (!email?.trim() || !password?.trim()) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
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
    console.log('AuthGate: handleSignUp called with:', email);
    
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (name.trim().length < 2) {
      toast({
        title: "Invalid name",
        description: "Name must be at least 2 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('AuthGate: Attempting sign up');
      const { error } = await signUp(email, password, name.trim());
      if (!error) {
        console.log('AuthGate: Sign up successful');
        // Don't call onAuthSuccess immediately for sign up as it might require email confirmation
      }
    } catch (error) {
      console.error("AuthGate: Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('AuthGate: handleGoogleLogin called');
    
    setIsLoading(true);
    try {
      console.log('AuthGate: Attempting Google login');
      const { error } = await signInWithGoogle();
      if (!error) {
        console.log('AuthGate: Google login initiated successfully');
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
