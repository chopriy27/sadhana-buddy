import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, CheckCircle, Circle, Target, Book, Music, Sun, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SadhanaEntry, Challenge, UserChallenge, UserGoals } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Tracker() {
  const { user } = useAuth();
  const [chantingRounds, setChantingRounds] = useState(0);
  const [readingPrabhupada, setReadingPrabhupada] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [pagesRead, setPagesRead] = useState(0);
  const [mangalaArati, setMangalaArati] = useState(false);
  const [hearing, setHearing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  const { data: todaysSadhana } = useQuery<SadhanaEntry | null>({
    queryKey: [`/api/sadhana/${user?.id}/today`],
    refetchOnMount: true,
    enabled: !!user?.id,
  });

  const { data: sadhanaHistory } = useQuery<SadhanaEntry[]>({
    queryKey: [`/api/sadhana/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: userChallenges } = useQuery<(UserChallenge & { challenge: Challenge })[]>({
    queryKey: [`/api/challenges/user/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: userGoals } = useQuery<UserGoals>({
    queryKey: [`/api/goals/${user?.id}`],
    enabled: !!user?.id,
  });

  // Set initial values when data loads
  useState(() => {
    if (todaysSadhana) {
      setChantingRounds(todaysSadhana.chantingRounds || 0);
      setReadingPrabhupada(todaysSadhana.readingPrabhupada || false);
      setBookTitle(todaysSadhana.bookTitle || "");
      setPagesRead(todaysSadhana.pagesRead || 0);
      setMangalaArati(todaysSadhana.mangalaArati || false);
      setHearing(todaysSadhana.hearing || false);
    }
  });

  const updateSadhanaMutation = useMutation({
    mutationFn: async (data: Partial<SadhanaEntry>) => {
      if (todaysSadhana) {
        return apiRequest('PUT', `/api/sadhana/${todaysSadhana.id}`, data);
      } else {
        return apiRequest('POST', '/api/sadhana', {
          userId: user?.id,
          date: today,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sadhana/${user?.id}/today`] });
      queryClient.invalidateQueries({ queryKey: [`/api/sadhana/${user?.id}`] });
      toast({ title: "Sadhana updated successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to update sadhana", 
        variant: "destructive" 
      });
    },
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return apiRequest('POST', '/api/challenges/join', {
        userId: user?.id,
        challengeId,
        progress: 0,
        completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/user/${user?.id}`] });
      toast({ title: "Challenge joined successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to join challenge", 
        variant: "destructive" 
      });
    },
  });

  const handleUpdateSadhana = () => {
    updateSadhanaMutation.mutate({
      chantingRounds,
      chantingTarget: 16,
      readingPrabhupada,
      bookTitle: readingPrabhupada ? bookTitle : null,
      pagesRead: readingPrabhupada ? pagesRead : 0,
      mangalaArati,
      hearing,
    });
  };

  const getStreakCount = () => {
    if (!sadhanaHistory) return 0;
    
    let streak = 0;
    const sortedHistory = [...sadhanaHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const entry of sortedHistory) {
      if ((entry.chantingRounds || 0) >= (entry.chantingTarget || 16) && entry.readingPrabhupada && entry.mangalaArati) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const availableChallenges = challenges?.filter(challenge => 
    !userChallenges?.some(uc => uc.challengeId === challenge.id)
  ) || [];

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-soft-gray dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sadhana Tracker</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* Today's Sadhana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Today's Practice</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chanting Rounds */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rounds Chanted</label>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setChantingRounds(Math.max(0, chantingRounds - 1))}
                >
                  -
                </Button>
                <Input 
                  type="number" 
                  value={chantingRounds} 
                  onChange={(e) => setChantingRounds(parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setChantingRounds(chantingRounds + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Reading Srila Prabhupada's Books */}
            <div className="space-y-3 p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="reading-prabhupada"
                  checked={readingPrabhupada} 
                  onCheckedChange={(checked) => setReadingPrabhupada(checked === true)}
                />
                <div className="flex items-center space-x-2">
                  <Book className="h-4 w-4 text-orange-600" />
                  <label htmlFor="reading-prabhupada" className="text-sm font-medium cursor-pointer">
                    Reading Srila Prabhupada's Books
                  </label>
                </div>
              </div>
              
              {readingPrabhupada && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label htmlFor="book-title" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Book Title
                    </label>
                    <Input
                      id="book-title"
                      type="text"
                      placeholder="e.g., Bhagavad-gita As It Is"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="pages-read" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Pages Read Today
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setPagesRead(Math.max(0, pagesRead - 1))}
                      >
                        -
                      </Button>
                      <Input 
                        id="pages-read"
                        type="number" 
                        value={pagesRead} 
                        onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setPagesRead(pagesRead + 1)}
                      >
                        +
                      </Button>
                      <span className="text-xs text-gray-500">pages</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mangala Arati */}
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <Checkbox 
                id="mangala-arati"
                checked={mangalaArati} 
                onCheckedChange={(checked) => setMangalaArati(checked === true)}
              />
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-orange-600" />
                <label htmlFor="mangala-arati" className="text-sm font-medium cursor-pointer">
                  Mangala Arati
                </label>
              </div>
            </div>

            {/* Hearing */}
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <Checkbox 
                id="hearing"
                checked={hearing} 
                onCheckedChange={(checked) => setHearing(checked === true)}
              />
              <div className="flex items-center space-x-2">
                <Headphones className="h-4 w-4 text-orange-600" />
                <label htmlFor="hearing" className="text-sm font-medium cursor-pointer">
                  Hearing Lectures
                </label>
              </div>
            </div>

            <Button 
              onClick={handleUpdateSadhana} 
              className="w-full"
              disabled={updateSadhanaMutation.isPending}
            >
              {updateSadhanaMutation.isPending ? "Updating..." : "Update Sadhana"}
            </Button>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-sacred-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-sacred-orange" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{getStreakCount()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Day streak</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        {userChallenges && userChallenges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userChallenges.map(uc => (
                <div key={uc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{uc.challenge.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {uc.progress || 0}/{uc.challenge.target} completed
                    </p>
                  </div>
                  <Badge variant={uc.completed ? "default" : "secondary"}>
                    {uc.completed ? "Completed" : `${Math.round(((uc.progress || 0) / uc.challenge.target) * 100)}%`}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Available Challenges */}
        {availableChallenges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Join Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableChallenges.map(challenge => (
                <div key={challenge.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{challenge.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{challenge.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => joinChallengeMutation.mutate(challenge.id)}
                      disabled={joinChallengeMutation.isPending}
                    >
                      Join
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {challenge.duration} days • Target: {challenge.target}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
