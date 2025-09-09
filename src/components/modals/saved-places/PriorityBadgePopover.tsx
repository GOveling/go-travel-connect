import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SavedPlace } from "@/types";

interface PriorityBadgePopoverProps {
  place: SavedPlace;
  onUpdate: () => void;
}

const priorityOptions = {
  high: { label: "Alta", color: "bg-red-500 text-white", variant: "destructive" as const },
  medium: { label: "Media", color: "bg-yellow-500 text-white", variant: "secondary" as const },
  low: { label: "Baja", color: "bg-gray-500 text-white", variant: "outline" as const }
};

export const PriorityBadgePopover = ({ place, onUpdate }: PriorityBadgePopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<"high" | "medium" | "low">(place.priority || "medium");
  const [note, setNote] = useState(place.reminderNote || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debug logs
  console.log("PriorityBadgePopover render:", { 
    place: place.name, 
    priority: place.priority, 
    reminderNote: place.reminderNote,
    isOpen 
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("saved_places")
        .update({
          priority: selectedPriority,
          reminder_note: note.trim() || null
        })
        .eq("id", place.id);

      if (error) throw error;

      toast({
        title: "Actualizado",
        description: "La prioridad y nota se han actualizado correctamente",
      });

      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating place:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentPriority = priorityOptions[selectedPriority as keyof typeof priorityOptions] || priorityOptions.medium;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="outline-none focus:outline-none inline-flex"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge 
              variant={currentPriority.variant}
              className={`cursor-pointer hover:opacity-80 transition-opacity ${currentPriority.color} relative z-10`}
            >
              {currentPriority.label}
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 z-[99999] bg-white border shadow-lg" 
          align="start" 
          side="bottom"
          sideOffset={5}
          avoidCollisions={true}
        >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Prioridad</h4>
            <div className="flex gap-2">
              {Object.entries(priorityOptions).map(([value, option]) => (
                <Button
                  key={value}
                  variant={selectedPriority === value ? "default" : "outline"}
                  size="sm"
                  className={selectedPriority === value ? option.color : ""}
                  onClick={() => setSelectedPriority(value as "high" | "medium" | "low")}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Nota de recordatorio</h4>
            <Textarea
              placeholder="¿Por qué agregaste este lugar? (máx. 200 caracteres)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              className="resize-none"
              rows={3}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {note.length}/200 caracteres
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};