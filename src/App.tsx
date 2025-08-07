"use client";

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from 'next/dynamic';
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import { TooltipProvider } from "./components/ui/tooltip";

const PipelineBuilder = dynamic(() => import("./components/pipeline-builder-wrapper"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={PipelineBuilder} />
      <Route component={NotFound} />
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
