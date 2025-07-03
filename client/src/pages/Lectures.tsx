import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Clock, ExternalLink, Search, Filter } from "lucide-react";
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
import type { Lecture } from "@shared/schema";

export default function Lectures() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

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
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const openLecture = (videoUrl: string) => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-soft-gray dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Prabhupada's Lectures
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Authentic teachings by A.C. Bhaktivedanta Swami Prabhupada
          </p>
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
          filteredLectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-peaceful-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-peaceful-blue" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight mb-1">
                    {lecture.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {lecture.topic}
                    </Badge>
                    {lecture.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDuration(lecture.duration)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {lecture.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {lecture.description}
                    </p>
                  )}
                  
                  <Button
                    onClick={() => openLecture(lecture.videoUrl || "https://www.youtube.com/@TheAcharya1")}
                    size="sm"
                    className="bg-peaceful-blue hover:bg-peaceful-blue/90 text-white"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Watch Lecture
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}