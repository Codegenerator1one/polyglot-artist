
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import MyProjects from "./pages/MyProjects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isClerkLoaded, setIsClerkLoaded] = useState(false);

  useEffect(() => {
    // Simulate Clerk loading to prevent errors if Clerk key is missing
    const timer = setTimeout(() => {
      setIsClerkLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!isClerkLoaded ? (
            <div className="flex items-center justify-center h-screen">
              Loading authentication...
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/my-projects" element={<MyProjects />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
