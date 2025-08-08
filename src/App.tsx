"use client";

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import PipelineBuilder from "./components/pages/pipeline-builder";
import { Toaster } from "./components/ui/toaster";
// NotFound component is now handled by App Router in src/app/not-found.tsx
import { TooltipProvider } from "./components/ui/tooltip";

function Router() {
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
