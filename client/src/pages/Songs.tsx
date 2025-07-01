import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, Play, Heart, X, Book, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DevotionalSong, FavoriteSong } from "@shared/schema";

export default function Songs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedSong, setSelectedSong] = useState<DevotionalSong | null>(null);
  const { toast } = useToast();
  
  const userId = 1; // For now, using a fixed user ID

  const { data: songs, isLoading } = useQuery<DevotionalSong[]>({
    queryKey: ["/api/songs", { category, mood, search }],
  });

  const { data: favorites } = useQuery<(FavoriteSong & { song: DevotionalSong })[]>({
    queryKey: ["/api/favorites", userId],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (songId: number) => 
      apiRequest("/api/favorites", "POST", { userId, songId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userId] });
      toast({ description: "Added to favorites" });
    },
    onError: () => {
      toast({ description: "Failed to add to favorites", variant: "destructive" });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (songId: number) => 
      apiRequest(`/api/favorites/${userId}/${songId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userId] });
      toast({ description: "Removed from favorites" });
    },
    onError: () => {
      toast({ description: "Failed to remove from favorites", variant: "destructive" });
    },
  });

  const categories = ["bhajan", "kirtan", "prayer"];
  const moods = ["devotional", "meditative", "joyful"];

  // Helper function to check if song is favorited
  const isSongFavorited = (songId: number) => {
    return favorites?.some(fav => fav.songId === songId) || false;
  };

  // Helper function to toggle favorite status
  const toggleFavorite = (songId: number) => {
    if (isSongFavorited(songId)) {
      removeFavoriteMutation.mutate(songId);
    } else {
      addFavoriteMutation.mutate(songId);
    }
  };

  const filteredSongs = songs?.filter(song => {
    const matchesSearch = search === "" || 
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.author.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === "" || category === "all" || song.category === category;
    const matchesMood = mood === "" || mood === "all" || song.mood === mood;
    const matchesFavorites = !showFavoritesOnly || isSongFavorited(song.id);
    
    return matchesSearch && matchesCategory && matchesMood && matchesFavorites;
  }) || [];

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-soft-gray dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Devotional Songs</h1>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search songs, authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2 mb-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {moods.map(m => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Favorites Filter */}
          <div className="flex space-x-2">
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex items-center space-x-2"
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
              <span>Favorites Only</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No songs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map(song => (
              <Card 
                key={song.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedSong(song)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{song.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {song.author}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song.id);
                        }}
                        disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            isSongFavorited(song.id) 
                              ? "fill-red-500 text-red-500" 
                              : "text-gray-400 hover:text-red-500"
                          }`} 
                        />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSong(song);
                        }}
                      >
                        <Book className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {song.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {song.mood}
                    </Badge>
                  </div>

                  {song.lyrics && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-spiritual leading-relaxed">
                      {song.lyrics.split('\n')[0]}...
                    </p>
                  )}
                  
                  <p className="text-xs text-saffron-600 dark:text-saffron-400 mt-2">
                    Click to view lyrics
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lyrics Modal */}
      <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {selectedSong?.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSong?.author}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedSong?.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedSong?.mood}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedSong?.lyrics ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    Lyrics
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-spiritual leading-relaxed whitespace-pre-line">
                    {selectedSong.lyrics}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Book className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Lyrics not available for this song
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
