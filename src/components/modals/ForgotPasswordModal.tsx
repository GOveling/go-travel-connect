
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (email: string) => Promise<void>;
  isLoading?: boolean;
}

const ForgotPasswordModal = ({ 
  isOpen, 
  onClose, 
  onResetPassword, 
  isLoading = false 
}: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const isMobile = useIsMobile();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      setIsEmailValid(validateEmail(newEmail));
    } else {
      setIsEmailValid(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setIsEmailValid(false);
      return;
    }

    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }

    try {
      await onResetPassword(email.trim());
      setEmail("");
      onClose();
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsEmailValid(true);
    onClose();
  };

  const isFormValid = email.trim() && validateEmail(email);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] h-auto max-h-[90vh]' : 'max-w-md'} p-0 bg-white rounded-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              Recuperar Contraseña
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-600">
              Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Ingresa tu email"
                  className={`pl-10 h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                    !isEmailValid && email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  required
                />
              </div>
              {!isEmailValid && email && (
                <p className="text-sm text-red-600">
                  Por favor ingresa un email válido
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white h-12 text-base font-medium rounded-lg"
            >
              {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={handleClose}
              className="text-purple-600 hover:text-purple-700 text-sm"
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
