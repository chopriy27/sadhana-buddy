import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, Edit3, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserGoals, InsertUserGoals } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Goals() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState<Partial<InsertUserGoals>>({});

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
      return await apiRequest(`/api/goals/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedGoals),
        headers: { "Content-Type": "application/json" },
      });
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

  const handleEdit = () => {
    if (goals) {
      setEditedGoals({
        dailyChantingRounds: goals.dailyChantingRounds,
        dailyReadingPages: goals.dailyReadingPages,
        dailyHearingMinutes: goals.dailyHearingMinutes,
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
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Spiritual Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your daily spiritual practice targets
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Goals
          </Button>
        )}
      </div>

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
                  <Label htmlFor="hearing">Daily Hearing (Minutes)</Label>
                  <Input
                    id="hearing"
                    type="number"
                    min="5"
                    max="240"
                    value={editedGoals.dailyHearingMinutes || 30}
                    onChange={(e) => handleInputChange('dailyHearingMinutes', parseInt(e.target.value) || 30)}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Minutes of lectures or kirtans
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
                  {goals.dailyHearingMinutes}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Hearing (Min)
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
  );
}