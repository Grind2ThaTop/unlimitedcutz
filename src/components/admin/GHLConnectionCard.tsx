import { useState } from 'react';
import { Zap, CheckCircle, XCircle, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ConnectionDiagnostics {
  length?: number;
  hasWhitespace?: boolean;
  hasBearerPrefix?: boolean;
  hasQuotes?: boolean;
  hasNewlines?: boolean;
  isJwtShaped?: boolean;
  issues?: string[];
  httpStatus?: number;
  ghlError?: string;
  jwtInfo?: {
    expiresIn?: string;
    isExpired?: boolean;
  };
}

interface ConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
  diagnostics?: ConnectionDiagnostics;
}

const GHLConnectionCard = () => {
  const [isTesting, setIsTesting] = useState(false);

  // Test GHL connection
  const testConnection = async (): Promise<ConnectionResult> => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ghl-core', {
        body: { action: 'test_connection' }
      });

      if (error) {
        const result: ConnectionResult = { 
          success: false, 
          error: error.message 
        };
        toast.error('GHL connection failed', {
          description: error.message
        });
        return result;
      }

      const result = data as ConnectionResult;

      if (result?.success) {
        toast.success('GHL connected successfully!', {
          description: result.message
        });
      } else {
        // Show detailed error with diagnostics
        const errorDesc = result?.error || 'Unknown error';
        const issues = result?.diagnostics?.issues;
        
        toast.error('GHL connection failed', {
          description: (
            <div className="space-y-1">
              <p>{errorDesc}</p>
              {issues && issues.length > 0 && (
                <ul className="text-xs list-disc list-inside opacity-80">
                  {issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          ),
          duration: 8000
        });
      }
      
      return result;
    } catch (err) {
      const result: ConnectionResult = { 
        success: false, 
        error: 'Failed to test connection' 
      };
      toast.error('Failed to test GHL connection');
      return result;
    } finally {
      setIsTesting(false);
    }
  };

  // Check connection status on load
  const { data: connectionStatus, isLoading, refetch } = useQuery({
    queryKey: ['ghlConnectionStatus'],
    queryFn: async (): Promise<ConnectionResult> => {
      try {
        const { data, error } = await supabase.functions.invoke('ghl-core', {
          body: { action: 'test_connection' }
        });
        
        if (error) {
          return { success: false, error: error.message };
        }
        
        return data as ConnectionResult;
      } catch {
        return { success: false, error: 'Connection check failed' };
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isConnected = connectionStatus?.success;
  const hasIssues = connectionStatus?.diagnostics?.issues && connectionStatus.diagnostics.issues.length > 0;

  const handleTestClick = async () => {
    await testConnection();
    refetch();
  };

  return (
    <Card className={isConnected ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
              <Zap className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-amber-500'}`} />
            </div>
            <div>
              <CardTitle className="text-base">GoHighLevel</CardTitle>
              <CardDescription className="text-xs">CRM Integration</CardDescription>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={isConnected 
              ? 'bg-green-500/10 text-green-500 border-green-500/30' 
              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
            ) : isConnected ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {isLoading ? 'Checking...' : isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestClick}
            disabled={isTesting || isLoading}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Test Connection
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://app.gohighlevel.com', '_blank')}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
        
        {/* Show error details */}
        {!isConnected && !isLoading && connectionStatus?.error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
            <div className="flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{connectionStatus.error}</span>
            </div>
          </div>
        )}
        
        {/* Show issues if connected but with warnings */}
        {isConnected && hasIssues && (
          <div className="text-xs text-amber-600 bg-amber-500/10 p-2 rounded-md">
            <div className="flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">Warnings:</span>
                <ul className="list-disc list-inside mt-1">
                  {connectionStatus.diagnostics?.issues?.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Setup instructions */}
        {!isConnected && !isLoading && (
          <p className="text-xs text-muted-foreground">
            Required secrets: <code className="bg-muted px-1 rounded">GHL_API_KEY</code> (Private Integration Token) and <code className="bg-muted px-1 rounded">GHL_LOCATION_ID</code>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GHLConnectionCard;
