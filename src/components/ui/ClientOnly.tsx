import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="w-full">
        {fallback || (
          <Card className="h-96 bg-gradient-to-br from-purple-100 to-orange-100 border-2 border-dashed border-purple-300">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-purple-600 mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Cargando Mapa...</h3>
                <p className="text-gray-600">Preparando vista interactiva</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ClientOnly;
