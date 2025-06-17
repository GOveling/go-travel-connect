
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormFieldsProps {
  fullName: string;
  setFullName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  userEmail: string;
}

const ProfileFormFields = ({ 
  fullName, 
  setFullName, 
  description, 
  setDescription, 
  userEmail 
}: ProfileFormFieldsProps) => {
  return (
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
          value={userEmail}
          disabled
          className="h-12 border-2 border-gray-100 bg-gray-50 rounded-xl text-gray-500"
        />
        <p className="text-xs text-gray-400">
          El email no se puede cambiar
        </p>
      </div>
    </div>
  );
};

export default ProfileFormFields;
