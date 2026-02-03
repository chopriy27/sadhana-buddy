import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, Plus, CheckCircle, Circle, Target, Book, Music, 
  Headphones, Settings, X, Sparkles, Flame, Sun, Moon,
  Heart, Flower2, Bell, Users, Coffee, ChevronsUpDown, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SadhanaEntry, UserGoals } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

// Srila Prabhupada's Books - Complete List
interface PrabhupadaBook {
  id: string;
  title: string;
  shortTitle: string;
  category: 'major' | 'small' | 'summary' | 'other';
  volumes?: number;
}

const PRABHUPADA_BOOKS: PrabhupadaBook[] = [
  // Major Works
  { id: 'bg', title: 'Bhagavad-gita As It Is', shortTitle: 'Bhagavad-gita', category: 'major' },
  { id: 'sb', title: 'Srimad-Bhagavatam', shortTitle: 'Srimad-Bhagavatam', category: 'major', volumes: 18 },
  { id: 'cc', title: 'Sri Caitanya-caritamrta', shortTitle: 'Caitanya-caritamrta', category: 'major', volumes: 17 },
  
  // Other Major Books
  { id: 'tqk', title: 'Teachings of Queen Kunti', shortTitle: 'Queen Kunti', category: 'major' },
  { id: 'tlc', title: 'Teachings of Lord Caitanya', shortTitle: 'Lord Caitanya', category: 'major' },
  { id: 'tlk', title: 'Teachings of Lord Kapila', shortTitle: 'Lord Kapila', category: 'major' },
  { id: 'nod', title: 'The Nectar of Devotion', shortTitle: 'Nectar of Devotion', category: 'major' },
  { id: 'noi', title: 'The Nectar of Instruction', shortTitle: 'Nectar of Instruction', category: 'major' },
  { id: 'iso', title: 'Sri Isopanisad', shortTitle: 'Isopanisad', category: 'major' },
  { id: 'kb', title: 'Krsna, The Supreme Personality of Godhead', shortTitle: 'Krsna Book', category: 'major', volumes: 2 },
  
  // Small Books
  { id: 'etkc', title: 'Easy Journey to Other Planets', shortTitle: 'Easy Journey', category: 'small' },
  { id: 'rtw', title: 'Raja-vidya: The King of Knowledge', shortTitle: 'Raja-vidya', category: 'small' },
  { id: 'etsp', title: 'Elevation to Krsna Consciousness', shortTitle: 'Elevation', category: 'small' },
  { id: 'kc', title: 'Krsna Consciousness: The Topmost Yoga System', shortTitle: 'Topmost Yoga', category: 'small' },
  { id: 'pqpa', title: 'Perfect Questions, Perfect Answers', shortTitle: 'Perfect Questions', category: 'small' },
  { id: 'btr', title: 'Beyond Birth and Death', shortTitle: 'Beyond Birth & Death', category: 'small' },
  { id: 'ots', title: 'On the Way to Krsna', shortTitle: 'On the Way to Krsna', category: 'small' },
  { id: 'tpk', title: 'The Path of Perfection', shortTitle: 'Path of Perfection', category: 'small' },
  { id: 'sob', title: 'The Science of Self-Realization', shortTitle: 'Self-Realization', category: 'small' },
  { id: 'poi', title: 'The Perfection of Yoga', shortTitle: 'Perfection of Yoga', category: 'small' },
  { id: 'mlyd', title: 'Message of Godhead', shortTitle: 'Message of Godhead', category: 'small' },
  { id: 'lsb', title: 'Life Comes from Life', shortTitle: 'Life Comes from Life', category: 'small' },
  { id: 'jsd', title: 'The Journey of Self-Discovery', shortTitle: 'Journey of Self-Discovery', category: 'small' },
  { id: 'crv', title: 'Civilization and Transcendence', shortTitle: 'Civilization & Transcendence', category: 'small' },
  { id: 'lrs', title: 'The Laws of Nature', shortTitle: 'Laws of Nature', category: 'small' },
  { id: 'rmad', title: 'Renunciation Through Wisdom', shortTitle: 'Renunciation Through Wisdom', category: 'small' },
  
  // Summary Studies
  { id: 'sspd', title: 'A Second Chance', shortTitle: 'A Second Chance', category: 'summary' },
  { id: 'dhama', title: 'Dharma: The Way of Transcendence', shortTitle: 'Dharma', category: 'summary' },
  { id: 'sspsa', title: 'Spiritual Yoga', shortTitle: 'Spiritual Yoga', category: 'summary' },
  { id: 'loi', title: 'The Light of the Bhagavata', shortTitle: 'Light of Bhagavata', category: 'summary' },
  
  // Other Works
  { id: 'btg', title: 'Back to Godhead Magazine', shortTitle: 'BTG Magazine', category: 'other' },
  { id: 'letters', title: 'Srila Prabhupada Letters', shortTitle: 'Letters', category: 'other' },
  { id: 'conv', title: 'Conversations with Srila Prabhupada', shortTitle: 'Conversations', category: 'other' },
  { id: 'other', title: 'Other Prabhupada Book', shortTitle: 'Other', category: 'other' },
];

