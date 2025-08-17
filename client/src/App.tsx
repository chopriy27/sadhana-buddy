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
import logoImage from "@assets/ChatGPT Image Aug 13, 2025, 10_03_33 AM_1755104655512.png";

function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-celestial-white dark:bg-background">
      <div className="max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logoImage} 
            alt="Sadhana Buddy Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
        
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Sadhana Buddy
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Your spiritual practice companion
          </p>
        </div>
        
        {/* Features */}
        <div className="space-y-6">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-6 border border-border shadow-lg">
            <p className="text-card-foreground text-base leading-relaxed">
              Track daily sadhana, explore devotional songs, listen to authentic Prabhupada lectures, and grow in your spiritual journey with Krishna consciousness
            </p>
          </div>
          
          {/* Sign In Button */}
          <button
            onClick={() => window.location.href = '/api/login'}
            className="w-full font-bold text-lg py-5 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] bg-sacred-orange text-primary-foreground border-2 border-saffron hover:bg-saffron"
          >
            Begin Your Spiritual Journey
          </button>
          
          <p className="text-sm text-muted-foreground">
            Sign in with your Replit account to access your personal spiritual practice dashboard
          </p>
        </div>
        
        {/* Features List */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-card/70 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
            <div className="text-2xl mb-2">📿</div>
            <div className="text-sm font-medium text-card-foreground">Daily Sadhana</div>
          </div>
          <div className="bg-card/70 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
            <div className="text-2xl mb-2">🎵</div>
            <div className="text-sm font-medium text-card-foreground">Devotional Songs</div>
          </div>
          <div className="bg-card/70 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium text-card-foreground">Prabhupada Lectures</div>
          </div>
          <div className="bg-card/70 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium text-card-foreground">Spiritual Journal</div>
          </div>
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
