import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import type { Festival } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function FestivalBanner() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch more festivals to find today's events
  const { data: upcomingFestivals } = useQuery<Festival[]>({
    queryKey: ["/api/festivals/upcoming?limit=10"],
  });

  if (!upcomingFestivals || upcomingFestivals.length === 0) {
    return null;
  }

  // Get today's date string
  const userTimezone = user?.timezone || 'America/New_York';
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: userTimezone }); // YYYY-MM-DD format

  // Find today's festivals
  const todaysFestivals = upcomingFestivals.filter(f => f.date === todayStr);
  
  // Determine what to show: today's events or nearest upcoming
  const festivalsToShow = todaysFestivals.length > 0 ? todaysFestivals : [upcomingFestivals[0]];
  const isShowingToday = todaysFestivals.length > 0;
  const hasMultiple = festivalsToShow.length > 1;
  
  // Current festival to display
  const currentFestival = festivalsToShow[currentIndex % festivalsToShow.length];

  // Calculate days remaining for non-today events
  const festivalDate = new Date(currentFestival.date + 'T00:00:00');
  const todayInUserTz = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
  const festivalInUserTz = new Date(festivalDate.toLocaleString('en-US', { timeZone: userTimezone }));
  const todayStart = new Date(todayInUserTz.getFullYear(), todayInUserTz.getMonth(), todayInUserTz.getDate());
  const festivalStart = new Date(festivalInUserTz.getFullYear(), festivalInUserTz.getMonth(), festivalInUserTz.getDate());
  const timeDiff = festivalStart.getTime() - todayStart.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const nextEvent = () => setCurrentIndex((i) => (i + 1) % festivalsToShow.length);
  const prevEvent = () => setCurrentIndex((i) => (i - 1 + festivalsToShow.length) % festivalsToShow.length);

  return (
    <div className="px-4 mt-4">
      <div
        className={`relative overflow-hidden rounded-2xl p-4 shadow-lg transition-all ${
          isShowingToday 
            ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500' 
            : 'bg-gradient-to-r from-orange-400 to-amber-500'
        }`}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        {/* Animated sparkles for today */}
        {isShowingToday && (
          <>
            <Sparkles className="absolute top-3 right-14 w-4 h-4 text-white/40 animate-pulse" />
            <Sparkles className="absolute bottom-4 right-6 w-3 h-3 text-white/30 animate-pulse delay-150" />
          </>
        )}
        
        <div className="relative flex items-center justify-between">
          {/* Navigation for multiple events */}
          {hasMultiple && (
            <button 
              onClick={(e) => { e.stopPropagation(); prevEvent(); }}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          )}
          
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => setLocation(`/event/${currentFestival.id}`)}
          >
            <div className="flex items-center gap-2 mb-1">
              {isShowingToday && (
                <span className="text-white/80 text-[10px] font-medium">
                  Today's Festival
                </span>
              )}
              {hasMultiple && (
                <span className="text-white/70 text-[10px]">
                  {currentIndex + 1} of {festivalsToShow.length}
                </span>
              )}
              {!isShowingToday && (
                <span className="text-white/80 text-[10px] font-medium">
                  Upcoming Festival
                </span>
              )}
            </div>
            
            <h3 className="text-white font-bold text-base leading-tight mb-1">
              {currentFestival.name}
            </h3>
            
            <p className="text-white/80 text-xs">
              {isShowingToday ? "" :
                daysRemaining === 1 ? "Tomorrow" :
                  `${daysRemaining} days remaining`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
              onClick={() => setLocation(`/event/${currentFestival.id}`)}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            
            {/* Navigation for multiple events */}
            {hasMultiple ? (
              <button 
                onClick={(e) => { e.stopPropagation(); nextEvent(); }}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <ChevronRight 
                className="w-5 h-5 text-white/60 cursor-pointer" 
                onClick={() => setLocation(`/event/${currentFestival.id}`)}
              />
            )}
          </div>
        </div>
        
        {/* Dots indicator for multiple events */}
        {hasMultiple && (
          <div className="flex justify-center gap-1.5 mt-3">
            {festivalsToShow.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
