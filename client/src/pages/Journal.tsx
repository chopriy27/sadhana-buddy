import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { JournalEntry } from "@shared/schema";

const DEFAULT_USER_ID = 1; // For demo purposes

const moods = [
  { value: "grateful", label: "Grateful", icon: "🙏" },
  { value: "reflective", label: "Reflective", icon: "🤔" },
  { value: "inspired", label: "Inspired", icon: "✨" },
  { value: "peaceful", label: "Peaceful", icon: "🕉️" },
  { value: "devotional", label: "Devotional", icon: "💝" },
];

export default function Journal() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: journalEntries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: [`/api/journal/${DEFAULT_USER_ID}`],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; mood?: string }) => {
      return apiRequest('POST', '/api/journal', {
        userId: DEFAULT_USER_ID,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/journal/${DEFAULT_USER_ID}`] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Journal entry created successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to create journal entry", 
        variant: "destructive" 
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<JournalEntry> }) => {
      return apiRequest('PUT', `/api/journal/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/journal/${DEFAULT_USER_ID}`] });
      setIsDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({ title: "Journal entry updated successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to update journal entry", 
        variant: "destructive" 
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/journal/${DEFAULT_USER_ID}`] });
      toast({ title: "Journal entry deleted successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Failed to delete journal entry", 
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
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || "");
    setEditingEntry(entry);
    setIsDialogOpen(true);
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

  const getMoodEmoji = (moodValue: string) => {
    const moodObj = moods.find(m => m.value === moodValue);
    return moodObj?.icon || "📝";
  };

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-soft-gray dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Spiritual Journal</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Entry title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.icon} {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Write your thoughts, reflections, or gratitude..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                    className="flex-1"
                  >
                    {editingEntry ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !journalEntries || journalEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No journal entries yet</p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Write your first entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {journalEntries.map(entry => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <span>{getMoodEmoji(entry.mood || "")}</span>
                        <span>{entry.title}</span>
                      </CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteEntryMutation.mutate(entry.id)}
                        disabled={deleteEntryMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {entry.mood && (
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {moods.find(m => m.value === entry.mood)?.label || entry.mood}
                    </Badge>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-spiritual">
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
