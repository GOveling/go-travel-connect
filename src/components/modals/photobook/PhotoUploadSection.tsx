
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoUploadSectionProps {
  onAddImageClick: () => void;
}

const PhotoUploadSection = ({ onAddImageClick }: PhotoUploadSectionProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-gray-800 mb-1">Add Your Memories</h3>
            <p className="text-sm text-gray-600">Upload photos to create beautiful memories</p>
          </div>

          <Button 
            onClick={onAddImageClick}
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
          >
            <Plus size={16} className="mr-2" />
            Add Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadSection;
