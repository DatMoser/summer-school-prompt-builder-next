import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Youtube, Loader2, Type, Search } from 'lucide-react';
import { StyleData } from '@/lib/pipeline-types';
import GoogleSignIn from '@/components/auth/google-sign-in';

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

// Search YouTube videos with transcript availability
async function searchYouTubeVideos(query: string, accessToken?: string): Promise<any[]> {
  if (!accessToken) {
    throw new Error('Authentication required for YouTube search');
  }

  try {
    console.log('🚀 Making API request to /api/youtube/search');
    const response = await fetch('/api/youtube/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query, maxResults: 10 })
    });

    console.log('💰 API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      throw new Error(`Failed to search YouTube videos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 API response data:', data);
    console.log('📁 Videos in response:', data.videos?.length || 0);
    
    return data.videos || [];
  } catch (error) {
    console.error('❌ YouTube search error:', error);
    throw error;
  }
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

// Fetch YouTube transcript and analyze style using our server-side API
async function fetchYouTubeTranscriptAndAnalyze(videoId: string, startTime?: string, endTime?: string, customApiKey?: string, accessToken?: string): Promise<{transcript: string, styleAnalysis: any}> {
  try {
    // Build the full YouTube URL from videoId
    const youtubeUrl = `https://youtube.com/watch?v=${videoId}`;
    
    // Prepare request body
    const requestBody: any = { url: youtubeUrl };
    
    // Convert time strings to seconds if provided
    if (startTime) {
      requestBody.startTime = parseTime(startTime);
    }
    if (endTime) {
      requestBody.endTime = parseTime(endTime);
    }
    
    console.log(`Fetching transcript and analyzing style for video: ${videoId}`);
    
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Add custom API key if provided
    if (customApiKey) {
      headers['x-gemini-api-key'] = customApiKey;
    }
    
    // Add OAuth2 access token if provided (only needed for search functionality)
    if (accessToken) {
      console.log('Adding OAuth2 access token to request headers');
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error types from the new API
      if (errorData.requiresAuth) {
        throw new Error(
          'Authentication required for YouTube transcript access.\n\n' +
          '🔐 Please sign in with your Google account to access YouTube captions.\n' +
          '📝 Alternatively, use the "Manual Description" tab to enter your communication style directly.'
        );
      }
      
      if (errorData.requiresSetup || errorData.requiresOAuth) {
        throw new Error(
          errorData.error + '\n\n' +
          '🔧 Current Status: YouTube transcript functionality requires proper setup.\n' +
          '📝 For now, please use the "Manual Description" tab to enter your communication style directly.'
        );
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch transcript`);
    }

    const data = await response.json();
    return {
      transcript: data.transcript || '',
      styleAnalysis: data.styleAnalysis || null
    };
    
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
  customApiKey?: string;
  customYouTubeApiKey?: string;
}

export default function StylePersonalizationModal({ open, onOpenChange, onDataUpdate, customApiKey, customYouTubeApiKey }: StylePersonalizationModalProps) {
  const [inputMode, setInputMode] = useState<'youtube' | 'search' | 'text'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{id: string, title: string, channelTitle: string} | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [manualStyleDescription, setManualStyleDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleData['extractedStyle'] | null>(null);
  const [transcriptData, setTranscriptData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  // Debug effect to track searchResults changes
  useEffect(() => {
    console.log('📊 searchResults changed:', searchResults.length, 'items');
    if (searchResults.length > 0) {
      console.log('📄 First result:', searchResults[0]);
    }
  }, [searchResults]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      console.log('🔍 Starting search for:', searchQuery);
      console.log('🔑 Access token available:', !!accessToken);
      
      const results = await searchYouTubeVideos(searchQuery, accessToken);
      
      console.log('✅ Search results received:', results.length, 'videos');
      console.log('📊 Results data:', results);
      
      setSearchResults(results);
      console.log('📁 Search results state updated');
      
      // Force a small delay to see if it's a timing issue
      setTimeout(() => {
        console.log('⏰ Delayed check - searchResults.length:', results.length);
      }, 100);
    } catch (error: any) {
      console.error('❌ Failed to search videos:', error);
      setError(error.message || 'Failed to search videos. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo({
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle
    });
    setYoutubeUrl(`https://youtube.com/watch?v=${video.id}`);
  };

  const handleAnalyze = async () => {
    if ((inputMode === 'youtube' || inputMode === 'search') && !youtubeUrl) return;
    if (inputMode === 'text' && !manualStyleDescription) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (inputMode === 'youtube' || inputMode === 'search') {
        // Extract video ID from YouTube URL
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
          throw new Error('Invalid YouTube URL. Please provide a valid YouTube video URL.');
        }

        // Debug: Check authentication state
        console.log('handleAnalyze: Authentication state:', {
          isAuthenticated,
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length || 0
        });

        // Fetch transcript and analyze with Gemini
        const { transcript, styleAnalysis: geminiAnalysis } = await fetchYouTubeTranscriptAndAnalyze(
          videoId, 
          startTime, 
          endTime, 
          customApiKey,
          accessToken
        );
        
        if (!transcript || transcript.length === 0) {
          throw new Error('No transcript available for this video. The video may not have captions enabled or may be unavailable.');
        }

        // Store the transcript
        setTranscriptData(transcript);
        
        // Use Gemini analysis if available, otherwise fallback to local analysis
        let finalStyleAnalysis;
        if (geminiAnalysis) {
          finalStyleAnalysis = {
            tone: geminiAnalysis.tone || 'Analyzed',
            pace: geminiAnalysis.pace || 'Moderate',
            vocabulary: geminiAnalysis.vocabulary || 'Mixed',
            keyPhrases: geminiAnalysis.keyPhrases || ['analyzed content'],
            communicationStyle: geminiAnalysis.communicationStyle,
            personalityTraits: geminiAnalysis.personalityTraits,
            audience: geminiAnalysis.audience,
            rawAnalysis: geminiAnalysis.rawAnalysis
          };
        } else {
          // Fallback to local analysis
          finalStyleAnalysis = analyzeTranscriptStyle(transcript);
        }
        
        setStyleAnalysis(finalStyleAnalysis);
        
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
      } else if (error.message.includes('API key')) {
        errorMessage = 'Gemini API key issue. The transcript was fetched but style analysis failed. Please check your API key.';
      } else if (error.message.includes('quota') || error.message.includes('rate')) {
        errorMessage = 'API quota exceeded or rate limited. Please try again later.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
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
    // For YouTube/search mode, require analysis to be completed
    if ((inputMode === 'youtube' || inputMode === 'search') && !styleAnalysis) return;
    
    // For text mode, require manual description to be provided
    if (inputMode === 'text' && !manualStyleDescription.trim()) return;
    
    const styleData: StyleData = {
      youtubeUrl: (inputMode === 'youtube' || inputMode === 'search') ? youtubeUrl : `Manual: ${manualStyleDescription.substring(0, 50)}...`,
      startTime: (inputMode === 'youtube' || inputMode === 'search') ? (startTime || undefined) : undefined,
      endTime: (inputMode === 'youtube' || inputMode === 'search') ? (endTime || undefined) : undefined,
      transcript: (inputMode === 'youtube' || inputMode === 'search') ? transcriptData : manualStyleDescription,
      extractedStyle: (inputMode === 'youtube' || inputMode === 'search') ? styleAnalysis! : {
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
    setSearchQuery('');
    setSearchResults([]);
    setSelectedVideo(null);
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
    setSearchQuery('');
    setSearchResults([]);
    setSelectedVideo(null);
    setStartTime('');
    setEndTime('');
    setManualStyleDescription('');
    setStyleAnalysis(null);
    setTranscriptData('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      console.log('Dialog onOpenChange called:', newOpen);
      onOpenChange(newOpen);
    }}>
      <DialogContent 
        className="bg-gray-800 border-gray-600 text-white max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-6"
        onKeyDown={(e) => {
          console.log('⌨️ Modal keydown:', e.key);
          e.stopPropagation();
        }}
        onFocus={(e) => {
          console.log('🎯 Modal focused');
          e.stopPropagation();
        }}
        onBlur={(e) => {
          console.log('🔴 Modal blurred');
          e.stopPropagation();
        }}
        onClick={(e) => {
          console.log('💱 Modal clicked');
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Style Personalization</DialogTitle>
          <DialogDescription className="text-gray-400">
            Analyze a YouTube video or describe your preferred communication style manually
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Input mode selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => {
                setInputMode('youtube');
                setError(null); // Clear errors when switching modes
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                inputMode === 'youtube' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Youtube size={18} />
              <span>YouTube URL</span>
            </button>
            <button
              onClick={() => {
                setInputMode('search');
                setError(null); // Clear errors when switching modes
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                inputMode === 'search' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Search size={18} />
              <span>Search Videos</span>
            </button>
            <button
              onClick={() => {
                setInputMode('text');
                setError(null); // Clear errors when switching modes
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                inputMode === 'text' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Type size={18} />
              <span>Manual Description</span>
            </button>
          </div>

          {inputMode === 'youtube' ? (
            <>
              {/* Google Authentication */}
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">
                  Authentication Required
                </Label>
                <GoogleSignIn 
                  onAuthChange={(isAuth, token) => {
                    setIsAuthenticated(isAuth);
                    setAccessToken(token);
                  }}
                />
              </div>

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
                  disabled={!isAuthenticated}
                />
              </div>
            </>
          ) : inputMode === 'search' ? (
            <>
              {/* Google Authentication */}
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">
                  Authentication Required
                </Label>
                <GoogleSignIn 
                  onAuthChange={(isAuth, token) => {
                    setIsAuthenticated(isAuth);
                    setAccessToken(token);
                  }}
                />
              </div>

              {/* Search Bar */}
              <div>
                <Label htmlFor="video-search" className="text-sm font-medium text-gray-300 mb-2 block">
                  Search YouTube Videos
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="video-search"
                    type="text"
                    placeholder="Search for videos with transcripts..."
                    value={searchQuery}
                    onChange={(e) => {
                      console.log('📝 Search query updated:', e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    onFocus={(e) => {
                      console.log('🎯 Search input focused');
                      e.stopPropagation();
                    }}
                    onBlur={(e) => {
                      console.log('🔴 Search input blurred');
                      e.stopPropagation();
                    }}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!isAuthenticated}
                    onKeyPress={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching || !isAuthenticated}
                    className="bg-purple-500 hover:bg-purple-600 px-3"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results Debug */}
              <div className="text-xs text-gray-400">
                Debug: {searchResults.length} results, searching: {isSearching ? 'yes' : 'no'}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Search Results ({searchResults.length} Videos with Transcript Availability)
                  </Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {searchResults.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => handleVideoSelect(video)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedVideo?.id === video.id
                            ? 'bg-purple-600/20 border-purple-500'
                            : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Youtube className="h-5 w-5 text-red-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {video.snippet.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">
                              {video.snippet.channelTitle}
                            </p>
                            <p className="text-xs text-green-400 mt-1">
                              ✓ Transcript Available
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Video Display */}
              {selectedVideo && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Youtube className="h-4 w-4" />
                    <span className="font-medium">Selected:</span>
                    <span className="truncate">{selectedVideo.title}</span>
                  </div>
                </div>
              )}
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

          {/* Timestamp inputs - only for YouTube and search modes */}
          {(inputMode === 'youtube' || inputMode === 'search') && (
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

          {/* Analyze Button - only for YouTube and search modes */}
          {(inputMode === 'youtube' || inputMode === 'search') && (
            <>
              <Button
                onClick={handleAnalyze}
                disabled={!youtubeUrl || isAnalyzing || (inputMode === 'search' && !isAuthenticated)}
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
              
              <div className="space-y-2">
                {!customApiKey && (
                  <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded p-2">
                    💡 For AI-powered style analysis, set up a Gemini API key in Settings. Without it, basic analysis will be used.
                  </p>
                )}
                
                <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded p-2">
                  ⚠️ YouTube transcript access is limited by YouTube's API policy. Only works with your own videos or videos that explicitly allow third-party caption access.
                </p>
                
                {customYouTubeApiKey && (
                  <p className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded p-2">
                    🔑 YouTube API key configured for OAuth2 authentication.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Transcript Preview */}
          {transcriptData && (inputMode === 'youtube' || inputMode === 'search') && (
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
              <h4 className="font-medium text-purple-400 mb-2">
                {styleAnalysis.communicationStyle ? 'AI-Powered Style Analysis' : 'Extracted Style Elements'}
              </h4>
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
                
                {/* New Gemini fields */}
                {styleAnalysis.communicationStyle && (
                  <div className="flex justify-between">
                    <span>Communication Style:</span>
                    <span className="text-purple-300">{styleAnalysis.communicationStyle}</span>
                  </div>
                )}
                
                {styleAnalysis.audience && (
                  <div className="flex justify-between">
                    <span>Target Audience:</span>
                    <span className="text-purple-300">{styleAnalysis.audience}</span>
                  </div>
                )}
                
                {styleAnalysis.personalityTraits && styleAnalysis.personalityTraits.length > 0 && (
                  <div className="mt-2">
                    <span className="block mb-1">Personality Traits:</span>
                    <div className="flex flex-wrap gap-1">
                      {styleAnalysis.personalityTraits.map((trait, index) => (
                        <span key={index} className="text-xs bg-blue-400/20 px-2 py-1 rounded text-blue-200">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
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
              (inputMode === 'youtube' || inputMode === 'search') ? !styleAnalysis : !manualStyleDescription.trim()
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
