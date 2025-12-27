import { useState } from 'react';
import { Zap, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const GHLConnectionCard = () => {
  const [isTesting, setIsTesting] = useState(false);

  // Test GHL connection
  const testConnection = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ghl-core', {
        body: { 
          action: 'test_connection'
        }
      });

      if (error) {
        toast.error('GHL connection failed', {
          description: error.message
        });
        return false;
      }

      if (data?.success) {
        toast.success('GHL connected successfully!');
        return true;
      } else {
        toast.error('GHL connection failed', {
          description: data?.error || 'Unknown error'
        });
        return false;
      }
    } catch (err) {
      toast.error('Failed to test GHL connection');
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  // Check if GHL API key is configured
  const { data: connectionStatus, isLoading, refetch } = useQuery({
    queryKey: ['ghlConnectionStatus'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('ghl-core', {
          body: { action: 'test_connection' }
        });
        
        return {
          configured: !error && data?.success,
          message: data?.message || error?.message || 'Unknown status'
        };
      } catch {
        return { configured: false, message: 'Connection check failed' };
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isConnected = connectionStatus?.configured;

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
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              testConnection();
            }}
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
        {!isConnected && !isLoading && (
          <p className="text-xs text-muted-foreground mt-2">
            Add GHL_API_KEY secret to enable CRM sync
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GHLConnectionCard;
