import { useState } from "react";
import type { UseAuthFormReturn } from "@/types";

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

  const isFormValid =
    !isLoading &&
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
