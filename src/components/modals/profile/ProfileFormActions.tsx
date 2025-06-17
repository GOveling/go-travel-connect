
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ProfileFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isLoading: boolean;
}

const ProfileFormActions = ({ onCancel, onSave, isLoading }: ProfileFormActionsProps) => {
  return (
    <div className="flex space-x-3 pt-4">
      <Button
        variant="outline"
        onClick={onCancel}
        className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50"
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button
        onClick={onSave}
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
  );
};

export default ProfileFormActions;
