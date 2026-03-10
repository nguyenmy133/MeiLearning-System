import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppErrorBoundary } from "@/components/shared/error-boundary";

import { publicRoutes, userRoutes, teacherRoutes, adminRoutes } from "./routes";

const queryClient = new QueryClient();

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public / landing / auth / error pages */}
            {publicRoutes()}

            {/* Role-based portals (all pages are lazy-loaded) */}
            {userRoutes()}
            {teacherRoutes()}
            {adminRoutes()}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
