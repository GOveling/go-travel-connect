
import { useState } from "react";
import { Camera, Upload, Image, Download, Book, X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  image: string;
}

interface PhotobookModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

const PhotobookModal = ({ trip, isOpen, onClose }: PhotobookModalProps) => {
  const [photobookTitle, setPhotobookTitle] = useState("");
  const [photobookDescription, setPhotobookDescription] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Mock photos for the trip
  const mockPhotos = [
    "📸", "🌅", "🏛️", "🍕", "🚆", "🎨", "🌃", "🥘", 
    "⛪", "🌊", "🗼", "🍷", "🌺", "🏖️", "🌴", "🦋"
  ];

  const handlePhotoSelect = (photo: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photo) 
        ? prev.filter(p => p !== photo)
        : [...prev, photo]
    );
  };

  const handleCreatePhotobook = () => {
    // Here you would implement the actual photobook creation logic
    console.log("Creating photobook:", {
      trip: trip?.name,
      title: photobookTitle,
      description: photobookDescription,
      photos: selectedPhotos
    });
    onClose();
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Book className="text-green-600" size={24} />
            <span>Create Photobook for {trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 p-1">
          {/* Photobook Details */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-800 mb-3">Photobook Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={`${trip.name} Memories`}
                  value={photobookTitle}
                  onChange={(e) => setPhotobookTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell the story of your amazing journey..."
                  value={photobookDescription}
                  onChange={(e) => setPhotobookDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Add Photos</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600 mb-2">Drag & drop photos here or click to browse</p>
                <Button variant="outline" className="mb-2">
                  <Camera size={16} className="mr-2" />
                  Upload Photos
                </Button>
                <p className="text-xs text-gray-500">Support for JPG, PNG, HEIC files</p>
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Select Photos</h3>
                <span className="text-sm text-gray-600">
                  {selectedPhotos.length} selected
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {mockPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className={`aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all ${
                      selectedPhotos.includes(photo)
                        ? 'ring-2 ring-green-500 bg-green-50'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePhotoSelect(photo)}
                  >
                    {photo}
                    {selectedPhotos.includes(photo) && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photobook Options */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Photobook Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-lg font-medium text-gray-800">Standard</div>
                  <div className="text-sm text-gray-600">8x10 inches</div>
                  <div className="text-lg font-bold text-green-600 mt-2">$24.99</div>
                </div>
                <div className="p-3 border-2 border-green-500 rounded-lg text-center bg-green-50">
                  <div className="text-lg font-medium text-gray-800">Premium</div>
                  <div className="text-sm text-gray-600">10x12 inches</div>
                  <div className="text-lg font-bold text-green-600 mt-2">$39.99</div>
                  <div className="text-xs text-green-600 font-medium">Most Popular</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-lg font-medium text-gray-800">Deluxe</div>
                  <div className="text-sm text-gray-600">12x14 inches</div>
                  <div className="text-lg font-bold text-green-600 mt-2">$54.99</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            onClick={handleCreatePhotobook}
            disabled={selectedPhotos.length === 0}
          >
            <Book size={16} className="mr-2" />
            Create Photobook
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotobookModal;
