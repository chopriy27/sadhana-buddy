import { useQuery } from "@tanstack/react-query";
import { Quote } from "lucide-react";
import type { DailyVerse } from "@shared/schema";

export default function DailyVerse() {
  const { data: verse } = useQuery<DailyVerse | null>({
    queryKey: ["/api/verse/today"],
  });

  if (!verse) {
    return (
      <div className="max-w-md mx-auto px-4 mt-6">
        <div className="bg-gradient-to-br from-peaceful-blue to-deep-blue rounded-2xl p-6 text-white">
          <div className="flex items-center mb-3">
            <Quote className="w-5 h-5 text-white/70 mr-3" />
            <h3 className="font-semibold">Daily Verse</h3>
          </div>
          <p className="text-white/80 text-sm">No verse available for today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 mt-6">
      <div className="bg-gradient-to-br from-peaceful-blue to-deep-blue rounded-2xl p-6 text-white">
        <div className="flex items-center mb-3">
          <Quote className="w-5 h-5 text-white/70 mr-3" />
          <h3 className="font-semibold">Daily Verse</h3>
        </div>
        <blockquote className="font-spiritual text-sm leading-relaxed mb-3">
          "{verse.translation}"
        </blockquote>
        <p className="text-white/80 text-xs">— {verse.source}</p>
      </div>
    </div>
  );
}
