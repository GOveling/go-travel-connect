import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TravelpayoutsWidgetProps {
  flightType: "one-way" | "round-trip" | "multi-city";
}

const TravelpayoutsWidget = ({ flightType }: TravelpayoutsWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");

  useEffect(() => {
    if (flightType === "one-way" && containerRef.current && !showIframe) {
      const container = containerRef.current;

      // Limpiar cualquier widget anterior
      container.innerHTML = "";

      // Crear el script para el widget de "solo ida"
      const script = document.createElement("script");
      script.async = true;
      script.charset = "utf-8";
      script.src =
        "https://tpwdgt.com/content?trs=442255&shmarker=640483&locale=en&curr=USD&default_origin=Santiago&powered_by=true&border_radius=5&plain=true&color_button=%232681ff&color_button_text=%23ffffff&color_border=%232681ff&promo_id=4132&campaign_id=121";

      // Añadir el script al contenedor
      container.appendChild(script);

      // Interceptar clicks en enlaces para capturar la redirección
      const handleClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const link = target.closest("a");

        if (link && link.href && link.href.includes("aviasales")) {
          event.preventDefault();
          event.stopPropagation();

          // Capturar la URL y mostrar en iframe
          setIframeUrl(link.href);
          setShowIframe(true);
        }
      };

      // Añadir listener después de que el widget se cargue
      const addClickListener = () => {
        container.addEventListener("click", handleClick, true);
      };

      // Esperar a que el widget se renderice
      setTimeout(addClickListener, 2000);

      // Cleanup al desmontar
      return () => {
        container.removeEventListener("click", handleClick, true);
        container.innerHTML = "";
      };
    }
  }, [flightType, showIframe]);

  const handleBackToWidget = () => {
    setShowIframe(false);
    setIframeUrl("");
  };

  const handleOpenInNewTab = () => {
    if (iframeUrl) {
      window.open(iframeUrl, "_blank");
    }
  };

  if (flightType !== "one-way") {
    return null;
  }

  if (showIframe && iframeUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToWidget}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver al Buscador
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Abrir en Nueva Pestaña
          </Button>
        </div>
        <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-white">
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title="Resultados de Búsqueda de Vuelos"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>
        <p className="text-xs text-gray-500 text-center">
          Resultados powered by Travelpayouts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Buscar Vuelos Solo Ida</h3>
      <div
        ref={containerRef}
        className="w-full min-h-[400px] bg-white rounded-lg border p-4"
        style={{
          // Asegurar que el widget tenga espacio suficiente
          minHeight: "400px",
        }}
      />
      <p className="text-xs text-gray-500 text-center">
        Widget powered by Travelpayouts
      </p>
    </div>
  );
};

export default TravelpayoutsWidget;
