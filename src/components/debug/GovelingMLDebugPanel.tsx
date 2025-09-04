import { useState } from "react";
import { 
  Settings, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Zap,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useGovelingML } from "@/hooks/useGovelingML";
import { 
  govelingMLConfig, 
  isGovelingMLConfigured, 
  getConfigMessage 
} from "../../config/govelingML";
import type { GovelingMLResponse } from "../../services/govelingML";

interface GovelingMLDebugPanelProps {
  lastResponse?: GovelingMLResponse | null;
}

export const GovelingMLDebugPanel = ({ lastResponse }: GovelingMLDebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { checkApiHealth, isHealthChecking, lastError } = useGovelingML();
  
  const isConfigured = isGovelingMLConfigured();
  
  const handleTestAPI = async () => {
    await checkApiHealth();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Settings className="w-4 h-4 mr-2" />
          API Debug & Configuration
          {!isConfigured && <AlertCircle className="w-4 h-4 ml-2 text-amber-500" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 mt-4">
        {/* Configuration Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Status:</span>
              {isConfigured ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Configured
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base URL:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {govelingMLConfig.baseUrl}
              </code>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {getConfigMessage()}
            </div>
            
            {isConfigured && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestAPI}
                  disabled={isHealthChecking}
                >
                  {isHealthChecking ? "Testing..." : "Test Connection"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(govelingMLConfig.docsUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  API Docs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Health:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {govelingMLConfig.healthEndpoint}
              </code>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Generate:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {govelingMLConfig.generateEndpoint}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Error Information */}
        {lastError && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Last Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-600">
                <div>Status: {lastError.statusCode}</div>
                <div>Message: {lastError.message}</div>
                {lastError.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">Details</summary>
                    <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(lastError.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Response */}
        {lastResponse && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Last Successful Response
              </CardTitle>
              <CardDescription className="text-xs">
                Generated {lastResponse.analytics.total_activities} activities across {lastResponse.analytics.total_days} days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Efficiency:</span>
                  <div className="font-medium text-green-600">
                    {lastResponse.analytics.optimization_efficiency.toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Mode:</span>
                  <div className="font-medium">
                    {lastResponse.analytics.optimization_mode.replace('_', ' ')}
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Generation Time:</span>
                  <div className="font-medium">
                    {lastResponse.metadata.generation_time.toFixed(2)}s
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">ML Model:</span>
                  <div className="font-medium">
                    v{lastResponse.metadata.ml_model_version}
                  </div>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Transport Recommendations
                </summary>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium">Walking</div>
                    <div className="text-muted-foreground">
                      {lastResponse.analytics.transport_recommendations.walking}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Driving</div>
                    <div className="text-muted-foreground">
                      {lastResponse.analytics.transport_recommendations.driving}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Transit</div>
                    <div className="text-muted-foreground">
                      {lastResponse.analytics.transport_recommendations.transit}%
                    </div>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        {!isConfigured && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                To enable Goveling ML API integration:
              </div>
              
              <ol className="text-xs space-y-1 ml-4">
                <li>1. Add environment variable in your .env file:</li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">
                    VITE_GOVELING_ML_API_URL=https://your-service.onrender.com
                  </code>
                </li>
                <li>2. Restart your development server</li>
                <li>3. Test the connection using the button above</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
