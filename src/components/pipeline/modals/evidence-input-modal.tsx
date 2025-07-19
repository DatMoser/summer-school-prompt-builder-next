import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { File, CheckCircle, FileText, Type, FolderOpen, Eye, Trash2 } from 'lucide-react';
import { EvidenceData } from '@/lib/pipeline-types';
import { extractPdfText, isPdfFile, getPdfErrorMessage } from '@/lib/pdf-utils';
import DocumentPreviewModal from './document-preview-modal';

interface EvidenceInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: EvidenceData) => void;
  customApiKey?: string | null;
  existingData?: EvidenceData | null;
}

export default function EvidenceInputModal({ open, onOpenChange, onDataUpdate, existingData }: EvidenceInputModalProps) {
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    fileName: string;
    filePath: string;
    fileContent: string;
    pageCount?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Restore existing data when modal opens
  useEffect(() => {
    if (open && existingData && existingData.fileContent && existingData.fileContent.trim()) {
      // Determine if this was from a file or manual text input
      const isManualInput = existingData.fileName === 'Manual Text Input';

      if (isManualInput) {
        // Restore manual text input
        setInputMethod('text');
        setManualText(existingData.fileContent);
        setAnalysisResult({
          fileName: existingData.fileName,
          filePath: existingData.filePath,
          fileContent: existingData.fileContent
        });
        setSummary(`Manual text input (${existingData.fileContent.length} characters)`);
        setIsProcessed(true);
      } else {
        // Restore file input (show as processed file)
        setInputMethod('file');
        setFile(null); // We don't have the actual file object
        setAnalysisResult({
          fileName: existingData.fileName,
          filePath: existingData.filePath,
          fileContent: existingData.fileContent
        });
        setSummary(`File "${existingData.fileName}" loaded (${existingData.fileContent.length.toLocaleString()} characters)`);
        setIsProcessed(true);
      }
      setError(null);
    } else if (open) {
      // Reset state when opening without existing data
      setInputMethod('file');
      setFile(null);
      setManualText('');
      setAnalysisResult(null);
      setSummary('');
      setIsProcessed(false);
      setError(null);
      setProcessingStatus('');
    }
  }, [open, existingData]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setError(null);
    setIsProcessed(false);
    setProcessingStatus('Initializing...');

    try {
      let fileContent = '';
      let pageCount = 0;

      if (isPdfFile(selectedFile)) {
        // Handle PDF files
        setProcessingStatus('Reading PDF content...');

        const pdfResult = await extractPdfText(selectedFile);
        fileContent = pdfResult.text;
        pageCount = pdfResult.pageCount;

        setProcessingStatus('PDF processing complete');
      } else {
        // Handle text files
        setProcessingStatus('Reading text file...');

        // Check file size (limit to 10MB for text files)
        if (selectedFile.size > 10 * 1024 * 1024) {
          throw new Error('File is too large. Please select a file smaller than 10MB.');
        }

        // Check file type
        const allowedTypes = ['text/plain', 'text/markdown'];
        const isAllowedType = allowedTypes.includes(selectedFile.type) ||
          selectedFile.name.endsWith('.txt') ||
          selectedFile.name.endsWith('.md');

        if (!isAllowedType) {
          throw new Error('Unsupported file type. Please select a .txt, .md, or .pdf file.');
        }

        fileContent = await readFileAsText(selectedFile);

        if (!fileContent.trim()) {
          throw new Error('The selected file appears to be empty.');
        }
      }

      const result = {
        fileName: selectedFile.name,
        filePath: '', // Not needed for local reading
        fileContent: fileContent.trim(),
        ...(pageCount > 0 && { pageCount }) // Include page count for PDFs
      };

      setAnalysisResult(result);

      // Create summary with appropriate details
      let summaryText = `File "${selectedFile.name}" loaded successfully (${fileContent.length.toLocaleString()} characters)`;
      if (pageCount > 0) {
        summaryText += ` from ${pageCount} page${pageCount > 1 ? 's' : ''}`;
      }
      setSummary(summaryText);
      setIsProcessed(true);

      // Immediately mark as configured when file is successfully processed
      const evidenceData: EvidenceData = {
        fileName: selectedFile.name,
        fileContent: fileContent.trim(),
        filePath: '',
        summary: '', // Will be generated during content creation
        extractedGuidelines: [] // Will be extracted during content creation
      };
      onDataUpdate(evidenceData);
    } catch (error: unknown) {
      console.error('Failed to read file:', error);

      // Use PDF-specific error handling if applicable
      const errorMessage = isPdfFile(selectedFile)
        ? getPdfErrorMessage(error)
        : (error instanceof Error ? error.message : 'Failed to read file. Please try again.');

      setError(errorMessage);
      setIsProcessed(false);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      // Read as text with UTF-8 encoding
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleManualTextChange = (text: string) => {
    setManualText(text);
    setError(null);

    if (text.trim()) {
      // Automatically process text input when there's content
      const result = {
        fileName: 'Manual Text Input',
        filePath: '',
        fileContent: text.trim()
      };

      setAnalysisResult(result);
      setSummary(`Manual text input (${text.length} characters)`);
      setIsProcessed(true);

      // Immediately mark as configured when text is entered
      const evidenceData: EvidenceData = {
        fileName: 'Manual Text Input',
        fileContent: text.trim(),
        filePath: '',
        summary: '', // Will be generated during content creation
        extractedGuidelines: [] // Will be extracted during content creation
      };
      onDataUpdate(evidenceData);
    } else {
      // Clear processed state when text is empty
      setAnalysisResult(null);
      setSummary('');
      setIsProcessed(false);

      // Mark as unconfigured when text is cleared
      onDataUpdate(null as any);
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
      setProcessingStatus('');
      setPreviewOpen(false);
      setInputMethod('file');
    }
  };

  const handleDelete = () => {
    // Clear all data and mark as unconfigured
    onDataUpdate(null as any);
    setFile(null);
    setManualText('');
    setAnalysisResult(null);
    setSummary('');
    setIsProcessed(false);
    setError(null);
    setProcessingStatus('');
    setPreviewOpen(false);
    setInputMethod('file');
  };

  const handleCancel = () => {
    // Mark as unconfigured when canceling if no data is processed
    if (!isProcessed) {
      onDataUpdate(null as any);
    }
    onOpenChange(false);
    setFile(null);
    setSummary('');
    setIsProcessed(false);
    setProcessingStatus('');
    setPreviewOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Evidence-Based Input</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select text or PDF files to read locally or enter your health intervention guidelines manually for content generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input Method Selection */}
          <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
            <Button
              variant={inputMethod === 'file' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setInputMethod('file');
                // Clear text input when switching to file
                if (inputMethod === 'text' && manualText) {
                  setManualText('');
                  setAnalysisResult(null);
                  setSummary('');
                  setIsProcessed(false);
                  onDataUpdate(null as any);
                }
              }}
              className={`flex-1 ${inputMethod === 'file' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-gray-400 hover:text-white'}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Select File
            </Button>
            <Button
              variant={inputMethod === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setInputMethod('text');
                // Clear file input when switching to text
                if (inputMethod === 'file' && file) {
                  setFile(null);
                  setAnalysisResult(null);
                  setSummary('');
                  setIsProcessed(false);
                  setError(null);
                  onDataUpdate(null as any);
                }
              }}
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
                accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
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
                  <FolderOpen className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                )}
                <p className="text-gray-300 mb-1">
                  {file ? file.name : "Select your guidelines file"}
                </p>
                <p className="text-sm text-gray-500">
                  {isProcessing ? (processingStatus || "Reading file...") : "TXT, MD, and PDF files supported"}
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
                onChange={(e) => handleManualTextChange(e.target.value)}
                className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
              />
              <p className="text-xs text-gray-500">
                {manualText.length} characters
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* File Summary - Only show for file input method */}
          {isProcessed && summary && inputMethod === 'file' && (
            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-emerald-400 flex items-center gap-2">
                  <File size={16} />
                  Document Summary
                </h4>
                {analysisResult?.fileContent && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewOpen(true)}
                      className="bg-emerald-600/20 border-emerald-400/30 text-emerald-300 hover:bg-emerald-600/30 hover:text-emerald-200 text-xs px-3 py-1.5 h-auto"
                    >
                      <Eye size={14} className="mr-1.5" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      className="bg-red-600/20 border-red-400/30 text-red-300 hover:bg-red-600/30 hover:text-red-200 text-xs px-3 py-1.5 h-auto"
                    >
                      <Trash2 size={14} className="mr-1.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
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

          {/* Show delete button when there's existing data */}
          {/* {isProcessed && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="bg-red-600/20 border-red-400/30 text-red-300 hover:bg-red-600/30 hover:text-red-200"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          )} */}

          <Button
            onClick={handleConfirm}
            disabled={!isProcessed}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>

      {/* Document Preview Modal */}
      {analysisResult?.fileContent && (
        <DocumentPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          fileName={analysisResult.fileName || file?.name || 'Document'}
          content={analysisResult.fileContent}
          pageCount={analysisResult.pageCount}
        />
      )}
    </Dialog>
  );
}
