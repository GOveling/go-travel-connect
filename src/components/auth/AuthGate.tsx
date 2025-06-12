
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthForm } from "@/hooks/useAuthForm";
import AuthHeader from "./AuthHeader";
import GoogleAuthButton from "./GoogleAuthButton";
import AuthForm from "./AuthForm";
import AuthModeToggle from "./AuthModeToggle";

interface AuthGateProps {
  onAuthSuccess: () => void;
}

const AuthGate = ({ onAuthSuccess }: AuthGateProps) => {
  const isMobile = useIsMobile();
  const {
    isSignUp,
    email,
    password,
    name,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    isLoading,
    setEmail,
    setPassword,
    setName,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    setIsLoading,
    toggleMode,
    isFormValid,
  } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        console.error("Passwords don't match");
        setIsLoading(false);
        return;
      }
      console.log("Sign up:", name, email);
    } else {
      console.log("Sign in:", email);
    }

    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess();
    }, 1000);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    console.log("Google authentication");
    
    // Simulate Google auth delay
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 flex items-center justify-center p-4">
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} bg-white rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <AuthHeader />

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Google Auth Button */}
          <GoogleAuthButton 
            onGoogleAuth={handleGoogleAuth}
            isLoading={isLoading}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or {isSignUp ? "sign up" : "sign in"} with email
              </span>
            </div>
          </div>

          {/* Form */}
          <AuthForm
            isSignUp={isSignUp}
            email={email}
            password={password}
            name={name}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            isLoading={isLoading}
            isFormValid={isFormValid}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onNameChange={setName}
            onConfirmPasswordChange={setConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            onSubmit={handleSubmit}
          />

          {/* Toggle Mode */}
          <AuthModeToggle 
            isSignUp={isSignUp}
            onToggleMode={toggleMode}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
