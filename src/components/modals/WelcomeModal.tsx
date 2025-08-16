import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, MapPin, Users, Calendar } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const welcomeSteps = [
    {
      icon: Sparkles,
      title: "¡Bienvenido a Go Travel Connect!",
      subtitle: "Tu aventura comienza aquí",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: MapPin,
      title: "Explora el Mundo",
      subtitle: "Descubre destinos increíbles",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Users,
      title: "Conecta con Viajeros",
      subtitle: "Comparte experiencias únicas",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Calendar,
      title: "Planifica tu Próxima Aventura",
      subtitle: "¡Estamos listos para comenzar!",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowConfetti(true);

      // Auto-advance through steps
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < welcomeSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1200);

      // Auto-close after 5 seconds
      const closeTimer = setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 5000);

      return () => {
        clearInterval(stepInterval);
        clearTimeout(closeTimer);
      };
    }
  }, [isOpen, onClose]);

  const currentStepData = welcomeSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-white to-orange-50 dark:from-purple-950/50 dark:via-background dark:to-orange-950/50">
        <div className="relative flex flex-col items-center justify-center text-center p-8 space-y-6">
          {/* Animated confetti background */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Main content */}
          <div className="relative z-10 space-y-6">
            {/* Animated icon */}
            <div
              className={`${currentStepData.bgColor} p-6 rounded-full inline-flex animate-scale-in`}
            >
              <IconComponent
                size={48}
                className={`${currentStepData.color} animate-pulse`}
              />
            </div>

            {/* Title and subtitle with animations */}
            <div className="space-y-3 animate-fade-in">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                {currentStepData.title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center space-x-2">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep
                      ? "bg-gradient-to-r from-purple-500 to-orange-500"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Loading bar at bottom */}
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="bg-gradient-to-r from-purple-500 to-orange-500 h-1 rounded-full transition-all duration-[5000ms] ease-linear"
                style={{ width: isOpen ? "100%" : "0%" }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
