import { useQuery } from "@tanstack/react-query";
import { Music, Play } from "lucide-react";
import { Link } from "wouter";
import type { DevotionalSong, Lecture } from "@shared/schema";

export default function QuickActions() {
  const { data: songs } = useQuery<DevotionalSong[]>({
    queryKey: ["/api/songs"],
  });

  const { data: lectures } = useQuery<Lecture[]>({
    queryKey: ["/api/lectures"],
  });

  const songCount = songs?.length || 0;
  const lectureCount = lectures?.length || 0;

  return (
    <div className="max-w-md mx-auto px-4 mt-6">
      <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Devotional Songs */}
        <Link href="/songs">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-lotus-pink/10 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-lotus-pink" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {songCount}+ songs
              </span>
            </div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Devotional Songs</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Bhajans & Kirtans</p>
          </div>
        </Link>
        
        {/* Classes & Lectures */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-peaceful-blue/10 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-peaceful-blue" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lectureCount}+ lectures
            </span>
          </div>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Classes & Lectures</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">By Acharyas</p>
        </div>
      </div>
    </div>
  );
}
