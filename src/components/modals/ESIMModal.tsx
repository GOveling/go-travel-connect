import { useEffect, useRef } from "react";
import { Smartphone, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ClientOnly from "@/components/ui/ClientOnly";

interface ESIMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ESIMModal = ({ isOpen, onClose }: ESIMModalProps) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && widgetRef.current) {
      // Clear any existing content
      widgetRef.current.innerHTML = "";
      
      // Create the script element
      const script = document.createElement("script");
      script.async = true;
      script.charset = "utf-8";
      script.src = "https://tpwdgt.com/content?trs=442255&shmarker=640483&locale=en&powered_by=true&color_button=%232A7AE8ff&color_focused=%232A7AE8FF&secondary=%23FFFFFF&dark=%2311100f&light=%23FFFFFF&special=%23C4C4C4&border_radius=5&plain=false&no_labels=true&promo_id=8588&campaign_id=541";
      
      // Add script to the widget container
      widgetRef.current.appendChild(script);
      
      // Cleanup function
      return () => {
        if (widgetRef.current) {
          widgetRef.current.innerHTML = "";
        }
      };
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 p-2 h-10 w-10"
          >
            <X size={20} />
          </Button>
          <div className="flex items-center space-x-3">
            <Smartphone size={28} />
            <div>
              <h2 className="text-2xl font-bold">eSIM Data Plans</h2>
              <p className="text-sm opacity-90 mt-1">
                Stay connected anywhere in the world
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-muted-foreground">
              Choose from our selection of global eSIM data plans. No physical SIM required - activate instantly!
            </p>
          </div>
          
          <ClientOnly fallback={
            <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Loading eSIM plans...</p>
              </div>
            </div>
          }>
            <div
              ref={widgetRef}
              className="w-full min-h-[500px] bg-background rounded-lg border"
            />
          </ClientOnly>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ESIMModal;