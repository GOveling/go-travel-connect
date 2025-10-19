import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PinRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PinRecoveryModal = ({ isOpen, onClose }: PinRecoveryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendRecoveryEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No se pudo obtener el email del usuario",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('recover-offline-pin', {
        body: {
          userEmail: user.email
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setEmailSent(true);
        toast({
          title: "Email enviado",
          description: "Revisa tu bandeja de entrada para el enlace de recuperación",
          className: "bg-green-50 border-green-200",
        });
      } else {
        throw new Error(data.error || 'Error al enviar email de recuperación');
      }
    } catch (err: any) {
      console.error('Error sending recovery email:', err);
      toast({
        title: "Error",
        description: err.message || "Error al enviar email de recuperación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Recuperar PIN de Modo Offline
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!emailSent ? (
            <>
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>¿Olvidaste tu PIN?</strong> Te enviaremos un enlace de recuperación 
                  a tu email. Al usarlo, tu PIN actual será eliminado y podrás crear uno nuevo.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Email de recuperación</Label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-600">
                  Se enviará el enlace de recuperación a este email
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendRecoveryEmail}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Email
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Email enviado</h3>
                  <p className="text-gray-600">
                    Revisa tu bandeja de entrada en <strong>{user?.email}</strong>
                  </p>
                </div>

                <Alert>
                  <AlertDescription>
                    El enlace expirará en 24 horas. Si no ves el email, 
                    revisa tu carpeta de spam.
                  </AlertDescription>
                </Alert>
              </div>

              <Button onClick={handleClose} className="w-full">
                Entendido
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinRecoveryModal;