import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { clearUserPin, setUserPin } from "@/utils/localEncryption";

const RecoverPin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [settingPin, setSettingPin] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Token inválido",
        description: "No se proporcionó un token de recuperación válido",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-pin-recovery', {
        body: { recoveryToken: token }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setTokenValid(true);
        setUserEmail(data.userEmail);
      } else {
        throw new Error(data.error || 'Token inválido');
      }
    } catch (err: any) {
      console.error('Error verifying token:', err);
      toast({
        title: "Token inválido",
        description: err.message || "El token de recuperación es inválido o ha expirado",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({
        title: "PIN inválido",
        description: "El PIN debe tener exactamente 4 dígitos",
        variant: "destructive",
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN no coincide",
        description: "Los PINs ingresados no coinciden",
        variant: "destructive",
      });
      return;
    }

    setSettingPin(true);

    try {
      // Clear old PIN
      clearUserPin();
      
      // Set new PIN
      setUserPin(newPin);
      
      setSuccess(true);
      toast({
        title: "PIN restablecido",
        description: "Tu nuevo PIN ha sido configurado correctamente",
        className: "bg-green-50 border-green-200",
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Error setting new PIN:', err);
      toast({
        title: "Error",
        description: "Error al configurar el nuevo PIN",
        variant: "destructive",
      });
    } finally {
      setSettingPin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Verificando token de recuperación...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Recuperar PIN
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!success ? (
            <>
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Configurarás un nuevo PIN para el modo offline. 
                  Tu PIN anterior ha sido eliminado.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Nuevo PIN (4 dígitos)</Label>
                <Input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <Label>Confirmar PIN</Label>
                <Input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <Button
                onClick={handleSetNewPin}
                disabled={settingPin || newPin.length !== 4 || confirmPin.length !== 4}
                className="w-full"
              >
                {settingPin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Configurando PIN...
                  </>
                ) : (
                  "Configurar Nuevo PIN"
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">PIN Restablecido</h3>
                <p className="text-gray-600">
                  Tu nuevo PIN ha sido configurado correctamente
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Serás redirigido automáticamente...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoverPin;