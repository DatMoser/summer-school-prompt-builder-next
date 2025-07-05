import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Youtube, Loader2, Type } from 'lucide-react';
import { StyleData } from '@/lib/pipeline-types';

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Remove whitespace and common URL prefixes
  url = url.trim();
  if (!url.startsWith('http') && !url.includes('youtube') && !url.includes('youtu.be')) {
    // Assume it's just a video ID if it's 11 characters
    if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return url;
    }
    return null;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  return null;
}

// Helper function to convert time string to seconds
function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  
  // Handle formats like "1:30", "90s", "1m30s", "90"
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':').reverse();
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
      seconds += parseInt(parts[i]) * Math.pow(60, i);
    }
    return seconds;
  } else if (timeStr.endsWith('s')) {
    return parseInt(timeStr.slice(0, -1));
  } else if (timeStr.endsWith('m')) {
    return parseInt(timeStr.slice(0, -1)) * 60;
  } else {
    return parseInt(timeStr);
  }
}

// Fetch YouTube transcript using our server-side API
async function fetchYouTubeTranscript(videoId: string, startTime?: string, endTime?: string): Promise<string> {
  try {
    // Build query parameters for time range
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    
    const queryString = params.toString();
    const url = `http://localhost:3001/api/youtube/transcript/${videoId}${queryString ? `?${queryString}` : ''}`;
    
    console.log(`Fetching transcript from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch transcript`);
    }

    const data = await response.json();
    let transcript = data.transcript || '';

    // Apply time filtering if specified
    if (startTime || endTime) {
      const start = startTime ? parseTime(startTime) : 0;
      const end = endTime ? parseTime(endTime) : Infinity;
      
      // Filter transcript by time range (this would need actual timestamp data)
      // For now, we'll just note the time range in the response
      transcript = `[Time range: ${startTime || '0:00'} - ${endTime || 'end'}]\n${transcript}`;
    }

    return transcript;
  } catch (error: any) {
    if (error.message.includes('404')) {
      throw new Error('Video not found. The video may be private, deleted, or the URL is incorrect.');
    } else if (error.message.includes('403')) {
      throw new Error('Access denied. The video may be private or restricted.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      throw error;
    }
  }
}

// Analyze transcript for style elements
function analyzeTranscriptStyle(transcript: string): StyleData['extractedStyle'] {
  const text = transcript.toLowerCase();
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = transcript.split(/\s+/).filter(w => w.trim().length > 0);
  
  // Analyze tone
  let tone = 'neutral';
  if (text.includes('exciting') || text.includes('amazing') || text.includes('awesome')) {
    tone = 'enthusiastic';
  } else if (text.includes('professional') || text.includes('research') || text.includes('study')) {
    tone = 'professional';
  } else if (text.includes('hey') || text.includes('guys') || text.includes('cool')) {
    tone = 'casual';
  }
  
  // Analyze pace
  const avgWordsPerSentence = words.length / sentences.length;
  let pace = 'moderate';
  if (avgWordsPerSentence < 8) {
    pace = 'fast, short sentences';
  } else if (avgWordsPerSentence > 15) {
    pace = 'slow, detailed explanations';
  }
  
  // Analyze vocabulary
  const complexWords = words.filter(w => w.length > 8).length;
  const complexityRatio = complexWords / words.length;
  let vocabulary = 'simple';
  if (complexityRatio > 0.15) {
    vocabulary = 'technical';
  } else if (complexityRatio > 0.08) {
    vocabulary = 'moderate';
  }
  
  // Extract key phrases (common 2-3 word combinations)
  const keyPhrases = extractKeyPhrases(transcript);
  
  return {
    tone,
    pace,
    vocabulary,
    keyPhrases: keyPhrases.slice(0, 5) // Limit to top 5 phrases
  };
}

// Analyze manual text for style elements
function analyzeTextStyle(text: string): StyleData['extractedStyle'] {
  return {
    tone: 'user-defined',
    pace: 'as described',
    vocabulary: 'manual input',
    keyPhrases: [text.substring(0, 50) + (text.length > 50 ? '...' : '')]
  };
}

// Extract key phrases from text
function extractKeyPhrases(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.match(/^[a-z]+$/));
  const phrases: { [key: string]: number } = {};
  
  // Extract 2-word and 3-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i + 1]}`;
    phrases[twoWord] = (phrases[twoWord] || 0) + 1;
    
    if (i < words.length - 2) {
      const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases[threeWord] = (phrases[threeWord] || 0) + 1;
    }
  }
  
  // Return most common phrases
  return Object.entries(phrases)
    .filter(([phrase, count]) => count > 1 && phrase.length > 4)
    .sort(([, a], [, b]) => b - a)
    .map(([phrase]) => phrase);
}

interface StylePersonalizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: StyleData) => void;
}

export default function StylePersonalizationModal({ open, onOpenChange, onDataUpdate }: StylePersonalizationModalProps) {
  const [inputMode, setInputMode] = useState<'youtube' | 'text'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [manualStyleDescription, setManualStyleDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleData['extractedStyle'] | null>(null);
  const [transcriptData, setTranscriptData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (inputMode === 'youtube' && !youtubeUrl) return;
    if (inputMode === 'text' && !manualStyleDescription) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (inputMode === 'youtube') {
        // Extract video ID from YouTube URL
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
          throw new Error('Invalid YouTube URL. Please provide a valid YouTube video URL.');
        }

        // Fetch transcript using youtube-transcript library
        const transcript = await fetchYouTubeTranscript(videoId, startTime, endTime);
        
        if (!transcript || transcript.length === 0) {
          throw new Error('No transcript available for this video. The video may not have captions enabled or may be unavailable.');
        }

        // Store the transcript and analyze for style elements
        setTranscriptData(transcript);
        const styleAnalysis = analyzeTranscriptStyle(transcript);
        setStyleAnalysis(styleAnalysis);
        
      } else {
        // Analyze manual text description
        const styleAnalysis = analyzeTextStyle(manualStyleDescription);
        setStyleAnalysis(styleAnalysis);
      }
    } catch (error: any) {
      console.error('Failed to analyze style:', error);
      let errorMessage = 'Failed to analyze style. Please try again.';
      
      if (error.message.includes('Invalid YouTube URL')) {
        errorMessage = 'Invalid YouTube URL. Please check the URL format (e.g., https://youtube.com/watch?v=VIDEO_ID)';
      } else if (error.message.includes('No transcript available')) {
        errorMessage = 'No transcript available for this video. The video may not have auto-generated or manual captions enabled.';
      } else if (error.message.includes('Video not found')) {
        errorMessage = 'Video not found. The video may be private, deleted, or the URL is incorrect.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setStyleAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    // For YouTube mode, require analysis to be completed
    if (inputMode === 'youtube' && !styleAnalysis) return;
    
    // For text mode, require manual description to be provided
    if (inputMode === 'text' && !manualStyleDescription.trim()) return;
    
    const styleData: StyleData = {
      youtubeUrl: inputMode === 'youtube' ? youtubeUrl : `Manual: ${manualStyleDescription.substring(0, 50)}...`,
      startTime: inputMode === 'youtube' ? (startTime || undefined) : undefined,
      endTime: inputMode === 'youtube' ? (endTime || undefined) : undefined,
      transcript: inputMode === 'youtube' ? transcriptData : manualStyleDescription,
      extractedStyle: inputMode === 'youtube' ? styleAnalysis! : {
        tone: "User-defined style",
        pace: "As described",
        vocabulary: "Manual input",
        keyPhrases: [manualStyleDescription.substring(0, 100)]
      }
    };
    onDataUpdate(styleData);
    onOpenChange(false);
    
    // Reset state
    setYoutubeUrl('');
    setStartTime('');
    setEndTime('');
    setManualStyleDescription('');
    setStyleAnalysis(null);
    setTranscriptData('');
    setError(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setYoutubeUrl('');
    setStartTime('');
    setEndTime('');
    setManualStyleDescription('');
    setStyleAnalysis(null);
    setTranscriptData('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Style Personalization</DialogTitle>
          <DialogDescription className="text-gray-400">
            Analyze a YouTube video or describe your preferred communication style manually
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Input mode selection */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
            <button
              onClick={() => setInputMode('youtube')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                inputMode === 'youtube' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Youtube size={16} />
              <span className="hidden sm:inline">YouTube Video</span>
              <span className="sm:hidden">YouTube</span>
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                inputMode === 'text' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Type size={16} />
              <span className="hidden sm:inline">Manual Description</span>
              <span className="sm:hidden">Manual</span>
            </button>
          </div>

          {inputMode === 'youtube' ? (
            <>
              <div>
                <Label htmlFor="youtube-url" className="text-sm font-medium text-gray-300 mb-2 block">
                  YouTube Video URL
                </Label>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="manual-style" className="text-sm font-medium text-gray-300 mb-2 block">
                Describe Your Preferred Communication Style
              </Label>
              <Textarea
                id="manual-style"
                placeholder="Describe the tone, pace, vocabulary, and communication style you prefer. For example: 'I prefer a casual, conversational tone with simple language and short sentences. I like when explanations are friendly and encouraging...'"
                value={manualStyleDescription}
                onChange={(e) => setManualStyleDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 min-h-[100px]"
                rows={4}
              />
            </div>
          )}

          {/* Timestamp inputs - only for YouTube mode */}
          {inputMode === 'youtube' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time" className="text-sm font-medium text-gray-300 mb-2 block">
                    Start Time (optional)
                  </Label>
                  <Input
                    id="start-time"
                    type="text"
                    placeholder="e.g., 1:30 or 90s"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-sm font-medium text-gray-300 mb-2 block">
                    End Time (optional)
                  </Label>
                  <Input
                    id="end-time"
                    type="text"
                    placeholder="e.g., 5:00 or 300s"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Specify time range to analyze specific segments for more precise style extraction
              </p>
            </>
          )}

          {/* Analyze Button - only for YouTube mode */}
          {inputMode === 'youtube' && (
            <Button
              onClick={handleAnalyze}
              disabled={!youtubeUrl || isAnalyzing}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Youtube className="mr-2 h-4 w-4" />
                  Analyze Style
                </>
              )}
            </Button>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Transcript Preview */}
          {transcriptData && inputMode === 'youtube' && (
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-2">✓ Transcript Successfully Fetched</h4>
              <div className="text-sm text-gray-300">
                <p className="mb-2">Transcript length: {transcriptData.length} characters</p>
                <div className="bg-gray-800/50 rounded p-2 max-h-24 overflow-y-auto">
                  <p className="text-xs text-gray-400 font-mono">
                    {transcriptData.substring(0, 200)}{transcriptData.length > 200 ? '...' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Style Analysis Results */}
          {styleAnalysis && (
            <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
              <h4 className="font-medium text-purple-400 mb-2">Extracted Style Elements</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Tone:</span>
                  <span className="text-purple-300">{styleAnalysis.tone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pace:</span>
                  <span className="text-purple-300">{styleAnalysis.pace}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vocabulary:</span>
                  <span className="text-purple-300">{styleAnalysis.vocabulary}</span>
                </div>
                <div className="mt-2">
                  <span className="block mb-1">Key Phrases:</span>
                  <div className="flex flex-wrap gap-1">
                    {styleAnalysis.keyPhrases.map((phrase, index) => (
                      <span key={index} className="text-xs bg-purple-400/20 px-2 py-1 rounded text-purple-200">
                        "{phrase}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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
            disabled={
              inputMode === 'youtube' ? !styleAnalysis : !manualStyleDescription.trim()
            }
            className="flex-1 bg-purple-500 hover:bg-purple-600"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
