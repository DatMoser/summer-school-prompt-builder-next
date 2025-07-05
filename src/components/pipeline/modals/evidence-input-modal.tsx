import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, File, CheckCircle, FileText, Type } from 'lucide-react';
import { EvidenceData } from '@/lib/pipeline-types';
import { apiRequest } from '@/lib/queryClient';

interface EvidenceInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: EvidenceData) => void;
  customApiKey?: string | null;
}

export default function EvidenceInputModal({ open, onOpenChange, onDataUpdate, customApiKey }: EvidenceInputModalProps) {
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setError(null);
    setIsProcessed(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const headers: HeadersInit = {};
      if (customApiKey) {
        headers['x-custom-api-key'] = customApiKey;
      }

      const response = await fetch('/api/upload/evidence', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      setAnalysisResult(result);
      setSummary(`File "${result.fileName}" uploaded successfully`);
      setIsProcessed(true);
    } catch (error: any) {
      console.error('Failed to process file:', error);
      setError(error.message || 'Failed to process file. Please try again.');
      setIsProcessed(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualTextSubmit = async () => {
    if (!manualText.trim()) {
      setError('Please enter evidence guidelines text');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setIsProcessed(false);

    try {
      // For manual text input, we'll store it directly without AI analysis
      const result = {
        fileName: 'Manual Text Input',
        filePath: '',
        fileContent: manualText.trim()
      };

      setAnalysisResult(result);
      setSummary(`Manual text input (${manualText.length} characters)`);
      setIsProcessed(true);
    } catch (error: any) {
      console.error('Text processing error:', error);
      setError(error.message || 'Failed to process text input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (analysisResult) {
      const evidenceData: EvidenceData = {
        fileName: analysisResult.fileName || (file ? file.name : 'Manual Text Input'),
        fileContent: analysisResult.fileContent || '',
        filePath: analysisResult.filePath || '',
        summary: '', // Will be generated during content creation
        extractedGuidelines: [] // Will be extracted during content creation
      };
      onDataUpdate(evidenceData);
      onOpenChange(false);
      
      // Reset state
      setFile(null);
      setManualText('');
      setSummary('');
      setIsProcessed(false);
      setAnalysisResult(null);
      setError(null);
      setInputMethod('file');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFile(null);
    setSummary('');
    setIsProcessed(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Evidence-Based Input</DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload text files or enter your health intervention guidelines manually for content generation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Input Method Selection */}
          <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
            <Button
              variant={inputMethod === 'file' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInputMethod('file')}
              className={`flex-1 ${inputMethod === 'file' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-gray-400 hover:text-white'}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button
              variant={inputMethod === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInputMethod('text')}
              className={`flex-1 ${inputMethod === 'text' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-gray-400 hover:text-white'}`}
            >
              <Type className="w-4 h-4 mr-2" />
              Enter Text
            </Button>
          </div>

          {/* File Upload Area */}
          {inputMethod === 'file' && (
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                {isProcessing ? (
                  <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-2" />
                ) : file ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                )}
                <p className="text-gray-300 mb-1">
                  {file ? file.name : "Upload your guidelines"}
                </p>
                <p className="text-sm text-gray-500">
                  {isProcessing ? "Processing..." : "PDF, TXT or MD files supported"}
                </p>
              </div>
            </div>
          )}

          {/* Manual Text Input */}
          {inputMethod === 'text' && (
            <div className="space-y-3">
              <Label htmlFor="manual-text" className="text-sm font-medium text-gray-300">
                Evidence-Based Guidelines
              </Label>
              <Textarea
                id="manual-text"
                placeholder="Enter your health intervention guidelines, evidence-based practices, or research findings here..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500">
                {manualText.length} characters
              </p>
              
              {!isProcessed && (
                <Button
                  onClick={handleManualTextSubmit}
                  disabled={!manualText.trim() || isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Process Text'
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* File Summary */}
          {isProcessed && summary && (
            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-4">
              <h4 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
                <File size={16} />
                Document Summary
              </h4>
              <p className="text-sm text-gray-300">{summary}</p>
            </div>
          )}
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
            onClick={handleConfirm}
            disabled={!isProcessed}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