// Custom Sadhana Items that users can choose from
interface CustomSadhanaItem {
  id: string;
  label: string;
  icon: React.ElementType;
  emoji: string;
  description: string;
  category: 'morning' | 'daily' | 'evening';
}

const AVAILABLE_SADHANA_ITEMS: CustomSadhanaItem[] = [
  { id: 'mangala_arati', label: 'Mangala Arati', icon: Sun, emoji: '🌅', description: 'Attend morning arati (4:30 AM)', category: 'morning' },
  { id: 'tulasi_puja', label: 'Tulasi Puja', icon: Flower2, emoji: '🌿', description: 'Worship Tulasi Devi', category: 'morning' },
  { id: 'guru_puja', label: 'Guru Puja', icon: Heart, emoji: '🙏', description: 'Attend Guru Puja ceremony', category: 'morning' },
  { id: 'deity_worship', label: 'Deity Worship', icon: Sparkles, emoji: '✨', description: 'Personal deity worship at home', category: 'morning' },
  { id: 'offer_flowers', label: 'Offer Flowers/Arati', icon: Flower2, emoji: '🌸', description: 'Offer flowers or perform arati', category: 'daily' },
  { id: 'sing_bhajans', label: 'Sing Bhajans', icon: Music, emoji: '🎵', description: 'Sing devotional songs', category: 'daily' },
  { id: 'hear_class', label: 'Hear Bhagavatam Class', icon: Users, emoji: '📚', description: 'Attend or hear Bhagavatam class', category: 'morning' },
  { id: 'prasadam', label: 'Honor Prasadam', icon: Coffee, emoji: '🍽️', description: 'Only eat Krishna prasadam', category: 'daily' },
  { id: 'evening_arati', label: 'Evening Arati', icon: Moon, emoji: '🌙', description: 'Attend Gaura Arati', category: 'evening' },
  { id: 'gayatri', label: 'Chant Gayatri', icon: Bell, emoji: '🔔', description: 'Chant Gayatri mantras', category: 'daily' },
  { id: 'service', label: 'Temple/Devotee Service', icon: Heart, emoji: '💝', description: 'Perform seva for Krishna', category: 'daily' },
];

// Circular Progress Ring Component
function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = "#f97316",
  bgColor = "#fed7aa",
  children 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// Confetti Celebration Component
function Confetti({ show }: { show: boolean }) {
  const confettiPieces = useMemo(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: ['#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
      size: 6 + Math.random() * 8,
    })), []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          initial={{ 
            top: -20, 
            left: `${piece.x}%`,
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            top: '110%',
            rotate: 720,
            opacity: 0 
          }}
          transition={{ 
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn"
          }}
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

