import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Check } from "lucide-react";

interface ConfirmationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (token: string) => Promise<void>;
  email: string;
  isLoading?: boolean;
}

const ConfirmationCodeModal = ({
  isOpen,
  onClose,
  onConfirm,
  email,
  isLoading = false,
}: ConfirmationCodeModalProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Por favor ingresa el código de confirmación");
      return;
    }

    try {
      setError(null);
      await onConfirm(code.trim());
      setCode("");
    } catch (err: any) {
      setError(err.message || "Error al confirmar el código");
    }
  };

  const handleClose = () => {
    setCode("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Confirma tu cuenta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">
              Te hemos enviado un código de confirmación a:
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de confirmación</Label>
              <Input
                id="code"
                type="text"
                placeholder="Ingresa el código de 6 dígitos"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg font-mono tracking-wider"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Confirmando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Confirmar
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              ¿No recibiste el código? Revisa tu carpeta de spam o intenta registrarte nuevamente.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationCodeModal;