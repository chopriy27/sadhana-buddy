import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobileFeatures } from "@/hooks/use-mobile-features";
import { useAuth } from "@/hooks/useAuth";
import Hub from "@/pages/Hub";
import Songs from "@/pages/Songs";
import Tracker from "@/pages/Tracker";
import Journal from "@/pages/Journal";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";

function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-sacred-orange">
          🕉️ Sadhana Buddy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your spiritual practice companion for Krishna consciousness
        </p>
        <div className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400">
            Track your daily sadhana, explore devotional songs, and grow in your spiritual journey
          </p>
          <button
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-sacred-orange hover:bg-sacred-orange/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isReady } = useMobileFeatures();
  const { isAuthenticated, isLoading } = useAuth();

  if (!isReady || isLoading) {
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
          {!isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Hub} />
              <Route path="/songs" component={Songs} />
              <Route path="/tracker" component={Tracker} />
              <Route path="/journal" component={Journal} />
              <Route path="/profile" component={Profile} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
      {isAuthenticated && <BottomNavigation />}
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
