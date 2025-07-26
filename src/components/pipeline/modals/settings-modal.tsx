import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface BackendCredentials {
  geminiApiKey?: string;
  googleCloudCredentials?: any;
  googleCloudProject?: string;
  vertexAiRegion?: string;
  gcsBucket?: string;
  elevenlabsApiKey?: string;
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentService: string;
  onServiceChange: (service: string) => void;
  onApiKeyUpdate?: (apiKey: string | null) => void;
  currentApiKey?: string | null;
  onBackendCredentialsUpdate?: (credentials: BackendCredentials) => void;
  currentBackendCredentials?: BackendCredentials;
  onResetStorage?: () => void;
  // Health check props to share with parent
  healthStatus?: 'checking' | 'healthy' | 'unhealthy' | 'unknown';
  onHealthCheck?: () => Promise<void>;
}

export default function SettingsModal({ 
  open, 
  onOpenChange, 
  currentService, 
  onServiceChange,
  onApiKeyUpdate,
  currentApiKey,
  onBackendCredentialsUpdate,
  currentBackendCredentials,
  onResetStorage,
  healthStatus = 'unknown',
  onHealthCheck
}: SettingsModalProps) {
  const [selectedService, setSelectedService] = useState(currentService);
  const [useCustomApiKey, setUseCustomApiKey] = useState(!!currentApiKey);
  const [customApiKey, setCustomApiKey] = useState(currentApiKey || '');
  
  // Backend credentials state
  const [backendCredentials, setBackendCredentials] = useState<BackendCredentials>({
    geminiApiKey: currentBackendCredentials?.geminiApiKey || '',
    googleCloudProject: currentBackendCredentials?.googleCloudProject || '',
    vertexAiRegion: currentBackendCredentials?.vertexAiRegion || 'us-central1',
    gcsBucket: currentBackendCredentials?.gcsBucket || '',
    elevenlabsApiKey: currentBackendCredentials?.elevenlabsApiKey || ''
  });
  const [gcCredentialsJson, setGcCredentialsJson] = useState('');
  
  // Health check state - now managed by parent
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const handleSave = () => {
    onServiceChange("gemini"); // Always use Gemini as the only service
    if (onApiKeyUpdate) {
      onApiKeyUpdate(useCustomApiKey && customApiKey.trim() ? customApiKey.trim() : null);
    }
    
    // Save backend credentials
    if (onBackendCredentialsUpdate) {
      const credentials: BackendCredentials = {
        ...backendCredentials,
        geminiApiKey: customApiKey.trim() || undefined
      };
      
      // Parse Google Cloud credentials JSON if provided
      if (gcCredentialsJson.trim()) {
        try {
          credentials.googleCloudCredentials = JSON.parse(gcCredentialsJson.trim());
        } catch (error) {
          alert('Invalid Google Cloud credentials JSON format');
          return;
        }
      }
      
      onBackendCredentialsUpdate(credentials);
    }
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedService(currentService);
    setUseCustomApiKey(!!currentApiKey);
    setCustomApiKey(currentApiKey || '');
    setBackendCredentials({
      geminiApiKey: currentBackendCredentials?.geminiApiKey || '',
      googleCloudProject: currentBackendCredentials?.googleCloudProject || '',
      vertexAiRegion: currentBackendCredentials?.vertexAiRegion || 'us-central1',
      gcsBucket: currentBackendCredentials?.gcsBucket || '',
      elevenlabsApiKey: currentBackendCredentials?.elevenlabsApiKey || ''
    });
    setGcCredentialsJson('');
    onOpenChange(false);
  };
  
  // Health check function - now uses parent's function
  const handleHealthCheck = useCallback(async () => {
    if (!onHealthCheck) return;
    
    setIsCheckingHealth(true);
    try {
      await onHealthCheck();
    } finally {
      setIsCheckingHealth(false);
      setLastHealthCheck(new Date());
    }
  }, [onHealthCheck]);
  
  // Check health when modal opens
  useEffect(() => {
    if (open && onHealthCheck) {
      handleHealthCheck();
    }
  }, [open, onHealthCheck, handleHealthCheck]);
  
  // Auto-refresh health check every 30 seconds when modal is open
  useEffect(() => {
    if (!open || !onHealthCheck) return;
    
    const interval = setInterval(handleHealthCheck, 30000);
    return () => clearInterval(interval);
  }, [open, onHealthCheck, handleHealthCheck]);
  
  const getHealthStatusDisplay = () => {
    switch (healthStatus) {
      case 'checking':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Checking...',
          className: 'bg-blue-500/20 text-blue-400 border-blue-400/30'
        };
      case 'healthy':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Service Online',
          className: 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
        };
      case 'unhealthy':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Service Offline',
          className: 'bg-red-500/20 text-red-400 border-red-400/30'
        };
      default:
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Unknown',
          className: 'bg-gray-500/20 text-gray-400 border-gray-400/30'
        };
    }
  };
  
  const healthDisplay = getHealthStatusDisplay();

  const handleResetStorage = () => {
    if (confirm('Are you sure you want to reset all pipeline data? This will clear all your configurations, connections, and saved data. This action cannot be undone.')) {
      onResetStorage?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Backend Service Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your backend credentials and monitor service health.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Backend Health Status */}
          <div className="bg-gray-700 p-4 rounded-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-300 font-medium mb-1">
                  Backend Service Status
                </p>
                <p className="text-xs text-gray-400">
                  FastAPI Summer School Service for video and audio generation
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHealthCheck}
                disabled={isCheckingHealth}
                className="bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500 text-xs px-2 py-1"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                Check
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={`${healthDisplay.className} text-xs flex items-center gap-1`}
              >
                {healthDisplay.icon}
                {healthDisplay.text}
              </Badge>
              
              {lastHealthCheck && (
                <span className="text-xs text-gray-500">
                  Last checked: {lastHealthCheck.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {healthStatus === 'unhealthy' && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-400/20 rounded text-xs text-red-400">
                ⚠️ Backend service is not accessible. Make sure your FastAPI server is running on the configured URL.
              </div>
            )}
          </div>

          {/* Gemini API Key Configuration */}
          <div className="border-t border-gray-600 pt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Gemini API Key Configuration
              </Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-custom-key"
                  checked={useCustomApiKey}
                  onCheckedChange={(checked) => setUseCustomApiKey(checked as boolean)}
                />
                <Label htmlFor="use-custom-key" className="text-sm text-gray-300 cursor-pointer">
                  Use custom Gemini API key
                </Label>
              </div>
              
              {useCustomApiKey && (
                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-sm text-gray-400">
                    Gemini API Key
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400">
                    Your API key will override the default key and be stored securely for this session.
                  </p>
                </div>
              )}
              
              {!useCustomApiKey && (
                <p className="text-xs text-gray-400">
                  Using default Gemini API key. Enable custom key option to use your own.
                </p>
              )}
            </div>
          </div>

          {/* Backend Configuration */}
          <div className="border-t border-gray-600 pt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Backend Service Credentials
              </Label>
              <p className="text-xs text-gray-400">
                Required for video and audio generation via your FastAPI backend
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="gcp-project" className="text-sm text-gray-400">
                    Google Cloud Project ID
                  </Label>
                  <Input
                    id="gcp-project"
                    placeholder="your-project-id"
                    value={backendCredentials.googleCloudProject}
                    onChange={(e) => setBackendCredentials(prev => ({ ...prev, googleCloudProject: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gcs-bucket" className="text-sm text-gray-400">
                    Google Cloud Storage Bucket
                  </Label>
                  <Input
                    id="gcs-bucket"
                    placeholder="your-bucket-name"
                    value={backendCredentials.gcsBucket}
                    onChange={(e) => setBackendCredentials(prev => ({ ...prev, gcsBucket: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vertex-region" className="text-sm text-gray-400">
                    Vertex AI Region
                  </Label>
                  <Input
                    id="vertex-region"
                    placeholder="us-central1"
                    value={backendCredentials.vertexAiRegion}
                    onChange={(e) => setBackendCredentials(prev => ({ ...prev, vertexAiRegion: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="elevenlabs-key" className="text-sm text-gray-400">
                    ElevenLabs API Key (for audio generation)
                  </Label>
                  <Input
                    id="elevenlabs-key"
                    type="password"
                    placeholder="sk_..."
                    value={backendCredentials.elevenlabsApiKey}
                    onChange={(e) => setBackendCredentials(prev => ({ ...prev, elevenlabsApiKey: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gc-credentials" className="text-sm text-gray-400">
                    Google Cloud Service Account JSON
                  </Label>
                  <textarea
                    id="gc-credentials"
                    placeholder='{ "type": "service_account", "project_id": "...", ... }'
                    value={gcCredentialsJson}
                    onChange={(e) => setGcCredentialsJson(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-500 rounded-md px-3 py-2 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Paste your service account JSON here for video generation
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Reset Section */}
        <div className="mt-8 pt-6 border-t border-gray-600">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              🗑️ Reset Pipeline Data
            </Label>
            <p className="text-xs text-gray-400">
              Clear all saved configurations, connections, and data from local storage. This cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={handleResetStorage}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Reset All Data
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}