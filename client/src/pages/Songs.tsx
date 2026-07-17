import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Heart, User, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { DevotionalSong, FavoriteSong } from "@shared/schema";

export default function Songs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedSong, setSelectedSong] = useState<DevotionalSong | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access songs.</div>;
  }

  const userId = user.id;

  const { data: songs, isLoading } = useQuery<DevotionalSong[]>({
    queryKey: ["/api/songs", { category, mood, search }],
  });

  const { data: favorites } = useQuery<(FavoriteSong & { song: DevotionalSong })[]>({
    queryKey: ["/api/favorites", userId],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (songId: number) =>
      apiRequest("POST", "/api/favorites", { userId, songId }),
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
      apiRequest("DELETE", `/api/favorites/${userId}/${songId}`),
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

  const isSongFavorited = (songId: number) =>
    favorites?.some(fav => fav.songId === songId) || false;

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Devotional Songs</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search songs, authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
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

        {/* Favorites toggle */}
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="flex items-center space-x-2"
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          <span>Favorites Only</span>
        </Button>

        {/* Song list */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Music className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No songs found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map((song) => (
              <Card
                key={song.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedSong(song)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">{song.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">by {song.author}</p>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="text-xs">{song.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{song.mood}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                      className="ml-2"
                    >
                      <Heart className={`w-4 h-4 ${isSongFavorited(song.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Song detail dialog */}
      <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedSong?.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedSong && toggleFavorite(selectedSong.id)}
              >
                <Heart className={`w-4 h-4 ${selectedSong && isSongFavorited(selectedSong.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedSong && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm"><strong>Author:</strong> {selectedSong.author}</span>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline">{selectedSong.category}</Badge>
                  <Badge variant="secondary">{selectedSong.mood}</Badge>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">About This Song</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  This devotional song is part of the authentic ISKCON Vaiṣṇava Songbook,
                  compiled by the devotees at ISKCON Chowpatty. These songs have been sung
                  by generations of devotees in their sādhana.
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  For complete lyrics and musical notations, please refer to kksongs.org
                  or the official ISKCON Vaishnava Songbook.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Spiritual significance:</strong> Songs by great Vaiṣṇava ācāryas like
                  Bhaktivinoda Ṭhākura and Narottama Dāsa Ṭhākura carry transcendental potency
                  and are considered non-different from prayer and meditation.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
