"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield } from "lucide-react";
import BackendClient from "@/lib/backend-client";

interface OnboardingScreenProps {
  onComplete: (apiKey: string) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [apiKey, setApiKey] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  const validateApiKey = async (key: string) => {
    if (!key || key.trim().length === 0) {
      return false;
    }

    try {
      // Temporarily store the key for validation
      const originalKey = BackendClient.getCurrentApiKey();
      localStorage.setItem('promptrx-backend-api-key', key);
      
      // Test the API key using the BackendClient
      const isValid = await BackendClient.validateApiKey();
      
      // Restore original key if validation failed
      if (!isValid && originalKey) {
        localStorage.setItem('promptrx-backend-api-key', originalKey);
      } else if (!isValid) {
        localStorage.removeItem('promptrx-backend-api-key');
      }
      
      return isValid;
    } catch (error) {
      console.error('Backend API key validation error:', error);
      return false;
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setError("");
    setIsValid(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || apiKey.trim().length === 0) {
      setError("Please enter your API key");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms of service");
      return;
    }

    // Validate API key when form is submitted
    setIsValidating(true);
    setError("");
    
    const valid = await validateApiKey(apiKey);
    setIsValid(valid);
    
    if (!valid) {
      setError("Invalid API key. Please check your backend API key.");
      setIsValidating(false);
      return;
    }

    setIsValidating(false);
    onComplete(apiKey);
  };

  const canSubmit = apiKey && apiKey.trim().length > 0 && termsAccepted && !isValidating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="floating-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
          <div className="circle circle-4"></div>
          <div className="circle circle-5"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to PRECIOUS Content Generator</h1>
          <p className="text-gray-400">
            AI-powered platform for creating personalized health content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium text-gray-300">
              Backend API Key *
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type="text"
                placeholder="Enter your backend API key"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 pr-10"
                disabled={isValidating}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValidating && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">
              This key authenticates your requests to the PRECIOUS Content Generator backend service
            </p>
          </div>

          {/* Terms of Service */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                  I accept the terms of service *
                </Label>
              </div>
            </div>

            {/* Terms Content */}
            <div className="bg-gray-700/50 border border-gray-600 rounded-md p-4 text-xs text-gray-300 max-h-40 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-purple-400">Terms of Service</span>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Responsible Use:</strong> You agree to use this platform responsibly and not to abuse the system through excessive requests, inappropriate content generation, or attempts to circumvent usage limits.
                </p>
                <p>
                  <strong>Content Responsibility:</strong> You are fully responsible for all content generated through this platform. Ensure that generated content complies with applicable laws and regulations in your jurisdiction.
                </p>
                <p>
                  <strong>Health Information:</strong> This platform generates health-related content for educational purposes only. Always consult with qualified healthcare professionals for medical advice and treatment decisions.
                </p>
                <p>
                  <strong>Backend Authentication:</strong> Your backend API key is used solely for authentication with the PRECIOUS Content Generator backend service. This key is separate from any AI service API keys and is required for all content generation requests.
                </p>
                <p>
                  <strong>Data Privacy:</strong> Your backend API key and personal health data are stored locally in your browser. The backend API key is used only for request authentication and is not logged or stored on our servers.
                </p>
                <p>
                  <strong>Service Availability:</strong> This platform is provided &quot;as-is&quot; without warranties. Service availability and functionality may vary based on external API service status.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="bg-red-900/20 border-red-600 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating API Key...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>

      </div>

      {/* CSS Styles for animations */}
      <style jsx>{`
        .floating-circles {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          animation: float 6s ease-in-out infinite;
        }

        .circle-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 120px;
          height: 120px;
          top: 70%;
          right: 10%;
          animation-delay: 2s;
        }

        .circle-3 {
          width: 60px;
          height: 60px;
          top: 40%;
          left: 5%;
          animation-delay: 4s;
        }

        .circle-4 {
          width: 100px;
          height: 100px;
          top: 20%;
          right: 20%;
          animation-delay: 1s;
        }

        .circle-5 {
          width: 40px;
          height: 40px;
          top: 80%;
          left: 20%;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}