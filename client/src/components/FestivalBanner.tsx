import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import type { Festival, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function FestivalBanner() {
  const { user } = useAuth();
  
  const { data: upcomingFestivals } = useQuery<Festival[]>({
    queryKey: ["/api/festivals/upcoming?limit=1"],
  });

  if (!upcomingFestivals || upcomingFestivals.length === 0) {
    return null;
  }

  const nextFestival = upcomingFestivals[0];
  
  // Get current time in user's timezone
  const userTimezone = user?.timezone || 'America/New_York';
  const now = new Date();
  
  // Parse festival date (YYYY-MM-DD format) in user's timezone at midnight
  const festivalDate = new Date(nextFestival.date + 'T00:00:00');
  
  // Format dates in user's timezone for comparison
  const todayInUserTz = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
  const festivalInUserTz = new Date(festivalDate.toLocaleString('en-US', { timeZone: userTimezone }));
  
  // Calculate days remaining based on user's timezone
  const todayStart = new Date(todayInUserTz.getFullYear(), todayInUserTz.getMonth(), todayInUserTz.getDate());
  const festivalStart = new Date(festivalInUserTz.getFullYear(), festivalInUserTz.getMonth(), festivalInUserTz.getDate());
  
  const timeDiff = festivalStart.getTime() - todayStart.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return (
    <div className="max-w-md mx-auto">
      <div className="mx-4 mt-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 festival-glow shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm">{nextFestival.name}</h3>
            <p className="text-gray-800 dark:text-white/90 text-xs mt-1">
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
