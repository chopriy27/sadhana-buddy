import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import type { Festival } from "@shared/schema";

export default function FestivalBanner() {
  const { data: upcomingFestivals } = useQuery<Festival[]>({
    queryKey: ["/api/festivals/upcoming?limit=1"],
  });

  if (!upcomingFestivals || upcomingFestivals.length === 0) {
    return null;
  }

  const nextFestival = upcomingFestivals[0];
  const festivalDate = new Date(nextFestival.date);
  const today = new Date();
  const timeDiff = festivalDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return (
    <div className="max-w-md mx-auto">
      <div className="mx-4 mt-4 bg-gradient-to-r from-sacred-gold to-saffron rounded-2xl p-4 festival-glow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">{nextFestival.name}</h3>
            <p className="text-white/90 text-xs mt-1">
              {daysRemaining === 0 ? "Today!" : 
               daysRemaining === 1 ? "Tomorrow" : 
               `${daysRemaining} days remaining`}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center spiritual-pulse">
            <Star className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
