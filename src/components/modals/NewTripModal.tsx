import { Plane } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNewTripForm } from "@/hooks/useNewTripForm";
import NewTripBasicInfo from "./new-trip/NewTripBasicInfo";
import NewTripDetails from "./new-trip/NewTripDetails";

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (tripData: any) => void;
}

const NewTripModal = ({ isOpen, onClose, onCreateTrip }: NewTripModalProps) => {
  const {
    formData,
    nameError,
    handleInputChange,
    handleNameChange,
    handleDateRangeChange,
    handleNotSureYet,
    handleSubmit
  } = useNewTripForm(onCreateTrip, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            <Plane className="text-blue-600" size={20} />
            <span>Create New Trip</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 px-1">
          <NewTripBasicInfo
            formData={formData}
            nameError={nameError}
            onNameChange={handleNameChange}
            onInputChange={handleInputChange}
            onDateRangeChange={handleDateRangeChange}
            onNotSureYet={handleNotSureYet}
          />

          <NewTripDetails
            formData={formData}
            onInputChange={handleInputChange}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
            >
              Create Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTripModal;