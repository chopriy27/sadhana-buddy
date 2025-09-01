import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, Sparkles, Music, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { DevotionalSong } from "@shared/schema";

interface SongRecommendation {
  song: DevotionalSong;
  reason: string;
  confidence: number;
  spiritualBenefit: string;
  spiritualFocus?: 'radharani' | 'krishna' | 'caitanya' | 'guru' | 'general';
}

interface RecommendationRequest {
  currentMood?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  practiceLevel?: 'beginner' | 'intermediate' | 'advanced';
  spiritualFocus?: 'radharani' | 'krishna' | 'caitanya' | 'guru' | 'general' | 'any';
  count?: number;
}

interface UserPreferences {
  preferredAuthors: string[];
  preferredMoods: string[];
  spiritualFocus: string;
  practiceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export function AIRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<RecommendationRequest>({
    count: 5
  });

  // Helper function to categorize songs by spiritual focus
  const categorizeSongBySpiritualFocus = (song: DevotionalSong): 'radharani' | 'krishna' | 'caitanya' | 'guru' | 'general' => {
    const title = song.title.toLowerCase();
    
    if (title.includes('radha') || title.includes('radhika') || title.includes('radhe') || 
        title.includes('vrindavan') || title.includes('gopi') || title.includes('lalita')) {
      return 'radharani';
    }
    
    if (title.includes('krishna') || title.includes('krsna') || title.includes('govind') || 
        title.includes('gopal') || title.includes('madhav') || title.includes('hari') ||
        title.includes('vasudeva') || title.includes('mukund') || title.includes('gokul')) {
      return 'krishna';
    }
    
    if (title.includes('caitanya') || title.includes('gaura') || title.includes('gauranga') || 
        title.includes('mahaprabhu') || title.includes('nitai') || title.includes('nityananda') ||
        title.includes('navadwip') || title.includes('sankirtan')) {
      return 'caitanya';
    }
    
    if (title.includes('guru') || title.includes('gurudev') || title.includes('prabhupada') ||
        title.includes('spiritual master') || title.includes('acharya')) {
      return 'guru';
    }
    
    return 'general';
  };

  // Helper function to get spiritual focus display info
  const getSpiritualFocusInfo = (focus: string) => {
    const focusMap: Record<string, { emoji: string; name: string; color: string }> = {
      'radharani': { emoji: '🌸', name: 'Radharani', color: 'text-pink-600 bg-pink-50' },
      'krishna': { emoji: '🦚', name: 'Krishna', color: 'text-blue-600 bg-blue-50' },
      'caitanya': { emoji: '✨', name: 'Caitanya', color: 'text-yellow-600 bg-yellow-50' },
      'guru': { emoji: '🙏', name: 'Guru', color: 'text-purple-600 bg-purple-50' },
      'general': { emoji: '🕉️', name: 'General', color: 'text-gray-600 bg-gray-50' }
    };
    return focusMap[focus] || focusMap['general'];
  };

  // Get AI recommendations
  const recommendationsMutation = useMutation<SongRecommendation[], Error, RecommendationRequest>({
    mutationFn: async (requestData: RecommendationRequest) => {
      return await apiRequest(`/api/recommendations/${user?.id}`, "POST", requestData);
    },
    onError: (error) => {
      toast({
        title: "Recommendation Error",
        description: "Failed to get AI recommendations. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Get user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: [`/api/recommendations/${user?.id}/preferences`],
    enabled: !!user?.id,
  });

  const handleGetRecommendations = () => {
    if (!user?.id) return;
    recommendationsMutation.mutate(filters);
  };

  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  // Auto-detect time of day if not set
  const currentTimeOfDay = filters.timeOfDay || getCurrentTimeOfDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">AI Bhajan Recommendations</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Personalized spiritual music suggestions based on your sadhana and preferences
        </p>
      </div>

      {/* User Preferences Insight */}
      {preferences && !preferencesLoading && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Spiritual Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Preferred Authors:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.preferredAuthors?.map((author: string) => (
                  <Badge key={author} variant="secondary">{author}</Badge>
                )) || <span className="text-sm text-gray-500">No preferences yet</span>}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Spiritual Focus:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{preferences.spiritualFocus}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Practice Level:</p>
              <Badge variant="outline">{preferences.practiceLevel}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Customize Your Recommendations
          </CardTitle>
          <CardDescription>
            Tell us about your current mood and practice to get better suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Mood</label>
              <Select 
                value={filters.currentMood} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, currentMood: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="devotional">Devotional</SelectItem>
                  <SelectItem value="meditative">Meditative</SelectItem>
                  <SelectItem value="joyful">Joyful</SelectItem>
                  <SelectItem value="reflective">Reflective</SelectItem>
                  <SelectItem value="contemplative">Contemplative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time of Day</label>
              <Select 
                value={filters.timeOfDay || currentTimeOfDay}
                onValueChange={(value) => setFilters(prev => ({ ...prev, timeOfDay: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Practice Level</label>
              <Select 
                value={filters.practiceLevel || preferences?.practiceLevel}
                onValueChange={(value) => setFilters(prev => ({ ...prev, practiceLevel: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Spiritual Focus</label>
              <Select 
                value={filters.spiritualFocus || 'any'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, spiritualFocus: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Focus</SelectItem>
                  <SelectItem value="krishna">🦚 Krishna</SelectItem>
                  <SelectItem value="radharani">🌸 Radharani</SelectItem>
                  <SelectItem value="caitanya">✨ Caitanya Mahaprabhu</SelectItem>
                  <SelectItem value="guru">🙏 Guru & Spiritual Master</SelectItem>
                  <SelectItem value="general">🕉️ General Devotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGetRecommendations}
            disabled={recommendationsMutation.isPending}
            className="w-full"
          >
            {recommendationsMutation.isPending ? (
              "Getting Recommendations..."
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations Results */}
      {recommendationsMutation.isPending && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendationsMutation.data && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Recommended for You
          </h3>
          
          {recommendationsMutation.data.map((recommendation: SongRecommendation, index: number) => (
            <Card key={`${recommendation.song.id}-${index}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{recommendation.song.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">by {recommendation.song.author}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline">{recommendation.song.category}</Badge>
                      <Badge variant="secondary">{recommendation.song.mood}</Badge>
                      {(() => {
                        const focus = categorizeSongBySpiritualFocus(recommendation.song);
                        const focusInfo = getSpiritualFocusInfo(focus);
                        return (
                          <Badge 
                            variant="outline" 
                            className={`${focusInfo.color} border-current`}
                          >
                            {focusInfo.emoji} {focusInfo.name}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Confidence:</span>
                      <Badge variant={recommendation.confidence > 0.7 ? "default" : "secondary"}>
                        {Math.round(recommendation.confidence * 100)}%
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Why this song?
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {recommendation.reason}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Spiritual Benefit:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {recommendation.spiritualBenefit}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">
                    Reference: Authentic song from kksongs.org
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendationsMutation.data && recommendationsMutation.data.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No recommendations found. Try adjusting your preferences or adding more favorite songs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}