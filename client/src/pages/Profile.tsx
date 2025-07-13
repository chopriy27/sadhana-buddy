import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, BookOpen, Play, Target, Award, Calendar, TrendingUp, LogOut, Camera, Upload, Edit3, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { UserProgress, SadhanaEntry, JournalEntry, UserGoals, InsertUserGoals } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedGoals, setEditedGoals] = useState<Partial<InsertUserGoals>>({});
  
  const { data: userProgress } = useQuery<UserProgress | null>({
    queryKey: [`/api/progress/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: sadhanaEntries } = useQuery<SadhanaEntry[]>({
    queryKey: [`/api/sadhana/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: [`/api/journal/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: userGoals } = useQuery<UserGoals>({
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

  // Calculate statistics
  const totalDays = sadhanaEntries?.length || 0;
  const completedDays = sadhanaEntries?.filter(entry => 
    entry.chantingRounds >= entry.chantingTarget && entry.reading && entry.mangalaArati
  ).length || 0;
  const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  const totalRounds = sadhanaEntries?.reduce((sum, entry) => sum + entry.chantingRounds, 0) || 0;
  const averageRounds = totalDays > 0 ? totalRounds / totalDays : 0;

  const currentStreak = userProgress?.currentStreak || 0;
  const longestStreak = userProgress?.longestStreak || 0;

  const stats = [
    {
      icon: Target,
      label: "Completion Rate",
      value: `${Math.round(completionRate)}%`,
      color: "text-sacred-orange",
      bgColor: "bg-sacred-orange/10",
    },
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: `${currentStreak} days`,
      color: "text-peaceful-blue",
      bgColor: "bg-peaceful-blue/10",
    },
    {
      icon: Award,
      label: "Longest Streak",
      value: `${longestStreak} days`,
      color: "text-sacred-gold",
      bgColor: "bg-sacred-gold/10",
    },
    {
      icon: Calendar,
      label: "Total Days",
      value: totalDays.toString(),
      color: "text-lotus-pink",
      bgColor: "bg-lotus-pink/10",
    },
  ];

  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first sadhana day",
      completed: totalDays > 0,
      icon: "🪷",
    },
    {
      title: "Consistent Practice",
      description: "Maintain a 7-day streak",
      completed: longestStreak >= 7,
      icon: "🔥",
    },
    {
      title: "Devoted Soul",
      description: "Complete 108 rounds total",
      completed: totalRounds >= 108,
      icon: "📿",
    },
    {
      title: "Reflective Mind",
      description: "Write 10 journal entries",
      completed: (journalEntries?.length || 0) >= 10,
      icon: "📖",
    },
  ];

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
      setIsEditingGoals(false);
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

  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: "Profile picture updated successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to upload profile picture", 
        variant: "destructive" 
      });
    },
  });

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ 
          title: "File too large", 
          description: "Please select an image under 5MB",
          variant: "destructive" 
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: "Invalid file type", 
          description: "Please select an image file",
          variant: "destructive" 
        });
        return;
      }
      
      uploadProfilePictureMutation.mutate(file);
    }
  };

  const handleEditGoals = () => {
    if (userGoals) {
      setEditedGoals({
        dailyChantingRounds: userGoals.dailyChantingRounds,
        dailyReadingPages: userGoals.dailyReadingPages,
        dailyHearingMinutes: userGoals.dailyHearingMinutes,
      });
      setIsEditingGoals(true);
    }
  };

  const handleSaveGoals = () => {
    updateGoalsMutation.mutate(editedGoals);
  };

  const handleCancelGoals = () => {
    setIsEditingGoals(false);
    setEditedGoals({});
  };

  const handleGoalInputChange = (field: keyof InsertUserGoals, value: number) => {
    setEditedGoals(prev => ({ ...prev, [field]: value }));
  };

  const booksRead = userProgress?.booksRead || [];
  const lecturesHeard = userProgress?.lecturesHeard || [];

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-soft-gray dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Profile</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* User Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-sacred-orange to-saffron rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                
                {/* Upload button overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadProfilePictureMutation.isPending}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-sacred-orange hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                  title="Upload profile picture"
                >
                  {uploadProfilePictureMutation.isPending ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                </button>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {user?.firstName || user?.lastName ? 
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                    'Devotee'
                  }
                </h2>
                {user?.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                )}
                <Badge variant="secondary" className="mt-1">
                  Aspiring Devotee
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/api/logout'}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Sadhana Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{stat.value}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Average Rounds per Day</span>
                <span className="font-medium">{averageRounds.toFixed(1)}</span>
              </div>
              <Progress value={(averageRounds / 16) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Goals Section */}
        {userGoals && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 text-orange-500 mr-2" />
                  My Spiritual Goals
                </CardTitle>
                {!isEditingGoals && (
                  <Button onClick={handleEditGoals} variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingGoals ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chanting">Daily Chanting Rounds</Label>
                      <Input
                        id="chanting"
                        type="number"
                        min="1"
                        max="64"
                        value={editedGoals.dailyChantingRounds || 16}
                        onChange={(e) => handleGoalInputChange('dailyChantingRounds', parseInt(e.target.value) || 16)}
                        className="text-center"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reading">Daily Reading Pages</Label>
                      <Input
                        id="reading"
                        type="number"
                        min="1"
                        max="50"
                        value={editedGoals.dailyReadingPages || 5}
                        onChange={(e) => handleGoalInputChange('dailyReadingPages', parseInt(e.target.value) || 5)}
                        className="text-center"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hearing">Daily Hearing (Minutes)</Label>
                      <Input
                        id="hearing"
                        type="number"
                        min="5"
                        max="240"
                        value={editedGoals.dailyHearingMinutes || 30}
                        onChange={(e) => handleGoalInputChange('dailyHearingMinutes', parseInt(e.target.value) || 30)}
                        className="text-center"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleSaveGoals}
                      disabled={updateGoalsMutation.isPending}
                      className="flex-1"
                      size="sm"
                    >
                      {updateGoalsMutation.isPending ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleCancelGoals}
                      variant="outline"
                      disabled={updateGoalsMutation.isPending}
                      size="sm"
                    >
                      <X className="h-3 w-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                      {userGoals.dailyChantingRounds}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Chanting Rounds
                    </div>
                  </div>

                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {userGoals.dailyReadingPages}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Reading Pages
                    </div>
                  </div>

                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {userGoals.dailyHearingMinutes}
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Hearing (Min)
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  achievement.completed 
                    ? "border-sacred-orange bg-sacred-orange/5" 
                    : "border-gray-200 dark:border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      achievement.completed 
                        ? "text-sacred-orange" 
                        : "text-gray-800 dark:text-gray-200"
                    }`}>
                      {achievement.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.completed && (
                    <Badge variant="default" className="bg-sacred-orange text-white">
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Spiritual Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Spiritual Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 text-peaceful-blue" />
                <span className="text-sm font-medium">Books Read</span>
                <Badge variant="outline">{booksRead.length}</Badge>
              </div>
              {booksRead.length === 0 ? (
                <p className="text-xs text-gray-600 dark:text-gray-400">No books completed yet</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {booksRead.slice(0, 3).map((book, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {book}
                    </Badge>
                  ))}
                  {booksRead.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{booksRead.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Play className="w-4 h-4 text-lotus-pink" />
                <span className="text-sm font-medium">Lectures Heard</span>
                <Badge variant="outline">{lecturesHeard.length}</Badge>
              </div>
              {lecturesHeard.length === 0 ? (
                <p className="text-xs text-gray-600 dark:text-gray-400">No lectures completed yet</p>
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Keep listening to spiritual discourses for growth!
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 text-sacred-gold" />
                <span className="text-sm font-medium">Journal Entries</span>
                <Badge variant="outline">{journalEntries?.length || 0}</Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Regular reflection deepens spiritual understanding
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
