import { useQuery } from "@tanstack/react-query";
import { Book, Sun, Headphones } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { SadhanaEntry, UserGoals } from "@shared/schema";

export default function SadhanaProgress() {
  const { user } = useAuth();
  
  const { data: todaysSadhana } = useQuery<SadhanaEntry | null>({
    queryKey: [`/api/sadhana/${user?.id}/today`],
    enabled: !!user?.id,
  });

  const { data: userGoals } = useQuery<UserGoals>({
    queryKey: [`/api/goals/${user?.id}`],
    enabled: !!user?.id,
  });

  // Get actual progress values
  const chantingRounds = todaysSadhana?.chantingRounds || 0;
  const pagesRead = todaysSadhana?.pagesRead || 0;
  const hearingMinutes = todaysSadhana?.hearingMinutes || 0;
  const readingPrabhupada = todaysSadhana?.readingPrabhupada || false;

  // Get personalized goals from onboarding
  const chantingTarget = userGoals?.dailyChantingRounds || 16;
  const readingTarget = userGoals?.dailyReadingPages || 5;
  const hearingTarget = userGoals?.dailyHearingMinutes || 30;

  // Calculate progress percentages
  const chantingProgress = Math.min((chantingRounds / chantingTarget) * 100, 100);
  const readingProgress = Math.min((pagesRead / readingTarget) * 100, 100);
  const hearingProgress = Math.min((hearingMinutes / hearingTarget) * 100, 100);

  const totalTasks = 3; // chanting, reading, hearing
  const completedTasks = (chantingRounds >= chantingTarget ? 1 : 0) + 
                        (pagesRead >= readingTarget ? 1 : 0) + 
                        (hearingMinutes >= hearingTarget ? 1 : 0);
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="max-w-md mx-auto px-4 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Today's Sadhana</h2>
          <span className="text-sm text-peaceful-blue font-medium">{completionPercentage}%</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Chanting Progress */}
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(from 0deg, var(--sacred-orange) 0deg ${chantingProgress * 3.6}deg, #e5e7eb ${chantingProgress * 3.6}deg 360deg)`
              }}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {chantingRounds}/{chantingTarget}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Chanting</p>
          </div>
          
          {/* Reading Progress */}
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(from 0deg, var(--peaceful-blue) 0deg ${readingProgress * 3.6}deg, #e5e7eb ${readingProgress * 3.6}deg 360deg)`
              }}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {pagesRead}/{readingTarget}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pages Read</p>
          </div>
          
          {/* Hearing Progress */}
          <div className="text-center">
            <div 
              className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(from 0deg, var(--sacred-gold) 0deg ${hearingProgress * 3.6}deg, #e5e7eb ${hearingProgress * 3.6}deg 360deg)`
              }}
            >
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {hearingMinutes}/{hearingTarget}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
