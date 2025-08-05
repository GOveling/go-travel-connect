import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Vote, X, Plus, Users, CalendarIcon } from "lucide-react";
import { JollyRangeCalendar } from "@/components/ui/range-calendar";
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface CreateDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDecision: any | null;
  newDecision: {
    trip_id: string;
    title: string;
    description?: string;
    options: string[];
    end_date?: string;
    status: string;
    selected_participants: string[];
  };
  setNewDecision: (decision: any) => void;
  allParticipants: Collaborator[];
  onSave: (decisionData: any) => void;
}

const CreateDecisionModal = ({
  isOpen,
  onClose,
  editingDecision,
  newDecision,
  setNewDecision,
  allParticipants,
  onSave,
}: CreateDecisionModalProps) => {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const handleParticipantChange = (
    participantName: string,
    checked: boolean
  ) => {
    if (checked) {
      setNewDecision((prev) => ({
        ...prev,
        selected_participants: [...prev.selected_participants, participantName],
      }));
    } else {
      setNewDecision((prev) => ({
        ...prev,
        selected_participants: prev.selected_participants.filter(
          (name) => name !== participantName
        ),
      }));
    }
  };

  const handleSelectAll = () => {
    const allNames = allParticipants.map((p) => p.name);
    setNewDecision((prev) => ({
      ...prev,
      selected_participants: allNames,
    }));
  };

  const handleDeselectAll = () => {
    setNewDecision((prev) => ({
      ...prev,
      selected_participants: [],
    }));
  };

  const handleDateRangeChange = (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    if (range?.end) {
      const endDate = format(
        new Date(range.end.year, range.end.month - 1, range.end.day),
        "yyyy-MM-dd"
      );
      setNewDecision((prev) => ({
        ...prev,
        end_date: endDate,
      }));
      setIsDateRangeOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (newDecision.end_date) {
      return {
        start: parseDate(newDecision.end_date.split('T')[0]),
        end: parseDate(newDecision.end_date.split('T')[0]),
      };
    }
    return null;
  };

  const formatDateRange = () => {
    if (newDecision.end_date) {
      return format(new Date(newDecision.end_date), "dd/MM/yyyy");
    }
    return "Seleccionar fecha límite";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      modal={true}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] mx-auto"
        onPointerDownOutside={(e) => {
          const target = e.target as Element;
          if (target.closest("input, textarea, select, button")) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as Element;
          if (target.closest("input, textarea, select, button")) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Vote size={20} />
            <span>
              {editingDecision ? "Edit Decision" : "Create New Decision"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {editingDecision
              ? "Update the decision details below."
              : "Create a new decision for your group to vote on."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="decisionTitle" className="text-sm font-medium">
                Decision Title *
              </Label>
              <Input
                id="decisionTitle"
                placeholder="What should we decide on?"
                value={newDecision.title}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewDecision((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                }}
                onFocus={(e) => e.stopPropagation()}
                className="mt-1 h-12 text-base"
              />
            </div>

            <div>
              <Label
                htmlFor="decisionDescription"
                className="text-sm font-medium"
              >
                Description (Optional)
              </Label>
              <Input
                id="decisionDescription"
                placeholder="Add more details about this decision..."
                value={newDecision.description}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewDecision((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
                onFocus={(e) => e.stopPropagation()}
                className="mt-1 h-12 text-base"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Período de Votación</Label>
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 h-12 text-base",
                       !newDecision.end_date &&
                         "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <JollyRangeCalendar
                    value={getDateRangeValue()}
                    onChange={handleDateRangeChange}
                    minValue={today(getLocalTimeZone())}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label className="flex items-center space-x-2 mb-3 text-sm font-medium">
              <span>Options *</span>
              <span className="text-xs text-gray-500">
                (Minimum 2 required)
              </span>
            </Label>
            <div className="space-y-3">
              {newDecision.options.map((option, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newOptions = [...newDecision.options];
                      newOptions[index] = e.target.value;
                      setNewDecision((prev) => ({
                        ...prev,
                        options: newOptions,
                      }));
                    }}
                    onFocus={(e) => e.stopPropagation()}
                    className="flex-1 h-12 text-base"
                  />
                  {newDecision.options.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newOptions = newDecision.options.filter(
                          (_, i) => i !== index
                        );
                        setNewDecision((prev) => ({
                          ...prev,
                          options: newOptions,
                        }));
                      }}
                      className="h-12 w-full sm:w-12 shrink-0"
                    >
                      <X size={16} />
                      <span className="sm:hidden ml-2">Remove Option</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-10 w-full sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                setNewDecision((prev) => ({
                  ...prev,
                  options: [...prev.options, ""],
                }));
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Option
            </Button>
          </div>

          <div>
            <Label className="flex items-center space-x-2 mb-3 text-sm font-medium">
              <Users size={16} />
              <span>Select Voting Participants *</span>
            </Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-xs"
                >
                  Deselect All
                </Button>
              </div>
              <div className="border rounded-md p-3 space-y-3 max-h-48 overflow-y-auto">
                {allParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={`participant-${participant.id}`}
                      checked={newDecision.selected_participants.includes(
                        participant.name
                      )}
                      onCheckedChange={(checked) =>
                        handleParticipantChange(
                          participant.name,
                          checked as boolean
                        )
                      }
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor={`participant-${participant.id}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1 min-h-[44px]"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-sm text-white font-medium shrink-0">
                        {participant.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {participant.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {newDecision.selected_participants.length > 0 && (
                <p className="text-xs text-gray-600">
                  Selected participants:{" "}
                  {newDecision.selected_participants.join(", ")}
                </p>
              )}
              {newDecision.selected_participants.length === 0 && (
                <p className="text-xs text-red-500">
                  Please select at least one participant to vote on this
                  decision.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSave(newDecision);
              }}
              disabled={
                !newDecision.title ||
                newDecision.options.filter((opt) => opt.trim()).length < 2 ||
                newDecision.selected_participants.length === 0 ||
                !newDecision.end_date
              }
              className="w-full h-12 text-base"
            >
              {editingDecision ? "Update Decision" : "Create Decision"}
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-full h-12 text-base"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDecisionModal;
