import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, FileText, Copy, Download } from 'lucide-react';

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  content: string;
  pageCount?: number;
}

export default function DocumentPreviewModal({
  open,
  onOpenChange,
  fileName,
  content,
  pageCount
}: DocumentPreviewModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Format content with better spacing and structure
  const formatContent = (text: string) => {
    return text
      // Add extra line breaks for better paragraph separation
      .replace(/\n\s*\n/g, '\n\n')
      // Ensure proper spacing after periods
      .replace(/\.\s*([A-Z])/g, '. $1')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      // Break extremely long words (like URLs) to prevent overflow
      .replace(/(\S{50,})/g, (match) => {
        // Insert zero-width spaces every 50 characters for long strings
        return match.replace(/(.{50})/g, '$1\u200B');
      })
      .trim();
  };

  // Highlight search terms in content
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part) => {
      if (regex.test(part)) {
        return `<mark class="bg-yellow-300 text-gray-900 px-1 rounded">${part}</mark>`;
      }
      return part;
    }).join('');
  };

  const formattedContent = formatContent(content);
  const highlightedContent = highlightSearchTerm(formattedContent, searchTerm);

  // Search statistics
  const searchMatches = searchTerm.trim()
    ? (content.match(new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownloadContent = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-4xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-left">
                  Document Preview
                </DialogTitle>
                <div className="text-sm text-gray-400 mt-1">
                  {fileName}
                  {pageCount && (
                    <span className="ml-2">• {pageCount} page{pageCount > 1 ? 's' : ''}</span>
                  )}
                  <span className="ml-2">• {content.length.toLocaleString()} characters</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search and Actions Bar */}
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search in document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm"
                autoFocus={false}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="text-sm text-gray-400">
                {searchMatches} match{searchMatches !== 1 ? 'es' : ''}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadContent}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 p-6">
          <div className="bg-gray-900/30 rounded-lg border border-gray-700 h-full overflow-hidden">
            <div
              className="overflow-y-scroll h-[30em] p-4 text-sm leading-relaxed text-gray-200 font-mono whitespace-pre-wrap"
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
              dangerouslySetInnerHTML={{
                __html: highlightedContent.replace(/\n/g, '<br/>')
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>
              This preview shows the extracted text content from your document
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}