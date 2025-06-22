
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
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, name);
      if (!error) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async ()=> {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (!error) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Google login error:", error);
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
