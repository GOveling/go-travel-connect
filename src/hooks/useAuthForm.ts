
import { useState } from "react";

interface UseAuthFormReturn {
  isSignUp: boolean;
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setName: (name: string) => void;
  setConfirmPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  toggleMode: () => void;
  resetForm: () => void;
  isFormValid: boolean;
}

export const useAuthForm = (): UseAuthFormReturn => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const isFormValid = !isLoading && 
    email && 
    password && 
    (!isSignUp || (name && confirmPassword && password === confirmPassword));

  return {
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
    resetForm,
    isFormValid,
  };
};
