
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
      if (!error) {
        console.log('✅ AuthGate: Login successful, calling onAuthSuccess');
        onAuthSuccess();
      }
    } catch (error) {
      console.error("❌ AuthGate: Login exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    console.log('📝 AuthGate: handleSignUp called for:', email);
    
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
      console.log('📝 AuthGate: Attempting sign up for:', email);
      const { error } = await signUp(email, password, name.trim());
      if (!error) {
        console.log('✅ AuthGate: Sign up successful');
        // Para sign up, no llamamos onAuthSuccess inmediatamente ya que puede requerir confirmación por email
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
      if (!error) {
        console.log('✅ AuthGate: Google login initiated successfully');
        // No llamamos onAuthSuccess aquí porque el redirect manejará el cambio de estado
      }
    } catch (error) {
      console.error("❌ AuthGate: Google login exception:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
    console.log('🔄 AuthGate: Switching mode from', isSignUp ? 'signup' : 'login', 'to', isSignUp ? 'login' : 'signup');
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
