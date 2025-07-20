
import { useEffect, useState } from "react";
import { Plane, MapPin } from "lucide-react";

interface FlightSearchAnimationProps {
  origin: string;
  destination: string;
}

const FlightSearchAnimation = ({ origin, destination }: FlightSearchAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Buscando vuelos disponibles...",
    "Comparando precios...",
    "Analizando horarios...",
    "Verificando disponibilidad...",
    "Casi listo..."
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg min-h-[400px]">
      {/* Route Display */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-sm">
          <MapPin size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700">{origin}</span>
        </div>
        
        <div className="relative">
          <div className="w-12 h-px bg-gradient-to-r from-blue-300 to-blue-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <Plane size={16} className="text-blue-500 rotate-90" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-sm">
          <MapPin size={16} className="text-green-500" />
          <span className="text-sm font-medium text-gray-700">{destination}</span>
        </div>
      </div>

      {/* Animated Plane */}
      <div className="relative w-full max-w-xs h-20 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        </div>
        
        {/* Animated clouds */}
        <div className="absolute top-2 left-4 w-8 h-4 bg-white rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-6 right-8 w-6 h-3 bg-white rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-1 right-4 w-4 h-2 bg-white rounded-full opacity-50 animate-pulse"></div>
        
        {/* Flying plane */}
        <div className="absolute top-1/2 transform -translate-y-1/2 animate-[slide-in-right_3s_ease-in-out_infinite]">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full shadow-lg">
            <Plane size={20} className="text-white rotate-45" />
          </div>
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 animate-fade-in">
          {steps[currentStep]}
        </h3>
        <p className="text-sm text-gray-600">
          Encontrando las mejores opciones para tu viaje
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Buscando...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Floating dots animation */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default FlightSearchAnimation;
