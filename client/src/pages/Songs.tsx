import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DevotionalSong } from "@shared/schema";

export default function Songs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [mood, setMood] = useState<string>("");

  const { data: songs, isLoading } = useQuery<DevotionalSong[]>({
    queryKey: ["/api/songs", { category, mood, search }],
  });

  const categories = ["bhajan", "kirtan", "prayer"];
  const moods = ["devotional", "meditative", "joyful"];

  const filteredSongs = songs?.filter(song => {
    const matchesSearch = search === "" || 
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.author.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === "" || category === "all" || song.category === category;
    const matchesMood = mood === "" || mood === "all" || song.mood === mood;
    
    return matchesSearch && matchesCategory && matchesMood;
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
              <Card key={song.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{song.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">by {song.author}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Play className="w-4 h-4" />
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
