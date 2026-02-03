import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, BookOpen, Feather, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow, format } from "date-fns";
import type { JournalEntry } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

const moods = [
  { value: "grateful", label: "Grateful", icon: "♡", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  { value: "reflective", label: "Reflective", icon: "◇", color: "from-amber-400 to-orange-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  { value: "inspired", label: "Inspired", icon: "✦", color: "from-orange-400 to-red-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
  { value: "peaceful", label: "Peaceful", icon: "○", color: "from-sky-400 to-blue-500", bg: "bg-sky-50 dark:bg-sky-900/20", border: "border-sky-200 dark:border-sky-800" },
  { value: "devotional", label: "Devotional", icon: "❖", color: "from-rose-400 to-pink-500", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800" },
];

export default function Journal() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: journalEntries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: [`/api/journal/${user?.id}`],
    enabled: !!user?.id,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; mood?: string }) => {
      return apiRequest('POST', '/api/journal', {
        userId: user?.id,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/journal/${user?.id}`] });
      setIsSheetOpen(false);
      resetForm();
      toast({ title: "Entry saved!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to save entry", 
        variant: "destructive" 
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<JournalEntry> }) => {
      return apiRequest('PUT', `/api/journal/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/journal/${user?.id}`] });
      setIsSheetOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({ title: "Entry updated!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to update entry", 
        variant: "destructive" 
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/journal/${user?.id}`] });
      toast({ title: "Entry deleted" });
    },
    onError: () => {
      toast({ 
        title: "Failed to delete entry", 
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMood("");
  };

  const handleCreateNew = () => {
    resetForm();
    setEditingEntry(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || "");
    setEditingEntry(entry);
    setIsSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({ 
        title: "Please fill in all fields", 
        variant: "destructive" 
      });
      return;
    }

    const data = {
      title: title.trim(),
      content: content.trim(),
      mood: mood || undefined,
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data });
    } else {
      createEntryMutation.mutate(data);
    }
  };

  const getMoodData = (moodValue: string) => {
    return moods.find(m => m.value === moodValue) || { 
      icon: "📝", 
      color: "from-gray-400 to-gray-500", 
      bg: "bg-gray-50 dark:bg-gray-800",
      border: "border-gray-200 dark:border-gray-700"
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Journal</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Spiritual Reflections</p>
            </div>
          </div>
          <Button 
            onClick={handleCreateNew} 
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Write
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Stats Banner */}
        {journalEntries && journalEntries.length > 0 && (
          <div className="mb-4 p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-orange-100 dark:border-gray-700">
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{journalEntries.length}</p>
                <p className="text-[10px] text-gray-500">Entries</p>
              </div>
              <div className="w-px h-8 bg-orange-200 dark:bg-gray-600" />
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {moods.filter(m => journalEntries.some(e => e.mood === m.value)).length}
                </p>
                <p className="text-[10px] text-gray-500">Moods</p>
              </div>
              <div className="w-px h-8 bg-orange-200 dark:bg-gray-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {journalEntries.reduce((acc, e) => acc + e.content.split(' ').length, 0)}
                </p>
                <p className="text-[10px] text-gray-500">Words</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-200 to-amber-200" />
                <CardContent className="p-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !journalEntries || journalEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Begin Your Journey
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
              Capture your spiritual thoughts, realizations, and gratitude
            </p>
            <Button 
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
            >
              <Feather className="w-4 h-4 mr-2" />
              Write First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {journalEntries.map((entry, index) => {
                const moodData = getMoodData(entry.mood || "");
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`overflow-hidden border-2 ${moodData.border} hover:shadow-lg transition-all duration-300`}>
                      {/* Mood Color Strip */}
                      <div className={`h-1.5 bg-gradient-to-r ${moodData.color}`} />
                      
                      <CardContent className="p-4">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${moodData.bg} flex items-center justify-center text-xl`}>
                              {moodData.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                                {entry.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-400">
                                  {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                                </span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-[11px] text-gray-400">
                                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-orange-500"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-500"
                              onClick={() => deleteEntryMutation.mutate(entry.id)}
                              disabled={deleteEntryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">
                          {entry.content}
                        </p>

                        {/* Mood Tag */}
                        {entry.mood && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${moodData.bg}`}>
                              <span>{moodData.icon}</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {moods.find(m => m.value === entry.mood)?.label}
                              </span>
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Write/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              {editingEntry ? "Edit Entry" : "New Entry"}
            </SheetTitle>
            <SheetDescription>
              Pour out your heart and spiritual reflections
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Title
              </label>
              <Input
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Mood Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                How are you feeling?
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(mood === m.value ? "" : m.value)}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all
                      ${mood === m.value 
                        ? `bg-gradient-to-r ${m.color} text-white shadow-md scale-105` 
                        : `${m.bg} ${m.border} border hover:scale-105`
                      }
                    `}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Your Thoughts
              </label>
              <Textarea
                placeholder="Write about your realizations, gratitude, prayers, or reflections on your spiritual journey..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] text-base leading-relaxed resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {createEntryMutation.isPending || updateEntryMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Feather className="w-4 h-4 mr-2" />
                    {editingEntry ? "Update" : "Save Entry"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
