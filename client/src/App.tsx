import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobileFeatures } from "@/hooks/use-mobile-features";
import { useAuth } from "@/hooks/useAuth";
import Hub from "@/pages/Hub";
import Songs from "@/pages/Songs";
import Lectures from "@/pages/Lectures";
import Tracker from "@/pages/Tracker";
import Journal from "@/pages/Journal";
import Profile from "@/pages/Profile";
import Calendar from "@/pages/Calendar";
import EventDetail from "@/pages/EventDetail";
import Goals from "@/pages/Goals";
import Auth from "@/pages/Auth";

import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";
import Onboarding from "@/components/Onboarding";
import Logo from "@/components/Logo";

function Router() {
  const { isReady } = useMobileFeatures();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check if user has completed onboarding
  const { data: userGoals, isLoading: goalsLoading } = useQuery({
    queryKey: [`/api/goals/${user?.id}`],
    enabled: !!user?.id && isAuthenticated,
    retry: false,
  });

  const hasCompletedOnboarding = userGoals?.isOnboardingComplete;

  if (!isReady || isLoading || (isAuthenticated && goalsLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="flex justify-center mb-4">
            <Logo size={80} className="animate-pulse" />
          </div>
          <h1 className="text-xl font-semibold">Sadhana Buddy</h1>
          <p className="text-sm opacity-80 mt-1">Loading your spiritual journey...</p>
          <div className="mt-4">
            <div className="w-8 h-8 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding for authenticated users who haven't completed it
  if (isAuthenticated && !hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/goals', user?.id] });
        }}
      />
    );
  }

  return (
    <>
      <div className="pb-16 min-h-screen"> {/* Add padding bottom for fixed navigation */}
        <Switch>
          {!isAuthenticated ? (
            <Route path="/" component={Auth} />
          ) : (
            <>
              <Route path="/" component={Hub} />
              <Route path="/songs" component={Songs} />
              <Route path="/lectures" component={Lectures} />
              <Route path="/tracker" component={Tracker} />
              <Route path="/journal" component={Journal} />
              <Route path="/profile" component={Profile} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/goals" component={Goals} />
              <Route path="/event/:id" component={EventDetail} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
      {isAuthenticated && hasCompletedOnboarding && <BottomNavigation />}
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
