"use client";

import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import dynamic from "next/dynamic";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import PipelineBuilder from "./components/pages/pipeline-builder";
import OnboardingScreen from "./components/onboarding/onboarding-screen";
import { Toaster } from "./components/ui/toaster";
// NotFound component is now handled by App Router in src/app/not-found.tsx
import { TooltipProvider } from "./components/ui/tooltip";
import BackendClient from "./lib/backend-client";

const PipelineBuilder = dynamic(() => import("./components/pipeline-builder-wrapper"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>
});

function Router() {
  const [hasValidApiKey, setHasValidApiKey] = useState<boolean | null>(null);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

  useEffect(() => {
    // Check for existing API key in localStorage and validate it with backend
    const checkApiKey = async () => {
      try {
        const savedApiKey = localStorage.getItem('promptrx-backend-api-key');
        
        if (!savedApiKey) {
          setHasValidApiKey(false);
          return;
        }
        
        // Validate the API key with the backend
        console.log('🔍 Validating stored API key on app load...');
        const isValid = await BackendClient.validateApiKey();
        
        if (!isValid) {
          console.log('❌ Stored API key is invalid, clearing and redirecting to onboarding');
          localStorage.removeItem('promptrx-backend-api-key');
          setHasValidApiKey(false);
        } else {
          console.log('✅ Stored API key is valid');
          setHasValidApiKey(true);
        }
      } catch (error) {
        console.error('Error checking API key:', error);
        setHasValidApiKey(false);
      } finally {
        setIsCheckingApiKey(false);
      }
    };

    // Add a small delay to prevent flash
    const timeoutId = setTimeout(checkApiKey, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleOnboardingComplete = (apiKey: string) => {
    try {
      localStorage.setItem('promptrx-backend-api-key', apiKey);
      setHasValidApiKey(true);
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  // Show loading or nothing while checking
  if (isCheckingApiKey) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show onboarding if no valid API key
  if (!hasValidApiKey) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show main app with routing
  return (
    <Switch>
      <Route path="/" component={PipelineBuilder} />
      <Route>404 - Page not found</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
