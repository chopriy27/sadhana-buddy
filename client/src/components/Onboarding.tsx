import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, BookOpen, Headphones, Circle } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [dailyReadingPages, setDailyReadingPages] = useState("5");
  const [dailyHearingLectures, setDailyHearingLectures] = useState("1");
  const [dailyChantingRounds, setDailyChantingRounds] = useState("16");

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const setGoalsMutation = useMutation({
    mutationFn: async (goals: {
      dailyReadingPages: number;
      dailyHearingLectures: number;
      dailyChantingRounds: number;
    }) => {
      return apiRequest('POST', '/api/goals', {
        userId: user?.id,
        ...goals,
        isOnboardingComplete: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Goals set successfully!",
        description: "Welcome to your spiritual journey! Redirecting to Hub...",
      });
      
      // Invalidate cache and navigate immediately
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${user?.id}`] });
      onComplete();
      
      // Force a page reload to ensure the Hub loads properly
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Failed to set goals",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const readingPages = parseInt(dailyReadingPages);
    const hearingLectures = parseInt(dailyHearingLectures);
    const chantingRounds = parseInt(dailyChantingRounds);

    if (readingPages < 1 || hearingLectures < 1 || chantingRounds < 1) {
      toast({
        title: "Invalid values",
        description: "All goals must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    setGoalsMutation.mutate({
      dailyReadingPages: readingPages,
      dailyHearingLectures: hearingLectures,
      dailyChantingRounds: chantingRounds,
    });
  };

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-saffron dark:text-orange-400">
            Welcome to Sadhana Buddy
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Let's set up your daily spiritual practice goals
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reading" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-saffron" />
                How many pages of Srila Prabhupada's books would you like to read everyday?
              </Label>
              <Input
                id="reading"
                type="number"
                min="1"
                max="100"
                value={dailyReadingPages}
                onChange={(e) => setDailyReadingPages(e.target.value)}
                placeholder="5"
                className="text-center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hearing" className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-saffron" />
                How many lectures do you want to hear everyday?
              </Label>
              <Input
                id="hearing"
                type="number"
                min="1"
                max="10"
                value={dailyHearingLectures}
                onChange={(e) => setDailyHearingLectures(e.target.value)}
                placeholder="1"
                className="text-center"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Number of Prabhupada lectures to listen to daily
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chanting" className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-saffron" />
                How many rounds of Japa would you like to chant everyday?
              </Label>
              <Input
                id="chanting"
                type="number"
                min="1"
                max="64"
                value={dailyChantingRounds}
                onChange={(e) => setDailyChantingRounds(e.target.value)}
                placeholder="16"
                className="text-center"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rounds of Hare Krishna Mahamantra
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={setGoalsMutation.isPending}
            >
              {setGoalsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting goals...
                </>
              ) : (
                "Set My Goals"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}