import { useState, useEffect } from "react";
import { Loader2, MapPin, Sparkles, Search, Globe } from "lucide-react";

const loadingMessages = [
  "🔍 Explorando lugares increíbles...",
  "🌍 Buscando destinos únicos...",
  "✨ Descubriendo experiencias especiales...",
  "🗺️ Navegando el mundo por ti...",
  "🎯 Encontrando lugares perfectos...",
  "🚀 Conectando con lugares únicos...",
  "💫 Creando tu mapa de aventuras...",
];

const ExploreSearchLoader = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
        setIsVisible(true);
      }, 150);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Animated Icons */}
      <div className="relative mb-6">
        {/* Main rotating circle */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-spin">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full"></div>
            </div>
          </div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-6 h-6 text-purple-600 animate-pulse" />
          </div>
        </div>

        {/* Floating icons */}
        <div className="absolute -top-2 -right-2 animate-bounce">
          <MapPin className="w-4 h-4 text-orange-500" />
        </div>
        <div
          className="absolute -bottom-2 -left-2 animate-bounce"
          style={{ animationDelay: "0.5s" }}
        >
          <Globe className="w-4 h-4 text-blue-500" />
        </div>
        <div
          className="absolute top-1/2 -right-6 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <Sparkles className="w-3 h-3 text-yellow-500" />
        </div>
      </div>

      {/* Animated message */}
      <div className="text-center mb-4">
        <div
          className={`transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {loadingMessages[currentMessage]}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Estamos buscando los mejores lugares para ti
        </p>
      </div>

      {/* Loading dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mt-6">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ExploreSearchLoader;
