import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploadSection from "./profile/ImageUploadSection";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate: () => void;
}

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdate }: EditProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setDescription(profile.description || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const getInitials = () => {
    if (fullName && fullName.trim()) {
      return fullName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate description length
    if (description.length > 70) {
      toast({
        title: "Descripción muy larga",
        description: "La descripción no puede tener más de 70 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Updating profile with:', { fullName, description, avatarUrl });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          description: description.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      toast({
        title: "¡Perfil actualizado!",
        description: "Tus cambios han sido guardados exitosamente.",
      });

      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFullName(profile?.full_name || "");
    setDescription(profile?.description || "");
    setAvatarUrl(profile?.avatar_url || "");
    onClose();
  };

  const handleImageChange = (imageUrl: string) => {
    console.log('Image changed to:', imageUrl);
    setAvatarUrl(imageUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Editar Perfil
            </DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6">
          {/* Image Upload Section */}
          <ImageUploadSection
            currentAvatarUrl={avatarUrl}
            onImageChange={handleImageChange}
            initials={getInitials()}
          />

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Nombre completo
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Travel Enthusiast"
                maxLength={70}
                className="min-h-[80px] border-2 border-gray-200 focus:border-blue-500 rounded-xl resize-none"
              />
              <p className="text-xs text-gray-400">
                {description.length}/70 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="h-12 border-2 border-gray-100 bg-gray-50 rounded-xl text-gray-500"
              />
              <p className="text-xs text-gray-400">
                El email no se puede cambiar
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save size={16} />
                  <span>Guardar</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
