import { useQuery } from "@tanstack/react-query";
import { BookOpen, Sparkles } from "lucide-react";
import type { DailyVerse } from "@shared/schema";

export default function DailyVerse() {
  const { data: verse } = useQuery<DailyVerse | null>({
    queryKey: ["/api/verse/today"],
  });

  if (!verse) {
    return (
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Daily Verse</h3>
            </div>
            <p className="text-white/80 text-sm">No verse available for today</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-6">
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <Sparkles className="absolute top-4 right-4 w-5 h-5 text-white/30" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">Daily Verse</h3>
          </div>
          
          <blockquote className="text-sm leading-relaxed mb-3 font-medium">
            "{verse.translation}"
          </blockquote>
          
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-xs font-medium">— {verse.source}</p>
            <BookOpen className="w-5 h-5 text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
