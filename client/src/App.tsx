import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobileFeatures } from "@/hooks/use-mobile-features";
import Hub from "@/pages/Hub";
import Songs from "@/pages/Songs";
import Tracker from "@/pages/Tracker";
import Journal from "@/pages/Journal";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";

function Router() {
  const { isReady } = useMobileFeatures();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-sacred-orange flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <h1 className="text-xl font-semibold">Sadhana Buddy</h1>
          <p className="text-sm opacity-80">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-16 min-h-screen"> {/* Add padding bottom for fixed navigation */}
        <Switch>
          <Route path="/" component={Hub} />
          <Route path="/songs" component={Songs} />
          <Route path="/tracker" component={Tracker} />
          <Route path="/journal" component={Journal} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <BottomNavigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-warm-white safe-area-inset">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
