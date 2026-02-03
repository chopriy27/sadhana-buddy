import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, Edit3, Save, X, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserGoals, InsertUserGoals, User } from "@shared/schema";
import Logo from "@/components/Logo";
import { isUnauthorizedError } from "@/lib/authUtils";

// Common timezone list for Vaishnava communities worldwide
const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (Asia/Kolkata)' },
  { value: 'America/New_York', label: 'Eastern Time (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (America/Los_Angeles)' },
  { value: 'America/Chicago', label: 'Central Time (America/Chicago)' },
  { value: 'Europe/London', label: 'London (Europe/London)' },
  { value: 'Europe/Moscow', label: 'Moscow (Europe/Moscow)' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia/Sydney)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo)' },
  { value: 'Asia/Dubai', label: 'Dubai (Asia/Dubai)' },
  { value: 'America/Toronto', label: 'Toronto (America/Toronto)' },
];

export default function Goals() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState<Partial<InsertUserGoals>>({});
  const [selectedTimezone, setSelectedTimezone] = useState<string>(user?.timezone || 'America/New_York');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Sync timezone state with user data
  useEffect(() => {
    if (user?.timezone) {
      setSelectedTimezone(user.timezone);
    }
  }, [user?.timezone]);

  const { data: goals, isLoading: goalsLoading } = useQuery<UserGoals>({
    queryKey: ["/api/goals", user?.id],
    enabled: !!user?.id,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const updateGoalsMutation = useMutation({
    mutationFn: async (updatedGoals: Partial<InsertUserGoals>) => {
      if (!user?.id) throw new Error("User not found");
      const response = await apiRequest("PATCH", `/api/goals/${user.id}`, updatedGoals);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals", user?.id] });
      toast({
        title: "Goals Updated",
        description: "Your spiritual practice goals have been updated successfully!",
      });
      setIsEditing(false);
      setEditedGoals({});
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Update Failed",
        description: "Failed to update your goals. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTimezoneMutation = useMutation({
    mutationFn: async (timezone: string) => {
      if (!user?.id) throw new Error("User not found");
      const response = await apiRequest("PATCH", `/api/user/${user.id}/timezone`, { timezone });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Timezone Updated",
        description: "Festival reminders will now show in your local timezone!",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update timezone. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (goals) {
      setEditedGoals({
        dailyChantingRounds: goals.dailyChantingRounds,
        dailyReadingPages: goals.dailyReadingPages,
        dailyHearingLectures: goals.dailyHearingLectures,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateGoalsMutation.mutate(editedGoals);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedGoals({});
  };

  const handleInputChange = (field: keyof InsertUserGoals, value: number) => {
    setEditedGoals(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No goals found. Please complete the onboarding process.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">My Goals</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Daily Practice Targets</p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 text-orange-500 mr-2" />
            Daily Practice Goals
          </CardTitle>
          <CardDescription>
            Set targets for your daily spiritual practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="chanting">Daily Chanting Rounds</Label>
                  <Input
                    id="chanting"
                    type="number"
                    min="1"
                    max="64"
                    value={editedGoals.dailyChantingRounds || 16}
                    onChange={(e) => handleInputChange('dailyChantingRounds', parseInt(e.target.value) || 16)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Rounds of Hare Krishna mantra
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reading">Daily Reading Pages</Label>
                  <Input
                    id="reading"
                    type="number"
                    min="1"
                    max="50"
                    value={editedGoals.dailyReadingPages || 5}
                    onChange={(e) => handleInputChange('dailyReadingPages', parseInt(e.target.value) || 5)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pages from Srila Prabhupada's books
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hearing">Daily Hearing (Lectures)</Label>
                  <Input
                    id="hearing"
                    type="number"
                    min="1"
                    max="10"
                    value={editedGoals.dailyHearingLectures || 1}
                    onChange={(e) => handleInputChange('dailyHearingLectures', parseInt(e.target.value) || 1)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Number of lectures or kirtans
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={updateGoalsMutation.isPending}
                  className="flex-1"
                >
                  {updateGoalsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  disabled={updateGoalsMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {goals.dailyChantingRounds}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Chanting Rounds
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Hare Krishna mantra
                </div>
              </div>

              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {goals.dailyReadingPages}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Reading Pages
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Srila Prabhupada's books
                </div>
              </div>

              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {goals.dailyHearingLectures}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Hearing
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Lectures & kirtans
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 text-orange-500 mr-2" />
            Festival Reminder Timezone
          </CardTitle>
          <CardDescription>
            Set your timezone for accurate Vaishnava festival reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Your Timezone</Label>
              <Select
                value={selectedTimezone}
                onValueChange={(value) => {
                  setSelectedTimezone(value);
                  updateTimezoneMutation.mutate(value);
                }}
              >
                <SelectTrigger id="timezone" data-testid="select-timezone">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current timezone: {selectedTimezone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Tips for Achieving Your Goals
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Start your day with chanting to set a spiritual tone</p>
            <p>• Read Srila Prabhupada's books during quiet moments</p>
            <p>• Listen to lectures while commuting or exercising</p>
            <p>• Track your progress daily to stay motivated</p>
            <p>• Adjust goals as needed to maintain consistency</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}