import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Hub from "@/pages/Hub";
import Songs from "@/pages/Songs";
import Tracker from "@/pages/Tracker";
import Journal from "@/pages/Journal";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";

function Router() {
  return (
    <>
      <div className="pb-16"> {/* Add padding bottom for fixed navigation */}
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
        <div className="min-h-screen bg-warm-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
