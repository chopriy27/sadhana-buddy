import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { SadhanaEntry, UserGoals } from "@shared/schema";

export default function SadhanaProgress() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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

  // Get personalized goals from onboarding
  const chantingTarget = userGoals?.dailyChantingRounds || 16;
  const readingTarget = userGoals?.dailyReadingPages || 5;
  const hearingTarget = userGoals?.dailyHearingLectures || 30;

  // Calculate progress percentages
  const chantingProgress = Math.min((chantingRounds / chantingTarget) * 100, 100);
  const readingProgress = Math.min((pagesRead / readingTarget) * 100, 100);
  const hearingProgress = Math.min((hearingMinutes / hearingTarget) * 100, 100);

  const totalTasks = 3;
  const completedTasks = (chantingRounds >= chantingTarget ? 1 : 0) +
    (pagesRead >= readingTarget ? 1 : 0) +
    (hearingMinutes >= hearingTarget ? 1 : 0);
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  // Progress ring component
  const ProgressRing = ({
    progress,
    color,
    bgColor,
    value,
    target,
    label
  }: {
    progress: number;
    color: string;
    bgColor: string;
    value: number;
    target: number;
    label: string;
  }) => (
    <div className="text-center">
      <div
        className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center relative"
        style={{
          background: `conic-gradient(from 0deg, ${color} 0deg ${progress * 3.6}deg, ${bgColor} ${progress * 3.6}deg 360deg)`
        }}
      >
        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {value}/{target}
          </span>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );

  return (
    <div className="px-4 mt-6">
      <div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-orange-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setLocation('/tracker')}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">Today's Sadhana</h2>
            <p className="text-xs text-gray-500">Tap to log your progress</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${completionPercentage === 100 ? 'text-green-500' : 'text-orange-500'}`}>
              {completionPercentage}%
            </span>
            {completionPercentage === 100 && <span className="text-green-500 font-bold">✓</span>}
          </div>
        </div>

        {/* Progress Rings */}
        <div className="grid grid-cols-3 gap-3">
          <ProgressRing
            progress={chantingProgress}
            color="#f97316"
            bgColor="#fed7aa"
            value={chantingRounds}
            target={chantingTarget}
            label="Rounds"
          />
          <ProgressRing
            progress={readingProgress}
            color="#3b82f6"
            bgColor="#bfdbfe"
            value={pagesRead}
            target={readingTarget}
            label="Pages"
          />
          <ProgressRing
            progress={hearingProgress}
            color="#8b5cf6"
            bgColor="#ddd6fe"
            value={hearingMinutes}
            target={hearingTarget}
            label="Minutes"
          />
        </div>
      </div>
    </div>
  );
}
