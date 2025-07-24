import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploadSection from "./ImageUploadSection";
import ProfileFormFields from "./ProfileFormFields";
import ProfileFormActions from "./ProfileFormActions";

interface EditProfileFormProps {
  profile: any;
  onProfileUpdate: () => void;
  onClose: () => void;
}

const EditProfileForm = ({
  profile,
  onProfileUpdate,
  onClose,
}: EditProfileFormProps) => {
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
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
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
      console.log("Updating profile with:", {
        fullName,
        description,
        avatarUrl,
      });

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          description: description.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }

      toast({
        title: "¡Perfil actualizado!",
        description: "Tus cambios han sido guardados exitosamente.",
      });

      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
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
    console.log("Image changed to:", imageUrl);
    setAvatarUrl(imageUrl);
  };

  return (
    <div className="p-6 space-y-6">
      <ImageUploadSection
        currentAvatarUrl={avatarUrl}
        onImageChange={handleImageChange}
        initials={getInitials()}
      />

      <ProfileFormFields
        fullName={fullName}
        setFullName={setFullName}
        description={description}
        setDescription={setDescription}
        userEmail={user?.email || ""}
      />

      <ProfileFormActions
        onCancel={handleClose}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditProfileForm;
