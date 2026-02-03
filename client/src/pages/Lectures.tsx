import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Clock, ExternalLink, Search, Filter, X, Maximize2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Lecture } from "@shared/schema";
import Logo from "@/components/Logo";

// Types for YouTube content
type YouTubeContent = 
  | { type: 'video'; id: string }
  | { type: 'playlist'; id: string }
  | null;

// Helper to extract YouTube video/playlist ID from various URL formats
function getYouTubeContent(url: string): YouTubeContent {
  if (!url) return null;
  
  // Check for playlist first
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (playlistMatch) {
    return { type: 'playlist', id: playlistMatch[1] };
  }
  
  // Handle different YouTube video URL formats
  const videoPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?\s]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];
  
  for (const pattern of videoPatterns) {
    const match = url.match(pattern);
    if (match) return { type: 'video', id: match[1] };
  }
  
  return null;
}

// YouTube Embed Component
function YouTubePlayer({ 
  content, 
  title,
  onClose 
}: { 
  content: YouTubeContent; 
  title: string;
  onClose: () => void;
}) {
  if (!content) return null;
  
  // Generate embed URL based on content type
  const embedUrl = content.type === 'playlist'
    ? `https://www.youtube.com/embed/videoseries?list=${content.id}&autoplay=1&rel=0`
    : `https://www.youtube.com/embed/${content.id}?autoplay=1&rel=0&modestbranding=1`;
  
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default function Lectures() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { data: lectures, isLoading } = useQuery<Lecture[]>({
    queryKey: ["/api/lectures"],
  });

  const filteredLectures = lectures?.filter(lecture => {
    const matchesSearch = !searchQuery || 
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTopic = selectedTopic === "all" || 
      lecture.topic.toLowerCase() === selectedTopic.toLowerCase();
    
    return matchesSearch && matchesTopic;
  }) || [];

  const topics = Array.from(new Set(lectures?.map(lecture => lecture.topic) || []));

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const handlePlayLecture = (lecture: Lecture) => {
    const content = getYouTubeContent(lecture.videoUrl || "");
    if (content) {
      setSelectedLecture(lecture);
      setIsPlayerOpen(true);
    } else {
      // Fallback to opening in browser if we can't extract video ID
      window.open(lecture.videoUrl || "https://www.youtube.com/@TheAcharya1", '_blank', 'noopener,noreferrer');
    }
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedLecture(null);
  };

  const openInBrowser = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-sacred-orange border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading lectures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Prabhupada's Lectures
            </h1>
            <p className="text-[10px] text-gray-500 -mt-0.5">
              Authentic teachings
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search lectures, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map(topic => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lectures List */}
      <div className="max-w-md mx-auto px-4 space-y-4">
        {filteredLectures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No lectures found</p>
          </div>
        ) : (
          filteredLectures.map((lecture) => {
            const youtubeContent = getYouTubeContent(lecture.videoUrl || "");
            const hasPlayableVideo = youtubeContent !== null;
            
            return (
              <div
                key={lecture.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail / Play Button */}
                  <button
                    onClick={() => handlePlayLecture(lecture)}
                    className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 hover:from-orange-500 hover:to-amber-600 transition-all group shadow-md"
                  >
                    <Play className="w-7 h-7 text-white group-hover:scale-110 transition-transform" fill="white" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight mb-1">
                      {lecture.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {lecture.topic}
                      </Badge>
                      {lecture.duration && lecture.duration > 0 && formatDuration(lecture.duration) && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDuration(lecture.duration)}
                          </span>
                        </div>
                      )}
                      {hasPlayableVideo && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                          <Volume2 className="w-3 h-3 mr-1" />
                          {youtubeContent?.type === 'playlist' ? 'Playlist' : 'In-App'}
                        </Badge>
                      )}
                    </div>
                    
                    {lecture.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {lecture.description}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePlayLecture(lecture)}
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                      <Button
                        onClick={() => openInBrowser(lecture.videoUrl || "https://www.youtube.com/@TheAcharya1")}
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Browser
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Video Player Sheet (Mobile Optimized) */}
      <Sheet open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-4 py-3 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-base truncate pr-4">
                  {selectedLecture?.title || "Now Playing"}
                </SheetTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openInBrowser(selectedLecture?.videoUrl || "")}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleClosePlayer}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>
            
            {/* Video Player */}
            <div className="flex-1 bg-black flex items-center justify-center">
              {selectedLecture && getYouTubeContent(selectedLecture.videoUrl || "") && (
                <YouTubePlayer
                  content={getYouTubeContent(selectedLecture.videoUrl || "")}
                  title={selectedLecture.title}
                  onClose={handleClosePlayer}
                />
              )}
            </div>
            
            {/* Lecture Details */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{selectedLecture?.topic}</Badge>
                {selectedLecture?.duration && selectedLecture.duration > 0 && (
                  <span className="text-xs text-gray-500">
                    {formatDuration(selectedLecture.duration)}
                  </span>
                )}
              </div>
              {selectedLecture?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {selectedLecture.description}
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
