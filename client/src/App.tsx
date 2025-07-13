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

import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";
import Onboarding from "@/components/Onboarding";

function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-md space-y-8">
        {/* Logo/Icon */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-sacred-orange to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-sacred-orange to-orange-600 rounded-lg"></div>
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Sadhana Buddy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            Your spiritual practice companion
          </p>
        </div>
        
        {/* Features */}
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-700 dark:text-gray-300">
              Track daily sadhana, explore devotional songs, and grow in your spiritual journey with Krishna consciousness
            </p>
          </div>
          
          {/* Sign In Button */}
          <button
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-gradient-to-r from-sacred-orange to-orange-600 hover:from-orange-600 hover:to-sacred-orange text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Begin Your Journey
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to access your personal spiritual practice dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

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
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Hub} />
              <Route path="/songs" component={Songs} />
              <Route path="/lectures" component={Lectures} />
              <Route path="/tracker" component={Tracker} />
              <Route path="/journal" component={Journal} />
              <Route path="/profile" component={Profile} />
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
