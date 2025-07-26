import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';

interface ProgressInfo {
  progress: number;
  currentStep: string;
  message?: string;
  status: 'queued' | 'started' | 'finished' | 'failed';
}

interface ProcessingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: 'video' | 'audio';
  evidenceData?: any;
  styleData?: any;
  visualStylingData?: any;
  personalData?: any;
  promptText?: string;
  customApiKey?: string | null;
  backendCredentials?: {
    googleCloudCredentials?: any;
    googleCloudProject?: string;
    vertexAiRegion?: string;
    gcsBucket?: string;
    elevenlabsApiKey?: string;
  };
  onComplete?: (result: GenerationResult) => void;
  onCancel?: () => void;
}

export interface GenerationResult {
  id: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  format: 'video' | 'audio';
  duration?: number;
  fileSize?: number;
}

export default function ProcessingModal({
  open,
  onOpenChange,
  format,
  evidenceData,
  styleData,
  visualStylingData,
  personalData,
  promptText,
  customApiKey,
  backendCredentials,
  onComplete,
  onCancel
}: ProcessingModalProps) {
  const [progressInfo, setProgressInfo] = useState<ProgressInfo>({
    progress: 0,
    currentStep: 'Initializing...',
    status: 'queued'
  });
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canCancel, setCanCancel] = useState(true);


  // Real processing with API calls
  useEffect(() => {
    if (!open) return;

    let pollInterval: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    let websocket: WebSocket | null = null;
    let websocketConnected = false;

    const startProcessing = async () => {
      try {
        setProgressInfo({
          progress: 0,
          currentStep: 'Starting generation...',
          status: 'started'
        });
        setError(null);
        setCanCancel(true);

        // Prepare API request
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        // Start generation
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            format,
            prompt: promptText || 'Generate health content based on the provided data.',
            evidenceData,
            styleData,
            visualStylingData,
            personalData,
            customApiKey,
            googleCloudCredentials: backendCredentials?.googleCloudCredentials,
            googleCloudProject: backendCredentials?.googleCloudProject,
            vertexAiRegion: backendCredentials?.vertexAiRegion || 'us-central1',
            gcsBucket: backendCredentials?.gcsBucket,
            elevenlabsApiKey: backendCredentials?.elevenlabsApiKey
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to start generation');
        }

        const { jobId: newJobId } = await response.json();

        // Immediately save job to local storage for gallery tracking
        try {
          const savedHistory = localStorage.getItem('pipeline-builder-generation-history');
          const history = savedHistory ? JSON.parse(savedHistory) : [];
          
          const newItem = {
            id: newJobId,
            title: `Generating ${format === 'video' ? 'Video' : 'Podcast'} Content`,
            format,
            status: 'started',
            downloadUrl: null,
            thumbnailUrl: null,
            duration: null,
            fileSize: null,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            progress: 0,
            evidenceData: evidenceData ? {
              fileName: evidenceData.fileName,
              hasContent: !!evidenceData.fileContent
            } : null,
            styleData: styleData ? {
              tone: styleData.tone,
              isAIGenerated: styleData.isAIGenerated
            } : null,
            personalData: personalData ? {
              hasMetrics: !!(personalData.metrics && Object.keys(personalData.metrics).length > 0)
            } : null
          };
          
          history.unshift(newItem);
          localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(history));
        } catch (error) {
          console.error('Failed to save job to gallery:', error);
        }

        // Try to establish WebSocket connection first
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const websocketUrl = `ws://${backendUrl.replace('http://', '').replace('https://', '')}/ws/${newJobId}`;
        try {
          websocket = new WebSocket(websocketUrl);
          
          websocket.onopen = () => {
            console.log('WebSocket connected for real-time progress');
            websocketConnected = true;
          };
          
          websocket.onmessage = (event) => {
            try {
              const progressData = JSON.parse(event.data);
              handleProgressUpdate(progressData, newJobId);
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          };
          
          websocket.onerror = (error) => {
            console.warn('WebSocket error, falling back to polling:', error);
            websocketConnected = false;
          };
          
          websocket.onclose = () => {
            console.log('WebSocket connection closed');
            websocketConnected = false;
          };
        } catch (error) {
          console.warn('WebSocket not available, using polling:', error);
        }
        
        // Fallback to polling if WebSocket fails or for backup
        let stepIndex = 0;
        pollInterval = setInterval(async () => {
          // Skip polling if WebSocket is working unless it's been too long
          if (websocketConnected) {
            return;
          }
          try {
            const statusResponse = await fetch(`/api/generate/${newJobId}`);

            if (!statusResponse.ok) {
              throw new Error('Failed to check generation status');
            }

            const statusData = await statusResponse.json();
            
            handleProgressUpdate(statusData, newJobId);


            // All progress handling is now done in handleProgressUpdate

          } catch (pollError) {
            console.error('Polling error:', pollError);
            retryCount++;
            if (retryCount >= maxRetries) {
              console.error('Max polling retries exceeded, stopping');
              clearInterval(pollInterval);
              setProgressInfo({
                progress: 0,
                currentStep: 'Connection failed',
                status: 'failed'
              });
              setError('Failed to check generation status');
              setCanCancel(false);
            }
            // Continue polling on minor errors up to max retries
          }
        }, websocketConnected ? 10000 : 3000); // Poll less frequently if WebSocket is working

      } catch (error: any) {
        console.error('Processing error:', error);
        setProgressInfo({
          progress: 0,
          currentStep: 'Failed to start',
          status: 'failed'
        });
        setError(error.message || 'Failed to start generation');
        setCanCancel(false);

        // Save error to gallery if we have a job ID
        try {
          const savedHistory = localStorage.getItem('pipeline-builder-generation-history');
          if (savedHistory) {
            const history = JSON.parse(savedHistory);
            // Find the most recent item that might be this failed job
            const recentItem = history[0];
            if (recentItem && recentItem.status === 'started') {
              recentItem.status = 'failed';
              recentItem.error = error.message || 'Failed to start generation';
              recentItem.lastUpdated = new Date().toISOString();
              localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(history));
            }
          }
        } catch (storageError) {
          console.error('Failed to update gallery with startup error:', storageError);
        }
      }
    };

    startProcessing();

    // Helper function to handle progress updates from both WebSocket and polling
    const handleProgressUpdate = (statusData: any, jobId: string) => {
      // Update progress info directly from server response
      setProgressInfo({
        progress: statusData.progress || 0,
        currentStep: statusData.current_step || statusData.currentStep || 'Processing...',
        message: statusData.message,
        status: statusData.status || 'started'
      });

      // Update gallery item with current progress
      try {
        const savedHistory = localStorage.getItem('pipeline-builder-generation-history');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          const itemIndex = history.findIndex((item: any) => item.id === jobId);
          if (itemIndex !== -1) {
            history[itemIndex] = {
              ...history[itemIndex],
              progress: statusData.progress || 0,
              status: statusData.status || 'started',
              currentStep: statusData.current_step || statusData.currentStep || 'Processing',
              message: statusData.message,
              lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(history));
          }
        }
      } catch (error) {
        console.error('Failed to update gallery item:', error);
      }

      if (statusData.status === 'finished') {
        if (pollInterval) clearInterval(pollInterval);
        if (websocket) websocket.close();

        setProgressInfo({
          progress: 100,
          currentStep: 'Completed',
          status: 'finished'
        });
        setCanCancel(false);

        const result: GenerationResult = {
          id: jobId,
          downloadUrl: statusData.downloadUrl || statusData.download_url || '',
          thumbnailUrl: statusData.thumbnailUrl || statusData.thumbnail_url,
          format,
          duration: statusData.duration || (format === 'video' ? 8 : 180),
          fileSize: statusData.fileSize || statusData.file_size || (format === 'video' ? 25600000 : 5120000)
        };
        setResult(result);

        // Update gallery item with final result
        try {
          const savedHistory = localStorage.getItem('pipeline-builder-generation-history');
          if (savedHistory) {
            const history = JSON.parse(savedHistory);
            const itemIndex = history.findIndex((item: any) => item.id === jobId);
            if (itemIndex !== -1) {
              history[itemIndex] = {
                ...history[itemIndex],
                status: 'finished',
                downloadUrl: statusData.downloadUrl || statusData.download_url || '',
                thumbnailUrl: statusData.thumbnailUrl || statusData.thumbnail_url,
                duration: statusData.duration || (format === 'video' ? 8 : 180),
                fileSize: statusData.fileSize || statusData.file_size || (format === 'video' ? 25600000 : 5120000),
                progress: 100,
                currentStep: 'Completed',
                lastUpdated: new Date().toISOString()
              };
              localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(history));
            }
          }
        } catch (error) {
          console.error('Failed to update gallery item with final result:', error);
        }

      } else if (statusData.status === 'failed') {
        if (pollInterval) clearInterval(pollInterval);
        if (websocket) websocket.close();
        
        setProgressInfo({
          progress: statusData.progress || 0,
          currentStep: 'Failed',
          status: 'failed'
        });
        setError(statusData.error || statusData.message || 'Generation failed');
        setCanCancel(false);

        // Update gallery item with error status
        try {
          const savedHistory = localStorage.getItem('pipeline-builder-generation-history');
          if (savedHistory) {
            const history = JSON.parse(savedHistory);
            const itemIndex = history.findIndex((item: any) => item.id === jobId);
            if (itemIndex !== -1) {
              history[itemIndex] = {
                ...history[itemIndex],
                status: 'failed',
                error: statusData.error || statusData.message || 'Generation failed',
                currentStep: 'Failed',
                lastUpdated: new Date().toISOString()
              };
              localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(history));
            }
          }
        } catch (error) {
          console.error('Failed to update gallery item with error:', error);
        }
      }
    };

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (websocket) {
        websocket.close();
      }
    };
  }, [open, format, promptText, evidenceData, styleData, personalData, customApiKey, backendCredentials]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleComplete = () => {
    if (result && onComplete) {
      onComplete(result);
    }
    onOpenChange(false);
  };

  const handleRetry = () => {
    setProgressInfo({
      progress: 0,
      currentStep: 'Initializing...',
      status: 'queued'
    });
    setError(null);
    setResult(null);
    setCanCancel(true);
  };

  const getStatusIcon = () => {
    switch (progressInfo.status) {
      case 'finished':
        return <CheckCircle className="w-8 h-8 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (progressInfo.status) {
      case 'queued':
        return 'Preparing to generate your content...';
      case 'started':
        return `Creating your ${format} content...`;
      case 'finished':
        return `Your ${format} content is ready!`;
      case 'failed':
        return 'Generation failed. Please try again.';
      default:
        return 'Processing...';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-gray-900 border-gray-700 text-white max-w-2xl w-[95vw] max-h-[90vh] p-0 overflow-hidden"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Processing Content</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {format === 'video' ? 'Generating Video Content' : 'Generating Podcast Content'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{getStatusMessage()}</p>
            </div>
          </div>

          {progressInfo.status === 'started' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progressInfo.progress)}%</span>
              </div>
              <Progress value={progressInfo.progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {progressInfo.status === 'failed' && error && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {progressInfo.status === 'finished' && result && (
            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-4 mb-6">
              <h3 className="text-emerald-400 font-medium mb-2">Content Generated Successfully!</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Format: {format.charAt(0).toUpperCase() + format.slice(1)}</div>
                {result.duration && (
                  <div>Duration: {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}</div>
                )}
                {result.fileSize && (
                  <div>Size: {(result.fileSize / (1024 * 1024)).toFixed(1)} MB</div>
                )}
              </div>
            </div>
          )}

          {/* Current Processing Step */}
          <div className="space-y-4">
            <div
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${
                progressInfo.status === 'started'
                  ? 'bg-blue-500/10 border-blue-400/30'
                  : progressInfo.status === 'finished'
                    ? 'bg-emerald-500/10 border-emerald-400/30'
                    : progressInfo.status === 'failed'
                      ? 'bg-red-500/10 border-red-400/30'
                      : 'bg-gray-800/30 border-gray-700/30'
              }`}
            >
              <div className={`flex-shrink-0 p-2 rounded-lg ${
                progressInfo.status === 'started'
                  ? 'bg-blue-500/20'
                  : progressInfo.status === 'finished'
                    ? 'bg-emerald-500/20'
                    : progressInfo.status === 'failed'
                      ? 'bg-red-500/20'
                      : 'bg-gray-700/30'
              }`}>
                {progressInfo.status === 'started' ? (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                ) : progressInfo.status === 'finished' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : progressInfo.status === 'failed' ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Loader2 className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${
                  progressInfo.status === 'started'
                    ? 'text-blue-400'
                    : progressInfo.status === 'finished'
                      ? 'text-emerald-400'
                      : progressInfo.status === 'failed'
                        ? 'text-red-400'
                        : 'text-gray-400'
                }`}>
                  {progressInfo.currentStep}
                </h4>
                {progressInfo.message && (
                  <p className="text-xs text-gray-500 mt-1">{progressInfo.message}</p>
                )}

                {progressInfo.status === 'started' && progressInfo.progress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progressInfo.progress)}%</span>
                    </div>
                    <Progress value={progressInfo.progress} className="h-1" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex gap-3 justify-end">
            {progressInfo.status === 'failed' && (
              <Button
                variant="outline"
                onClick={handleRetry}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}

            {progressInfo.status === 'finished' && result && (
              <>
                <Button
                  variant="outline"
                  onClick={() => window.open(result.downloadUrl, '_blank')}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleComplete}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  View in Gallery
                </Button>
              </>
            )}

            {progressInfo.status !== 'finished' && canCancel && (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}