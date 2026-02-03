import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, BookOpen, Headphones, Circle, ChevronRight } from "lucide-react";
import Logo from "@/components/Logo";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [dailyChantingRounds, setDailyChantingRounds] = useState("16");
  const [dailyReadingPages, setDailyReadingPages] = useState("5");
  const [dailyHearingMinutes, setDailyHearingMinutes] = useState("30");

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const setGoalsMutation = useMutation({
    mutationFn: async (goals: {
      dailyReadingPages: number;
      dailyHearingLectures: number;
      dailyChantingRounds: number;
    }) => {
      console.log('Submitting goals:', { userId: user?.id, ...goals });
      const response = await apiRequest('POST', '/api/goals', {
        userId: user?.id,
        ...goals,
        isOnboardingComplete: true,
      });
      console.log('Goals response:', response);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Goals set successfully!",
        description: "Welcome to Sadhana Buddy!",
      });
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${user?.id}`] });
      onComplete();
      
      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    },
    onError: (error) => {
      console.error('Goals mutation error:', error);
      toast({
        title: "Failed to set goals",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    const readingPages = parseInt(dailyReadingPages) || 5;
    const hearingMinutes = parseInt(dailyHearingMinutes) || 30;
    const chantingRounds = parseInt(dailyChantingRounds) || 16;

    setGoalsMutation.mutate({
      dailyReadingPages: readingPages,
      dailyHearingLectures: hearingMinutes, // Now storing minutes
      dailyChantingRounds: chantingRounds,
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-6">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Welcome to Sadhana Buddy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Let's set up your daily spiritual goals
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-gradient-to-r from-orange-500 to-amber-500' : 
                s < step ? 'w-2 bg-orange-400' : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-orange-100 dark:border-gray-700">
          {/* Step 1: Japa */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Circle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Japa Rounds
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  How many rounds of Hare Krishna Mahamantra would you like to chant daily?
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDailyChantingRounds(String(Math.max(1, parseInt(dailyChantingRounds) - 1)))}
                    className="h-12 w-12 rounded-full"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="192"
                    value={dailyChantingRounds}
                    onChange={(e) => setDailyChantingRounds(e.target.value)}
                    className="w-24 text-center text-2xl font-bold h-14"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDailyChantingRounds(String(Math.min(192, parseInt(dailyChantingRounds) + 1)))}
                    className="h-12 w-12 rounded-full"
                  >
                    +
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-500">rounds</p>

                <div className="flex justify-center gap-2 flex-wrap">
                  {[4, 8, 16, 32, 64].map((r) => (
                    <Button
                      key={r}
                      variant={dailyChantingRounds === String(r) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDailyChantingRounds(String(r))}
                      className={dailyChantingRounds === String(r) ? "bg-gradient-to-r from-orange-500 to-amber-500" : ""}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Reading */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Reading
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  How many pages of Srila Prabhupada's books would you like to read daily?
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDailyReadingPages(String(Math.max(1, parseInt(dailyReadingPages) - 1)))}
                    className="h-12 w-12 rounded-full"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={dailyReadingPages}
                    onChange={(e) => setDailyReadingPages(e.target.value)}
                    className="w-24 text-center text-2xl font-bold h-14"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDailyReadingPages(String(Math.min(100, parseInt(dailyReadingPages) + 1)))}
                    className="h-12 w-12 rounded-full"
                  >
                    +
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-500">pages</p>

                <div className="flex justify-center gap-2 flex-wrap">
                  {[5, 10, 15, 20, 30].map((p) => (
                    <Button
                      key={p}
                      variant={dailyReadingPages === String(p) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDailyReadingPages(String(p))}
                      className={dailyReadingPages === String(p) ? "bg-gradient-to-r from-orange-500 to-amber-500" : ""}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Hearing */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Hearing
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  How many minutes of Prabhupada's lectures would you like to hear daily?
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDailyHearingMinutes(String(Math.max(10, parseInt(dailyHearingMinutes) - 10)))}
                    className="h-12 w-12 rounded-full"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="10"
                    max="480"
                    step="10"
                    value={dailyHearingMinutes}
                    onChange={(e) => setDailyHearingMinutes(e.target.value)}
                    className="w-24 text-center text-2xl font-bold h-14"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDailyHearingMinutes(String(Math.min(480, parseInt(dailyHearingMinutes) + 10)))}
                    className="h-12 w-12 rounded-full"
                  >
                    +
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-500">minutes</p>

                <div className="flex justify-center gap-2 flex-wrap">
                  {[15, 30, 45, 60, 90].map((m) => (
                    <Button
                      key={m}
                      variant={dailyHearingMinutes === String(m) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDailyHearingMinutes(String(m))}
                      className={dailyHearingMinutes === String(m) ? "bg-gradient-to-r from-orange-500 to-amber-500" : ""}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button 
                onClick={nextStep}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={setGoalsMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {setGoalsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Start My Journey"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Summary at bottom */}
        <div className="mt-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-orange-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">Your daily goals:</p>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-lg font-bold text-orange-600">{dailyChantingRounds}</p>
              <p className="text-xs text-gray-500">rounds</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{dailyReadingPages}</p>
              <p className="text-xs text-gray-500">pages</p>
            </div>
            <div>
              <p className="text-lg font-bold text-rose-600">{dailyHearingMinutes}</p>
              <p className="text-xs text-gray-500">minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
