"use client";

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import PipelineBuilder from "./pages/pipeline-builder";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import { TooltipProvider } from "./components/ui/tooltip";

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
