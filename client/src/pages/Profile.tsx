import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, BookOpen, Target, Award, Calendar, TrendingUp, LogOut, 
  Edit3, Save, X, Search, UserPlus, Users, Check, Clock, Heart,
  Settings, ChevronRight, Bell, Shield, HelpCircle, MessageCircle,
  Mail, Globe, Eye, EyeOff, Lock, Smartphone, Volume2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { UserProgress, SadhanaEntry, JournalEntry, UserGoals, InsertUserGoals } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";

// Mock friend data (in real app, this would come from the backend)
interface Friend {
  id: string;
  name: string;
  profileImage?: string;
  status: 'online' | 'offline';
  chantingStreak?: number;
}

interface FriendRequest {
  id: string;
  from: Friend;
  sentAt: Date;
}

// Mock users for search (in production, this would be an API call)
const MOCK_USERS: Friend[] = [
  { id: '1', name: 'Govinda Das', status: 'online', chantingStreak: 45 },
  { id: '2', name: 'Radha Priya', status: 'offline', chantingStreak: 30 },
  { id: '3', name: 'Krishna Bhakta', status: 'online', chantingStreak: 60 },
  { id: '4', name: 'Tulasi Devi', status: 'offline', chantingStreak: 15 },
  { id: '5', name: 'Madhava Das', status: 'online', chantingStreak: 90 },
  { id: '6', name: 'Yamuna Dasi', status: 'offline', chantingStreak: 25 },
];

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [showFindFriends, setShowFindFriends] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]); // IDs of users we've sent requests to
  
  // Settings dialogs state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Edit profile form state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  
  // Notification settings (stored in localStorage for now)
  const [notifDailyReminder, setNotifDailyReminder] = useState(true);
  const [notifFestivalAlerts, setNotifFestivalAlerts] = useState(true);
  const [notifFriendRequests, setNotifFriendRequests] = useState(true);
  const [notifSoundEnabled, setNotifSoundEnabled] = useState(false);
  
  // Privacy settings (stored in localStorage for now)
  const [privacyProfileVisible, setPrivacyProfileVisible] = useState(true);
  const [privacyShowStreak, setPrivacyShowStreak] = useState(true);
  const [privacyShowActivity, setPrivacyShowActivity] = useState(false);
  
  // Goals editing state
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [editChantingRounds, setEditChantingRounds] = useState(16);
  const [editReadingPages, setEditReadingPages] = useState(10);
  const [editHearingMinutes, setEditHearingMinutes] = useState(30);

  // Load friends from localStorage
  useEffect(() => {
    const savedFriends = localStorage.getItem('devotee_friends');
    const savedRequests = localStorage.getItem('friend_requests');
    const savedPending = localStorage.getItem('pending_friend_requests');
    
    if (savedFriends) setFriends(JSON.parse(savedFriends));
    if (savedRequests) setFriendRequests(JSON.parse(savedRequests));
    if (savedPending) setPendingRequests(JSON.parse(savedPending));
  }, []);
  
  // Load notification and privacy settings from localStorage
  useEffect(() => {
    const savedNotifSettings = localStorage.getItem('notification_settings');
    const savedPrivacySettings = localStorage.getItem('privacy_settings');
    
    if (savedNotifSettings) {
      const settings = JSON.parse(savedNotifSettings);
      setNotifDailyReminder(settings.dailyReminder ?? true);
      setNotifFestivalAlerts(settings.festivalAlerts ?? true);
      setNotifFriendRequests(settings.friendRequests ?? true);
      setNotifSoundEnabled(settings.soundEnabled ?? false);
    }
    
    if (savedPrivacySettings) {
      const settings = JSON.parse(savedPrivacySettings);
      setPrivacyProfileVisible(settings.profileVisible ?? true);
      setPrivacyShowStreak(settings.showStreak ?? true);
      setPrivacyShowActivity(settings.showActivity ?? false);
    }
  }, []);
  
  // Initialize edit profile form when user data changes or dialog opens
  useEffect(() => {
    if (showEditProfile && user) {
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
      setEditBio('');
    }
  }, [showEditProfile, user]);

  // Save friends to localStorage
  const saveFriends = (newFriends: Friend[]) => {
    setFriends(newFriends);
    localStorage.setItem('devotee_friends', JSON.stringify(newFriends));
  };

  const savePendingRequests = (requests: string[]) => {
    setPendingRequests(requests);
    localStorage.setItem('pending_friend_requests', JSON.stringify(requests));
  };
  
  // Save notification settings
  const saveNotificationSettings = () => {
    const settings = {
      dailyReminder: notifDailyReminder,
      festivalAlerts: notifFestivalAlerts,
      friendRequests: notifFriendRequests,
      soundEnabled: notifSoundEnabled,
    };
    localStorage.setItem('notification_settings', JSON.stringify(settings));
    toast({ title: "Notification settings saved!" });
    setShowNotifications(false);
  };
  
  // Save privacy settings
  const savePrivacySettings = () => {
    const settings = {
      profileVisible: privacyProfileVisible,
      showStreak: privacyShowStreak,
      showActivity: privacyShowActivity,
    };
    localStorage.setItem('privacy_settings', JSON.stringify(settings));
    toast({ title: "Privacy settings saved!" });
    setShowPrivacy(false);
  };
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      const response = await fetch(`/api/user/${user?.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: "Profile updated!" });
      setShowEditProfile(false);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });
  
  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
    });
  };
  
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
    queryKey: [`/api/goals/${user?.id}`],
    enabled: !!user?.id,
  });

  // Calculate statistics
  const totalDays = sadhanaEntries?.length || 0;
  const totalRounds = sadhanaEntries?.reduce((sum, entry) => sum + (entry.chantingRounds || 0), 0) || 0;
  const averageRounds = totalDays > 0 ? totalRounds / totalDays : 0;
  const currentStreak = userProgress?.currentStreak || 0;
  const longestStreak = userProgress?.longestStreak || 0;

  // Update goals mutation
  const updateGoalsMutation = useMutation({
    mutationFn: async (goals: { dailyChantingRounds: number; dailyReadingPages: number; dailyHearingLectures: number }) => {
      return apiRequest('PUT', `/api/goals/${user?.id}`, goals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/${user?.id}`] });
      toast({ title: "Goals updated!" });
      setShowEditGoals(false);
    },
    onError: () => {
      toast({ 
        title: "Failed to update goals", 
        variant: "destructive" 
      });
    },
  });

  // Load goals into edit form when opening dialog
  const openEditGoals = () => {
    if (userGoals) {
      setEditChantingRounds(userGoals.dailyChantingRounds);
      setEditReadingPages(userGoals.dailyReadingPages);
      setEditHearingMinutes(userGoals.dailyHearingLectures);
    }
    setShowEditGoals(true);
  };

  const handleSaveGoals = () => {
    updateGoalsMutation.mutate({
      dailyChantingRounds: editChantingRounds,
      dailyReadingPages: editReadingPages,
      dailyHearingLectures: editHearingMinutes,
    });
  };

  // Search users
  const searchResults = searchQuery.length >= 2 
    ? MOCK_USERS.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !friends.some(f => f.id === u.id) &&
        u.id !== user?.id
      )
    : [];

  // Send friend request
  const sendFriendRequest = (targetUser: Friend) => {
    // In a real app, this would be an API call
    savePendingRequests([...pendingRequests, targetUser.id]);
    toast({ 
      title: "Friend request sent!",
      description: `Request sent to ${targetUser.name}`
    });
  };

  // Accept friend request
  const acceptFriendRequest = (request: FriendRequest) => {
    saveFriends([...friends, request.from]);
    setFriendRequests(friendRequests.filter(r => r.id !== request.id));
    localStorage.setItem('friend_requests', JSON.stringify(friendRequests.filter(r => r.id !== request.id)));
    toast({ 
      title: "Friend added!",
      description: `You are now friends with ${request.from.name}`
    });
  };

  // Remove friend
  const removeFriend = (friendId: string) => {
    saveFriends(friends.filter(f => f.id !== friendId));
    toast({ title: "Friend removed" });
  };

  // For demo: Simulate accepting a friend request for someone we sent to
  const simulateAcceptedRequest = (userId: string) => {
    const newFriend = MOCK_USERS.find(u => u.id === userId);
    if (newFriend) {
      saveFriends([...friends, newFriend]);
      savePendingRequests(pendingRequests.filter(id => id !== userId));
      toast({ 
        title: "Friend request accepted!",
        description: `${newFriend.name} accepted your request`
      });
    }
  };

  const achievements = [
    { title: "First Steps", desc: "Complete first sadhana", done: totalDays > 0, icon: "1" },
    { title: "Consistent", desc: "7-day streak", done: longestStreak >= 7, icon: "7" },
    { title: "Devoted", desc: "108 rounds total", done: totalRounds >= 108, icon: "108" },
    { title: "Reflective", desc: "10 journal entries", done: (journalEntries?.length || 0) >= 10, icon: "10" },
  ];

  const completedAchievements = achievements.filter(a => a.done).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Profile</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* User Profile Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-20" />
          <CardContent className="pt-0 -mt-10">
            <div className="flex items-end gap-4">
              {/* Profile Avatar */}
              <div className="relative">
                <Avatar 
                  name={user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.displayName || user?.email}
                  email={user?.email}
                  imageUrl={user?.profileImageUrl}
                  size="xl"
                  className="border-4 border-white dark:border-gray-800 shadow-lg"
                />
              </div>

              <div className="flex-1 pb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {user?.firstName || user?.lastName ? 
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                    'Devotee'
                  }
                </h2>
                {user?.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-around mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{currentStreak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{totalRounds}</p>
                <p className="text-xs text-gray-500">Total Rounds</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">{friends.length}</p>
                <p className="text-xs text-gray-500">Friends</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{completedAchievements}</p>
                <p className="text-xs text-gray-500">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Friends Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Devotee Friends
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFindFriends(true)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Find
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-sm text-gray-500 mb-3">No friends yet</p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFindFriends(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Devotees
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.slice(0, 4).map(friend => (
                  <div 
                    key={friend.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="relative">
                      <Avatar name={friend.name} imageUrl={friend.profileImage} size="sm" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{friend.name}</p>
                      {friend.chantingStreak && (
                        <p className="text-xs text-gray-500">{friend.chantingStreak} day streak</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
                
                {friends.length > 4 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm text-orange-500"
                    onClick={() => setShowFindFriends(true)}
                  >
                    View all {friends.length} friends
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {achievements.map((achievement, i) => (
                <div 
                  key={i}
                  className={`text-center p-2 rounded-xl ${
                    achievement.done 
                      ? 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30' 
                      : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <p className="text-[10px] font-medium mt-1 truncate">{achievement.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals Overview */}
        {userGoals && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Daily Goals
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={openEditGoals}
                  className="h-8 px-2"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Japa</span>
                  <Badge variant="secondary">{userGoals.dailyChantingRounds} rounds</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reading</span>
                  <Badge variant="secondary">{userGoals.dailyReadingPages} pages</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hearing</span>
                  <Badge variant="secondary">{userGoals.dailyHearingLectures} min</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Find Friends Sheet */}
      <Sheet open={showFindFriends} onOpenChange={setShowFindFriends}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Find Devotee Friends</SheetTitle>
            <SheetDescription>
              Connect with other devotees on their spiritual journey
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="search" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="friends">
                Friends ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="mt-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search devotees by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <p className="text-center text-sm text-gray-500 py-8">
                    Type at least 2 characters to search
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">
                    No devotees found matching "{searchQuery}"
                  </p>
                ) : (
                  searchResults.map(userResult => (
                    <motion.div
                      key={userResult.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <Avatar name={userResult.name} size="md" />
                      <div className="flex-1">
                        <p className="font-medium">{userResult.name}</p>
                        {userResult.chantingStreak && (
                          <p className="text-xs text-gray-500">{userResult.chantingStreak} day streak</p>
                        )}
                      </div>
                      {pendingRequests.includes(userResult.id) ? (
                        <Button variant="secondary" size="sm" disabled>
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => sendFriendRequest(userResult)}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Friends Tab */}
            <TabsContent value="friends" className="mt-4">
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No friends yet</p>
                    <p className="text-xs text-gray-400">Search and add devotees!</p>
                  </div>
                ) : (
                  friends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="relative">
                        <Avatar name={friend.name} size="md" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{friend.name}</p>
                        {friend.chantingStreak && (
                          <p className="text-xs text-gray-500">{friend.chantingStreak} day streak</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeFriend(friend.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Pending Tab */}
            <TabsContent value="pending" className="mt-4">
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No pending requests</p>
                  </div>
                ) : (
                  pendingRequests.map(userId => {
                    const pendingUser = MOCK_USERS.find(u => u.id === userId);
                    if (!pendingUser) return null;
                    
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                      >
                        <Avatar name={pendingUser.name} size="md" />
                        <div className="flex-1">
                          <p className="font-medium">{pendingUser.name}</p>
                          <p className="text-xs text-amber-600">Request pending...</p>
                        </div>
                        {/* Demo button to simulate acceptance */}
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => simulateAcceptedRequest(userId)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Simulate Accept
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Account</h3>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setShowEditProfile(true)}
              >
                <User className="w-4 h-4 mr-3" />
                Edit Profile
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-4 h-4 mr-3" />
                Notifications
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setShowPrivacy(true)}
              >
                <Shield className="w-4 h-4 mr-3" />
                Privacy
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Support</h3>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => window.open('mailto:support@sadhanabuddy.com?subject=Help%20Request', '_blank')}
              >
                <HelpCircle className="w-4 h-4 mr-3" />
                Help Center
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => window.open('mailto:feedback@sadhanabuddy.com?subject=App%20Feedback', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-3" />
                Feedback
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="text-center text-xs text-gray-400 pt-4">
              <p>Sadhana Buddy v1.0</p>
              <p>Made with devotion for devotees worldwide</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-orange-500" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="Your first name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Your last name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400">Email cannot be changed</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-amber-500"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Notification Settings
            </DialogTitle>
            <DialogDescription>
              Customize how you receive reminders and alerts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Daily Sadhana Reminder</Label>
                <p className="text-xs text-gray-500">Get reminded to log your daily practice</p>
              </div>
              <Switch
                checked={notifDailyReminder}
                onCheckedChange={setNotifDailyReminder}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Festival Alerts</Label>
                <p className="text-xs text-gray-500">Notifications for upcoming festivals</p>
              </div>
              <Switch
                checked={notifFestivalAlerts}
                onCheckedChange={setNotifFestivalAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Friend Requests</Label>
                <p className="text-xs text-gray-500">Notify when someone sends a friend request</p>
              </div>
              <Switch
                checked={notifFriendRequests}
                onCheckedChange={setNotifFriendRequests}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Sound Effects
                </Label>
                <p className="text-xs text-gray-500">Play sounds for notifications</p>
              </div>
              <Switch
                checked={notifSoundEnabled}
                onCheckedChange={setNotifSoundEnabled}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifications(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveNotificationSettings}
              className="bg-gradient-to-r from-orange-500 to-amber-500"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Privacy Settings
            </DialogTitle>
            <DialogDescription>
              Control who can see your profile and activity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Profile Visibility
                </Label>
                <p className="text-xs text-gray-500">Allow others to find you in search</p>
              </div>
              <Switch
                checked={privacyProfileVisible}
                onCheckedChange={setPrivacyProfileVisible}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Show Chanting Streak</Label>
                <p className="text-xs text-gray-500">Display your streak to friends</p>
              </div>
              <Switch
                checked={privacyShowStreak}
                onCheckedChange={setPrivacyShowStreak}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Share Activity</Label>
                <p className="text-xs text-gray-500">Let friends see when you log sadhana</p>
              </div>
              <Switch
                checked={privacyShowActivity}
                onCheckedChange={setPrivacyShowActivity}
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Your Data is Secure</p>
                    <p className="text-xs text-amber-600 dark:text-amber-300">
                      Your journal entries and personal sadhana data are always private and encrypted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrivacy(false)}>
              Cancel
            </Button>
            <Button 
              onClick={savePrivacySettings}
              className="bg-gradient-to-r from-orange-500 to-amber-500"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goals Dialog */}
      <Dialog open={showEditGoals} onOpenChange={setShowEditGoals}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Edit Daily Goals
            </DialogTitle>
            <DialogDescription>
              Set your daily spiritual practice targets
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="chanting-goal" className="text-sm font-medium">
                Japa (rounds)
              </Label>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditChantingRounds(Math.max(1, editChantingRounds - 1))}
                >
                  -
                </Button>
                <Input
                  id="chanting-goal"
                  type="number"
                  min="1"
                  max="192"
                  value={editChantingRounds}
                  onChange={(e) => setEditChantingRounds(parseInt(e.target.value) || 1)}
                  className="text-center w-20"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditChantingRounds(Math.min(192, editChantingRounds + 1))}
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">rounds</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="reading-goal" className="text-sm font-medium">
                Reading (pages)
              </Label>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditReadingPages(Math.max(1, editReadingPages - 1))}
                >
                  -
                </Button>
                <Input
                  id="reading-goal"
                  type="number"
                  min="1"
                  max="100"
                  value={editReadingPages}
                  onChange={(e) => setEditReadingPages(parseInt(e.target.value) || 1)}
                  className="text-center w-20"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditReadingPages(Math.min(100, editReadingPages + 1))}
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">pages</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="hearing-goal" className="text-sm font-medium">
                Hearing (minutes)
              </Label>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditHearingMinutes(Math.max(10, editHearingMinutes - 10))}
                >
                  -
                </Button>
                <Input
                  id="hearing-goal"
                  type="number"
                  min="10"
                  max="480"
                  step="10"
                  value={editHearingMinutes}
                  onChange={(e) => setEditHearingMinutes(parseInt(e.target.value) || 10)}
                  className="text-center w-20"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditHearingMinutes(Math.min(480, editHearingMinutes + 10))}
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">min</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setEditHearingMinutes(30)}>30 min</Button>
                <Button variant="outline" size="sm" onClick={() => setEditHearingMinutes(60)}>1 hr</Button>
                <Button variant="outline" size="sm" onClick={() => setEditHearingMinutes(90)}>1.5 hr</Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGoals(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveGoals}
              disabled={updateGoalsMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-amber-500"
            >
              {updateGoalsMutation.isPending ? "Saving..." : "Save Goals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
