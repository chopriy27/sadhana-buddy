import { useQuery } from "@tanstack/react-query";
import { BookOpen, Trophy, PenTool, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import type { JournalEntry, SadhanaEntry } from "@shared/schema";

export default function RecentActivity() {
  const { user } = useAuth();
  
  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: [`/api/journal/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: sadhanaEntries } = useQuery<SadhanaEntry[]>({
    queryKey: [`/api/sadhana/${user?.id}`],
    enabled: !!user?.id,
  });

  // Create activity items from data
  const activities: {
    id: string;
    icon: typeof PenTool;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    time: Date | string;
  }[] = [];

  // Add recent journal entries
  if (journalEntries) {
    journalEntries.slice(0, 2).forEach(entry => {
      activities.push({
        id: `journal-${entry.id}`,
        icon: PenTool,
        iconColor: "text-orange-500",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        title: "Journal Entry",
        description: entry.title,
        time: entry.createdAt,
      });
    });
  }

  // Add sadhana achievements
  if (sadhanaEntries) {
    const recentCompleted = sadhanaEntries
      .filter(entry => (entry.chantingRounds || 0) >= 16)
      .slice(0, 1);
    
    recentCompleted.forEach(entry => {
      activities.push({
        id: `sadhana-${entry.id}`,
        icon: Trophy,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        title: "Sadhana Complete",
        description: `${entry.chantingRounds} rounds completed`,
        time: entry.createdAt,
      });
    });
  }

  // Sort by time and take most recent 3
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recentActivities = activities.slice(0, 3);

  // Add fallback activities if none exist
  if (recentActivities.length === 0) {
    recentActivities.push(
      {
        id: "welcome",
        icon: Sparkles,
        iconColor: "text-orange-500",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        title: "Welcome to Sadhana Buddy",
        description: "Start your spiritual journey today",
        time: new Date(),
      }
    );
  }

  return (
    <div className="px-4 mt-6 mb-6">
      <h3 className="text-gray-800 dark:text-gray-200 font-bold text-base mb-3">Recent Activity</h3>
      <div className="space-y-2">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div 
              key={activity.id} 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-orange-100 dark:border-gray-700 flex items-center gap-3"
            >
              <div className={`w-10 h-10 ${activity.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{activity.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                {formatDistanceToNow(new Date(activity.time), { addSuffix: true }).replace('about ', '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
