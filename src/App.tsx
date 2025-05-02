
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase, initializeStorage } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import CustomersPage from "./pages/CustomersPage";

const queryClient = new QueryClient();

const App = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check that Supabase client is initialized and set up storage
    const initializeApp = async () => {
      try {
        // Get session from storage if exists
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error retrieving session:", error);
        }
        console.log("Auth initialized", data);
        
        // Initialize storage buckets
        await initializeStorage();
        
      } catch (err) {
        console.error("Failed to initialize auth:", err);
      } finally {
        setInitialized(true);
      }
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
