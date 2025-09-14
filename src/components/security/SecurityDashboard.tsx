// Security dashboard for monitoring encryption status and security events
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  ShieldCheck, 
  Key, 
  FileText, 
  MapPin, 
  CreditCard, 
  User, 
  AlertTriangle,
  Trash2,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSecurityLogs, clearSecurityLogs, type SecurityAuditLog } from "@/utils/securityUtils";
import { encryptionService } from "@/utils/unifiedEncryption";
import EncryptionIndicator from "./EncryptionIndicator";

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>([]);
  const [encryptionStats, setEncryptionStats] = useState({
    profiles: { encrypted: 0, total: 0 },
    documents: { encrypted: 0, total: 0 },
    locations: { encrypted: 0, total: 0 },
    expenses: { encrypted: 0, total: 0 }
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    const logs = getSecurityLogs();
    setSecurityLogs(logs);
    
    // Count encrypted data from localStorage
    if (user?.id) {
      const stats = {
        profiles: { 
          encrypted: localStorage.getItem(`encrypted_profile_${user.id}`) ? 1 : 0, 
          total: 1 
        },
        documents: { 
          encrypted: Object.keys(localStorage).filter(key => 
            key.startsWith(`encrypted_documents_${user.id}`)
          ).length, 
          total: Object.keys(localStorage).filter(key => 
            key.includes(`documents_${user.id}`)
          ).length 
        },
        locations: { 
          encrypted: Object.keys(localStorage).filter(key => 
            key.startsWith(`encrypted_locations_${user.id}`)
          ).length, 
          total: Object.keys(localStorage).filter(key => 
            key.includes(`locations_${user.id}`)
          ).length 
        },
        expenses: { 
          encrypted: Object.keys(localStorage).filter(key => 
            key.startsWith(`encrypted_expenses_${user.id}`)
          ).length, 
          total: Object.keys(localStorage).filter(key => 
            key.includes(`expenses_${user.id}`)
          ).length 
        }
      };
      setEncryptionStats(stats);
    }
  };

  const handleClearLogs = () => {
    clearSecurityLogs();
    setSecurityLogs([]);
  };

  const handleClearEncryptionCache = () => {
    encryptionService.clearKeyCache();
  };

  const exportSecurityLogs = () => {
    const dataStr = JSON.stringify(securityLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Panel de Seguridad</h2>
          <p className="text-muted-foreground">
            Monitoreo y control de la encriptación y seguridad de la aplicación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearEncryptionCache}>
            <Key className="mr-2 h-4 w-4" />
            Limpiar Cache
          </Button>
          <Button variant="outline" onClick={exportSecurityLogs}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="encryption">Encriptación</TabsTrigger>
          <TabsTrigger value="logs">Logs de Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Perfil</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{encryptionStats.profiles.encrypted}/{encryptionStats.profiles.total}</div>
                <EncryptionIndicator 
                  isEncrypted={encryptionStats.profiles.encrypted > 0}
                  sensitivityLevel="medium"
                  isOffline={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{encryptionStats.documents.encrypted}/{encryptionStats.documents.total}</div>
                <EncryptionIndicator 
                  isEncrypted={encryptionStats.documents.encrypted > 0}
                  sensitivityLevel="critical"
                  isOffline={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{encryptionStats.locations.encrypted}/{encryptionStats.locations.total}</div>
                <EncryptionIndicator 
                  isEncrypted={encryptionStats.locations.encrypted > 0}
                  sensitivityLevel="high"
                  isOffline={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{encryptionStats.expenses.encrypted}/{encryptionStats.expenses.total}</div>
                <EncryptionIndicator 
                  isEncrypted={encryptionStats.expenses.encrypted > 0}
                  sensitivityLevel="high"
                  isOffline={true}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Estado de Encriptación por Sector
              </CardTitle>
              <CardDescription>
                Monitoreo del cifrado AES-256 en todos los sectores sensibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Datos de Perfil</h4>
                      <p className="text-sm text-muted-foreground">Información personal y configuración</p>
                    </div>
                  </div>
                  <EncryptionIndicator 
                    isEncrypted={encryptionStats.profiles.encrypted > 0}
                    sensitivityLevel="medium"
                    isOffline={true}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">Documentos de Viaje</h4>
                      <p className="text-sm text-muted-foreground">Pasaportes, visas y documentos oficiales</p>
                    </div>
                  </div>
                  <EncryptionIndicator 
                    isEncrypted={encryptionStats.documents.encrypted > 0}
                    sensitivityLevel="critical"
                    isOffline={true}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Datos de Ubicación</h4>
                      <p className="text-sm text-muted-foreground">Coordenadas GPS y lugares visitados</p>
                    </div>
                  </div>
                  <EncryptionIndicator 
                    isEncrypted={encryptionStats.locations.encrypted > 0}
                    sensitivityLevel="high"
                    isOffline={true}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    <div>
                      <h4 className="font-medium">Información Financiera</h4>
                      <p className="text-sm text-muted-foreground">Gastos y transacciones de viaje</p>
                    </div>
                  </div>
                  <EncryptionIndicator 
                    isEncrypted={encryptionStats.expenses.encrypted > 0}
                    sensitivityLevel="high"
                    isOffline={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Registro de Eventos de Seguridad
              </CardTitle>
              <CardDescription>
                Últimos {securityLogs.length} eventos de seguridad registrados
              </CardDescription>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClearLogs}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpiar Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay eventos de seguridad registrados
                  </p>
                ) : (
                  securityLogs.slice(0, 50).map((log, index) => (
                    <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getThreatLevelColor(log.threatLevel)}>
                            {log.threatLevel}
                          </Badge>
                          <span className="font-medium">{log.event}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;