// Celebration Modal
function CelebrationModal({ 
  show, 
  onClose, 
  message 
}: { 
  show: boolean; 
  onClose: () => void; 
  message: string;
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
        >
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white px-8 py-6 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-4xl mb-4 font-bold"
            >
              ✓
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Hare Krishna!</h3>
            <p className="text-orange-100">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Tracker() {
  const { user } = useAuth();
  const [chantingRounds, setChantingRounds] = useState(0);
  const [readingPrabhupada, setReadingPrabhupada] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [pagesRead, setPagesRead] = useState(0);
  const [hearingLectures, setHearingLectures] = useState(0);
  
  // Custom sadhana items state
  const [enabledItems, setEnabledItems] = useState<string[]>([]);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [prevProgress, setPrevProgress] = useState(0);
  
  // Book selector state
  const [bookSelectorOpen, setBookSelectorOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  // Load enabled items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('enabledSadhanaItems');
    if (saved) {
      setEnabledItems(JSON.parse(saved));
    }
  }, []);

  // Load completed items for today from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`completedSadhanaItems_${today}`);
    if (saved) {
      setCompletedItems(JSON.parse(saved));
    }
  }, [today]);

  // Save enabled items to localStorage
  const saveEnabledItems = (items: string[]) => {
    setEnabledItems(items);
    localStorage.setItem('enabledSadhanaItems', JSON.stringify(items));
  };

  // Toggle item completion
  const toggleItemComplete = (itemId: string) => {
    const newCompleted = { ...completedItems, [itemId]: !completedItems[itemId] };
    setCompletedItems(newCompleted);
    localStorage.setItem(`completedSadhanaItems_${today}`, JSON.stringify(newCompleted));
  };

  const { data: todaysSadhana } = useQuery<SadhanaEntry | null>({
    queryKey: [`/api/sadhana/${user?.id}/today`],
    refetchOnMount: true,
    enabled: !!user?.id,
  });

  const { data: sadhanaHistory } = useQuery<SadhanaEntry[]>({
    queryKey: [`/api/sadhana/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: userGoals } = useQuery<UserGoals>({
    queryKey: [`/api/goals/${user?.id}`],
    enabled: !!user?.id,
  });

  // Calculate progress percentages
  const chantingGoal = userGoals?.dailyChantingRounds || 16;
  const readingGoal = userGoals?.dailyReadingPages || 5;
  const hearingGoal = userGoals?.dailyHearingLectures || 30;

  const chantingProgress = Math.min((chantingRounds / chantingGoal) * 100, 100);
  const readingProgress = Math.min((pagesRead / readingGoal) * 100, 100);
  const hearingProgress = Math.min((hearingLectures / hearingGoal) * 100, 100);
  
  const roundsToGo = Math.max(chantingGoal - chantingRounds, 0);

  // Overall progress
  const overallProgress = (chantingProgress + readingProgress + hearingProgress) / 3;

  // Check for goal completion and trigger celebration
  useEffect(() => {
    if (chantingProgress >= 100 && prevProgress < 100) {
      setCelebrationMessage("You completed your chanting rounds!");
      setShowCelebration(true);
    }
    setPrevProgress(chantingProgress);
  }, [chantingProgress, prevProgress]);

  // Set initial values when data loads
  useEffect(() => {
    if (todaysSadhana) {
      setChantingRounds(todaysSadhana.chantingRounds || 0);
      setReadingPrabhupada(todaysSadhana.readingPrabhupada || false);
      setBookTitle(todaysSadhana.bookTitle || "");
      setPagesRead(todaysSadhana.pagesRead || 0);
      setHearingLectures(todaysSadhana.hearingLectures || 0);
      setPrevProgress(((todaysSadhana.chantingRounds || 0) / chantingGoal) * 100);
    }
  }, [todaysSadhana, chantingGoal]);

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
      toast({ title: "Sadhana updated!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to update sadhana", 
        variant: "destructive" 
      });
    },
  });

  const handleUpdateSadhana = () => {
    updateSadhanaMutation.mutate({
      chantingRounds,
      readingPrabhupada,
      bookTitle: readingPrabhupada ? bookTitle : null,
      pagesRead: readingPrabhupada ? pagesRead : 0,
      hearingLectures,
    });
  };

  const getStreakCount = () => {
    if (!sadhanaHistory) return 0;
    
    let streak = 0;
    const sortedHistory = [...sadhanaHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const entry of sortedHistory) {
      if ((entry.chantingRounds || 0) >= chantingGoal && entry.readingPrabhupada) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Get enabled items with their details
  const activeItems = AVAILABLE_SADHANA_ITEMS.filter(item => enabledItems.includes(item.id));
  const completedCount = activeItems.filter(item => completedItems[item.id]).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">
      {/* Confetti */}
      <Confetti show={showCelebration} />
      
      {/* Celebration Modal */}
      <CelebrationModal 
        show={showCelebration} 
        onClose={() => setShowCelebration(false)}
        message={celebrationMessage}
      />

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Sadhana Tracker</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Progress Dashboard */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-orange-100 text-sm">Today's Progress</p>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                <span className="font-bold">{getStreakCount()} day streak</span>
              </div>
            </div>
          </div>
          
          <CardContent className="pt-6">
            {/* Main Progress Rings */}
            <div className="flex justify-around items-center mb-6">
              {/* Chanting Progress */}
              <div className="text-center">
                <ProgressRing 
                  progress={chantingProgress} 
                  size={100}
                  color={chantingProgress >= 100 ? "#22c55e" : "#f97316"}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {chantingRounds}
                    </p>
                    <p className="text-[10px] text-gray-500">/{chantingGoal}</p>
                  </div>
                </ProgressRing>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">Japa</p>
                {roundsToGo > 0 && (
                  <p className="text-[10px] text-orange-600 font-medium">{roundsToGo} to go!</p>
                )}
                {roundsToGo === 0 && (
                  <p className="text-[10px] text-green-600 font-medium">✓ Complete!</p>
                )}
              </div>

              {/* Reading Progress */}
              <div className="text-center">
                <ProgressRing 
                  progress={readingProgress} 
                  size={80}
                  strokeWidth={6}
                  color={readingProgress >= 100 ? "#22c55e" : "#3b82f6"}
                  bgColor="#bfdbfe"
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {pagesRead}
                    </p>
                    <p className="text-[9px] text-gray-500">/{readingGoal}</p>
                  </div>
                </ProgressRing>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">Reading</p>
              </div>

              {/* Hearing Progress */}
              <div className="text-center">
                <ProgressRing 
                  progress={hearingProgress} 
                  size={80}
                  strokeWidth={6}
                  color={hearingProgress >= 100 ? "#22c55e" : "#8b5cf6"}
                  bgColor="#ddd6fe"
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {hearingLectures}
                    </p>
                    <p className="text-[9px] text-gray-500">/{hearingGoal}</p>
                  </div>
                </ProgressRing>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">Hearing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Sadhana Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span>Log Today's Sadhana</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Japa */}
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="japa-checkbox"
                    checked={chantingRounds > 0}
                    onCheckedChange={(checked) => {
                      if (!checked) setChantingRounds(0);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center">
                      <span className="text-orange-700 dark:text-orange-200 text-xs font-bold">108</span>
                    </div>
                    <label htmlFor="japa-checkbox" className="text-sm font-medium cursor-pointer">Japa</label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setChantingRounds(Math.max(0, chantingRounds - 1))}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    value={chantingRounds} 
                    onChange={(e) => setChantingRounds(parseInt(e.target.value) || 0)}
                    className="w-14 text-center h-8"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setChantingRounds(chantingRounds + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              {/* Quick add buttons */}
              <div className="flex gap-2 justify-center">
                {[4, 8, 16].map(num => (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setChantingRounds(chantingRounds + num)}
                  >
                    +{num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reading */}
            <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="reading-prabhupada"
                  checked={readingPrabhupada} 
                  onCheckedChange={(checked) => setReadingPrabhupada(checked === true)}
                />
                <div className="flex items-center space-x-2">
                  <Book className="w-5 h-5 text-blue-500" />
                  <label htmlFor="reading-prabhupada" className="text-sm font-medium cursor-pointer">
                    Reading
                  </label>
                </div>
              </div>
              
              {readingPrabhupada && (
                <div className="ml-6 space-y-3">
                  {/* Book Selector Dropdown */}
                  <Popover open={bookSelectorOpen} onOpenChange={setBookSelectorOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={bookSelectorOpen}
                        className="w-full justify-between h-9 text-sm font-normal"
                      >
                        {bookTitle
                          ? PRABHUPADA_BOOKS.find((book) => book.title === bookTitle)?.shortTitle || bookTitle
                          : "Select a book..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search books..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No book found.</CommandEmpty>
                          <CommandGroup heading="Major Works">
                            {PRABHUPADA_BOOKS.filter(b => b.category === 'major').map((book) => (
                              <CommandItem
                                key={book.id}
                                value={book.title}
                                onSelect={() => {
                                  setBookTitle(book.title);
                                  setBookSelectorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    bookTitle === book.title ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <span className="text-sm">{book.shortTitle}</span>
                                  {book.volumes && (
                                    <span className="ml-1 text-xs text-gray-400">({book.volumes} vols)</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup heading="Small Books">
                            {PRABHUPADA_BOOKS.filter(b => b.category === 'small').map((book) => (
                              <CommandItem
                                key={book.id}
                                value={book.title}
                                onSelect={() => {
                                  setBookTitle(book.title);
                                  setBookSelectorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    bookTitle === book.title ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-sm">{book.shortTitle}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup heading="Summary Studies">
                            {PRABHUPADA_BOOKS.filter(b => b.category === 'summary').map((book) => (
                              <CommandItem
                                key={book.id}
                                value={book.title}
                                onSelect={() => {
                                  setBookTitle(book.title);
                                  setBookSelectorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    bookTitle === book.title ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-sm">{book.shortTitle}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup heading="Other">
                            {PRABHUPADA_BOOKS.filter(b => b.category === 'other').map((book) => (
                              <CommandItem
                                key={book.id}
                                value={book.title}
                                onSelect={() => {
                                  setBookTitle(book.title);
                                  setBookSelectorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    bookTitle === book.title ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="text-sm">{book.shortTitle}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Pages read counter */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPagesRead(Math.max(0, pagesRead - 1))}
                    >
                      -
                    </Button>
                    <Input 
                      type="number" 
                      value={pagesRead} 
                      onChange={(e) => setPagesRead(parseInt(e.target.value) || 0)}
                      className="w-16 text-center h-8"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPagesRead(pagesRead + 1)}
                    >
                      +
                    </Button>
                    <span className="text-xs text-gray-500">pages</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hearing */}
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="hearing-checkbox"
                    checked={hearingLectures > 0}
                    onCheckedChange={(checked) => {
                      if (!checked) setHearingLectures(0);
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <Headphones className="w-5 h-5 text-purple-500" />
                    <label htmlFor="hearing-checkbox" className="text-sm font-medium cursor-pointer">Hearing</label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setHearingLectures(Math.max(0, hearingLectures - 10))}
                  >
                    -
                  </Button>
                  <div className="flex items-center gap-1">
                    <Input 
                      type="number" 
                      value={hearingLectures} 
                      onChange={(e) => setHearingLectures(parseInt(e.target.value) || 0)}
                      className="w-14 text-center h-8"
                    />
                    <span className="text-xs text-gray-500">min</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setHearingLectures(hearingLectures + 10)}
                  >
                    +
                  </Button>
                </div>
              </div>
              {/* Quick add buttons */}
              <div className="flex gap-2 justify-center">
                {[10, 30, 60].map(num => (
                  <Button
                    key={num}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setHearingLectures(hearingLectures + num)}
                  >
                    +{num}min
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleUpdateSadhana} 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              disabled={updateSadhanaMutation.isPending}
            >
              {updateSadhanaMutation.isPending ? "Saving..." : "Save Sadhana"}
            </Button>
          </CardContent>
        </Card>

        {/* Custom Sadhana Items */}
        {activeItems.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Daily Practices
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {completedCount}/{activeItems.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial={false}
                    animate={{ 
                      backgroundColor: completedItems[item.id] ? 'rgb(220 252 231)' : 'transparent',
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <Checkbox 
                      id={item.id}
                      checked={completedItems[item.id] || false}
                      onCheckedChange={() => toggleItemComplete(item.id)}
                    />
                    <span className="text-lg">{item.emoji}</span>
                    <label 
                      htmlFor={item.id}
                      className={`flex-1 text-sm font-medium cursor-pointer ${
                        completedItems[item.id] ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {item.label}
                    </label>
                    {completedItems[item.id] && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-500"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-xs text-gray-500"
                onClick={() => setShowSettings(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add more practices
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Prompt to add custom items if none selected */}
        {activeItems.length === 0 && (
          <Card className="border-dashed border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                Customize Your Sadhana
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add practices like Mangala Arati, Deity worship, and more
              </p>
              <Button 
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Choose Practices
              </Button>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Settings Sheet - Choose Custom Sadhana Items */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Customize Your Sadhana</SheetTitle>
            <SheetDescription>
              Choose which practices you want to track daily
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4 space-y-4 overflow-y-auto max-h-[60vh] pb-20">
            {/* Morning Practices */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Sun className="w-4 h-4" /> Morning Practices
              </h3>
              <div className="space-y-2">
                {AVAILABLE_SADHANA_ITEMS.filter(i => i.category === 'morning').map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      enabledItems.includes(item.id) 
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => {
                      if (enabledItems.includes(item.id)) {
                        saveEnabledItems(enabledItems.filter(i => i !== item.id));
                      } else {
                        saveEnabledItems([...enabledItems, item.id]);
                      }
                    }}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    {enabledItems.includes(item.id) && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Practices */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Daily Practices
              </h3>
              <div className="space-y-2">
                {AVAILABLE_SADHANA_ITEMS.filter(i => i.category === 'daily').map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      enabledItems.includes(item.id) 
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => {
                      if (enabledItems.includes(item.id)) {
                        saveEnabledItems(enabledItems.filter(i => i !== item.id));
                      } else {
                        saveEnabledItems([...enabledItems, item.id]);
                      }
                    }}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    {enabledItems.includes(item.id) && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Evening Practices */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Moon className="w-4 h-4" /> Evening Practices
              </h3>
              <div className="space-y-2">
                {AVAILABLE_SADHANA_ITEMS.filter(i => i.category === 'evening').map(item => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      enabledItems.includes(item.id) 
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => {
                      if (enabledItems.includes(item.id)) {
                        saveEnabledItems(enabledItems.filter(i => i !== item.id));
                      } else {
                        saveEnabledItems([...enabledItems, item.id]);
                      }
                    }}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    {enabledItems.includes(item.id) && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t">
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
              onClick={() => setShowSettings(false)}
            >
              Done ({enabledItems.length} selected)
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
