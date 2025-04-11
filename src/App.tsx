import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import { useIsMobile } from "./hooks/use-mobile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Keep data fresh forever
      gcTime: Infinity,    // Never garbage collect the data (modern React Query)
    },
  },
});

// Initialize travel data
// initializeTravelData(queryClient); // Removed travel data initialization

const AppContent = () => {
  const isMobile = useIsMobile(); // Re-added isMobile hook usage
  
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* <ProjectSidebar /> */} {/* Removed Sidebar */}
      <div className={`${isMobile ? 'w-full' : 'flex-1'} overflow-hidden`}> {/* Restored original width logic */}
        <Routes>
          {/* Removed all routes except /chat and * */}
          <Route path="/" element={<ChatPage />} /> {/* Changed route from /chat to / */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <NavigationProvider> */} {/* Removed NavigationProvider */}
          <AppContent />
        {/* </NavigationProvider> */} {/* Removed NavigationProvider */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
