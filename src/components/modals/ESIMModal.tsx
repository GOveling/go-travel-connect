import { useEffect, useRef } from "react";
import { Smartphone, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ESIMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ESIMModal = ({ isOpen, onClose }: ESIMModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current;
      
      // Limpiar cualquier script anterior
      container.innerHTML = "";

      // Crear el script para el widget de eSIM
      const script = document.createElement("script");
      script.async = true;
      script.charset = "utf-8";
      script.src = "https://tpwdgt.com/content?trs=442255&shmarker=640483&locale=en&powered_by=true&color_button=%235C7DEC&color_focused=%235C7DEC&secondary=%23FFFFFF&dark=%2311100f&light=%23FFFFFF&special=%23C4C4C400&border_radius=5&plain=false&no_labels=true&promo_id=8588&campaign_id=541";

      // Añadir el script al document head en lugar del contenedor
      document.head.appendChild(script);

      // Crear un div para el widget
      const widgetDiv = document.createElement("div");
      widgetDiv.id = "tpwidget_container";
      container.appendChild(widgetDiv);

      // Cleanup al cerrar
      return () => {
        container.innerHTML = "";
        // Remover el script del head
        const existingScript = document.querySelector(`script[src*="tpwdgt.com"]`);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Smartphone size={24} />
            <div>
              <h2 className="text-xl font-bold">eSIM Data Plans</h2>
              <p className="text-sm opacity-90">
                Stay connected while traveling
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div
            ref={containerRef}
            className="w-full min-h-[400px] bg-background rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ESIMModal;
