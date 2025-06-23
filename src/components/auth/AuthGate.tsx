
import React, { useState, useEffect } from "react";
import AnimatedSignIn from "@/components/ui/animated-sign-in";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthGateProps {
  onAuthSuccess: () => void;
}

const AuthGate = ({ onAuthSuccess }: AuthGateProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword, user, loading } = useAuth();
  const { toast } = useToast();

  // Auto-call onAuthSuccess when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      console.log('✅ AuthGate: User authenticated, calling onAuthSuccess');
      onAuthSuccess();
    }
  }, [user, loading, onAuthSuccess]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const handleLogin = async (email: string, password: string) => {
    console.log('🔑 AuthGate: handleLogin called for:', email);
    
    // Validación de campos vacíos
    if (!email?.trim() || !password?.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Validación de email
    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    // Validación de contraseña
    if (!validatePassword(password)) {
      toast({
        title: "Contraseña inválida",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔑 AuthGate: Attempting login for:', email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ AuthGate: Login error:', error);
      } else {
        console.log('✅ AuthGate: Login successful');
      }
    } catch (error) {
      console.error("❌ AuthGate: Login exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    console.log('📝 AuthGate: handleSignUp called for:', email,  'name:', name);
    
    // Validación de campos vacíos
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Validación de nombre
    if (!validateName(name)) {
      toast({
        title: "Nombre inválido",
        description: "El nombre debe tener al menos 2 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Validación de email
    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    // Validación de contraseña
    if (!validatePassword(password)) {
      toast({
        title: "Contraseña inválida",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('📝 AuthGate: Attempting sign up for:', email, 'with name:', name);
      const { error } = await signUp(email, password, name.trim());
      
      if (error) {
        console.error('❌ AuthGate: Sign up error:', error);
      } else {
        console.log('✅ AuthGate: Sign up successful');
      }
    } catch (error) {
      console.error("❌ AuthGate: Sign up exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔍 AuthGate: handleGoogleLogin called');
    
    setIsLoading(true);
    try {
      console.log('🔍 AuthGate: Attempting Google login');
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('❌ AuthGate: Google login error:', error);
      } else {
        console.log('✅ AuthGate: Google login initiated successfully');
      }
    } catch (error) {
      console.error("❌ AuthGate: Google login exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    console.log('🔐 AuthGate: handleForgotPassword called for:', email);
    
    // Validación de email
    if (!email?.trim()) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu email para recuperar la contraseña",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 AuthGate: Attempting password reset for:', email);
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error('❌ AuthGate: Password reset error:', error);
      } else {
        console.log('✅ AuthGate: Password reset email sent successfully');
      }
    } catch (error) {
      console.error("❌ AuthGate: Password reset exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
    console.log('🔄 AuthGate: Switching mode from', isSignUp ? 'signup' : 'login', 'to', isSignUp ? 'login' : 'signup');
    setIsSignUp(!isSignUp);
  };

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedSignIn
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      onGoogleLogin={handleGoogleLogin}
      onForgotPassword={handleForgotPassword}
      onSwitchMode={handleSwitchMode}
      isSignUp={isSignUp}
      isLoading={isLoading}
    />
  );
};

export default AuthGate;
