import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ESIMModalProps {
  isOpen: boolean;
  onClose: () => void;
  affiliateUrl?: string;
  onFinished?: () => void;
}

const COLORS = {
  primary: "#2946bf",
  accent: "#fc5f22",
  bg: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e5e7eb",
  success: "#16a34a",
  warning: "#dc4201",
};

const STEPS = ["Checklist", "Instalar", "Activar", "Consejos"];

const ESIMModal = ({ 
  isOpen, 
  onClose, 
  affiliateUrl = "https://holafly.com/?ref=TU_AFILIADO",
  onFinished 
}: ESIMModalProps) => {
  const [step, setStep] = useState<number>(0);
  const [osTab, setOsTab] = useState<"ios" | "android">("ios");
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const canGoBack = step > 0;
  const canGoNext = step < STEPS.length - 1;

  const stepTitle = useMemo(() => {
    switch (step) {
      case 0:
        return "Antes de comprar";
      case 1:
        return "Instalar eSIM";
      case 2:
        return "Activación y prueba";
      case 3:
        return "Consejos finales";
      default:
        return "";
    }
  }, [step]);

  const openAffiliate = async () => {
    try {
      window.open(affiliateUrl, '_blank');
      // TODO: registra evento de analytics si corresponde (e.g., Segment/Amplitude)
    } catch (e) {
      console.warn("No se pudo abrir el enlace de afiliado", e);
    }
  };

  const handlePrimaryCTA = () => {
    if (step === 0) {
      openAffiliate();
    } else if (step === 2) {
      // "He activado y funciona" - ir al paso de consejos
      setStep(3);
    } else if (step === 3) {
      // En el paso final, cerrar modal y resetear al inicio
      setStep(0);
      onClose();
      if (onFinished) {
        onFinished();
      } else {
        // 1) marca estado "eSIM activa" dentro de My Trips
        // 2) guarda proveedor, país/región, fechas, etc.
        // 3) opcional: analytics event
        toast({
          title: "eSIM Configurada",
          description: "Tu eSIM ha sido activada correctamente",
        });
      }
    } else {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const primaryLabel = useMemo(() => {
    if (step === 0) return "Comprar eSIM (HolaFly)";
    if (step === 1) return "Siguiente";
    if (step === 2) return "He activado y funciona";
    return "Listo, regresar";
  }, [step]);

  const secondaryLabel = useMemo(() => {
    if (step === 0) return "Ya compré, continuar";
    if (step === 1 || step === 2) return "Atrás";
    return "Cerrar";
  }, [step]);

  const onSecondary = () => {
    if (step === 0) setStep(1);
    else if (step === 1 || step === 2) setStep((s) => Math.max(s - 1, 0));
    else onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-bold text-slate-900 flex-1 pr-2">
            Comprar e instalar tu eSIM (HolaFly)
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 h-auto text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex px-3 py-2 gap-2 border-b border-gray-200 justify-between">
          {STEPS.map((label, idx) => {
            const active = idx === step;
            return (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-2 h-2 rounded-full mb-1 ${
                    active ? 'bg-[#2946bf]' : 'bg-gray-300'
                  }`}
                />
                <span 
                  className={`text-xs font-semibold truncate ${
                    active ? 'text-[#2946bf]' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-base font-bold text-slate-900 mb-3">{stepTitle}</h3>

          {step === 0 && (
            <div className="space-y-3">
              <Bullet>Tu equipo es <B>compatible</B> con eSIM y está <B>liberado</B>.</Bullet>
              <Bullet>Tienes <B>Wi-Fi estable</B> para la instalación.</Bullet>
              <Bullet>Definiste <B>destino</B> y <B>fechas</B> del viaje.</Bullet>
              <Bullet>Guardarás el <B>QR/activation code</B> (no transferible).</Bullet>
              <Note text="Algunos planes se activan al instalar y otros al conectarte en destino. Revísalo durante la compra." />
              <div className="mt-3 bg-slate-50 border border-gray-200 rounded-lg p-3">
                <p className="text-slate-900">
                  Serás redirigido a HolaFly. Comprando desde este enlace apoyas a GOveling.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {/* Tabs iPhone / Android */}
              <div className="flex gap-3 mb-3">
                <TabButton
                  label="iPhone"
                  active={osTab === "ios"}
                  onPress={() => setOsTab("ios")}
                />
                <TabButton
                  label="Android"
                  active={osTab === "android"}
                  onPress={() => setOsTab("android")}
                />
              </div>

              {osTab === "ios" ? (
                <div className="space-y-3">
                  <Numbered>Ve a <B>Ajustes → Datos móviles → Añadir eSIM</B>.</Numbered>
                  <Numbered>
                    Toca <B>"Usar código QR"</B> y escanea el QR de HolaFly desde otra pantalla.
                    Si estás en el mismo teléfono, usa <B>"Introducir detalles manualmente"</B> con
                    <B> SM-DP+</B> y <B>Activation Code</B>.
                  </Numbered>
                  <Numbered>
                    Línea predeterminada: mantén tu SIM para Llamadas/SMS si quieres; en <B>Datos móviles</B> selecciona
                    <B> eSIM HolaFly</B>.
                  </Numbered>
                  <Numbered>
                    Activa <B>Itinerancia de datos</B> para la eSIM: Ajustes → Datos móviles → eSIM → Itinerancia: <B>ON</B>.
                  </Numbered>
                  <Tip text="Si tu plan inicia al primer uso, espera a llegar a destino para activar Datos en la eSIM." />
                </div>
              ) : (
                <div className="space-y-3">
                  <Numbered>
                    Ve a <B>Ajustes → Red e Internet → SIMs → Añadir eSIM</B> (nombres varían por marca).
                  </Numbered>
                  <Numbered>
                    Escanea el <B>QR</B>. Si usas el mismo teléfono, ingresa <B>SM-DP+</B> y <B>Activation Code</B> manualmente.
                  </Numbered>
                  <Numbered>
                    En <B>SIM preferida para datos</B> elige <B>eSIM HolaFly</B>.
                  </Numbered>
                  <Numbered>
                    Activa <B>Itinerancia de datos</B> en la eSIM (Ajustes → Redes móviles → eSIM → Itinerancia: <B>ON</B>).
                  </Numbered>
                  <Tip text="Puedes dejar tu SIM física para llamadas/SMS y usar eSIM solo para Datos." />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Numbered>
                <B>En destino</B>, activa <B>Datos móviles</B> en la eSIM HolaFly.
              </Numbered>
              <Numbered>
                Si te dieron <B>APN</B>, configúralo (suele autoconfigurarse).
              </Numbered>
              <Numbered>Prueba conexión con el navegador.</Numbered>
              <button
                onClick={() => setHelpOpen((v) => !v)}
                className="text-sm font-bold text-[#fc5f22] mt-2 hover:underline"
              >
                {helpOpen ? "Ocultar" : "¿Problemas de conexión?"}
              </button>
              {helpOpen && (
                <div className="mt-2 bg-slate-100 border border-gray-200 rounded-lg p-3 space-y-2">
                  <Bullet>Activa/Desactiva <B>Modo Avión</B> y reinicia.</Bullet>
                  <Bullet>
                    Verifica que <B>Datos móviles</B> y <B>Itinerancia</B> estén en <B>ON</B> en la eSIM.
                  </Bullet>
                  <Bullet>
                    Comprueba que la eSIM esté seleccionada como <B>línea de Datos</B>.
                  </Bullet>
                  <Bullet>Desactiva VPN durante la instalación/activación.</Bullet>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Bullet>El QR/código suele ser <B>de un solo uso</B> y no transferible.</Bullet>
              <Bullet>No elimines la eSIM hasta terminar el viaje.</Bullet>
              <Bullet>
                Si no quieres cargos en tu SIM física, desactiva <B>Datos</B> o <B>Roaming</B> en esa línea.
              </Bullet>
              <Bullet>
                Soporte técnico y reembolsos: <B>directo con HolaFly</B> (según sus políticas).
              </Bullet>
              <Tip text='Se añadirá un recordatorio en Mis Viajes: "Activa la eSIM al aterrizar".' />
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="px-4 pt-3 pb-4 flex gap-3 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onSecondary}
            className="flex-1 border-[#2946bf] text-[#2946bf] hover:bg-[#2946bf]/5"
          >
            {secondaryLabel}
          </Button>
          <Button
            onClick={handlePrimaryCTA}
            className="flex-1 bg-[#2946bf] hover:bg-[#2946bf]/90"
          >
            {primaryLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Subcomponentes ---------- */

const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-bold text-slate-900">{children}</span>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-2 mb-2">
    <span className="text-[#fc5f22] mt-0.5">•</span>
    <p className="text-slate-900 flex-1">{children}</p>
  </div>
);

const Numbered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-2 mb-2">
    <span className="text-[#2946bf]">⟶</span>
    <p className="text-slate-900 flex-1">{children}</p>
  </div>
);

const Tip: React.FC<{ text: string }> = ({ text }) => (
  <div className="bg-blue-50 border-l-4 border-[#2946bf] p-3 rounded-lg mt-2">
    <p className="text-slate-900">{text}</p>
  </div>
);

const Note: React.FC<{ text: string }> = ({ text }) => (
  <div className="bg-orange-50 border-l-4 border-[#dc4201] p-3 rounded-lg mt-2">
    <p className="text-slate-900">{text}</p>
  </div>
);

const TabButton: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <button
    onClick={onPress}
    className={`px-4 py-2 rounded-full border border-[#2946bf] font-semibold ${
      active 
        ? 'bg-[#2946bf] text-white' 
        : 'bg-slate-50 text-[#2946bf] hover:bg-[#2946bf]/5'
    }`}
  >
    {label}
  </button>
);

export default ESIMModal;