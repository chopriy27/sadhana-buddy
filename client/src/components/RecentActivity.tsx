import { useQuery } from "@tanstack/react-query";
import { BookOpen, Trophy, PenTool } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { JournalEntry, SadhanaEntry } from "@shared/schema";

const DEFAULT_USER_ID = 1; // For demo purposes

export default function RecentActivity() {
  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: [`/api/journal/${DEFAULT_USER_ID}`],
  });

  const { data: sadhanaEntries } = useQuery<SadhanaEntry[]>({
    queryKey: [`/api/sadhana/${DEFAULT_USER_ID}`],
  });

  // Create activity items from data
  const activities = [];

  // Add recent journal entries
  if (journalEntries) {
    journalEntries.slice(0, 2).forEach(entry => {
      activities.push({
        id: `journal-${entry.id}`,
        icon: PenTool,
        iconColor: "text-sacred-orange",
        iconBg: "bg-sacred-orange/10",
        title: "Journal Entry Added",
        description: entry.title,
        time: entry.createdAt,
      });
    });
  }

  // Add sadhana achievements
  if (sadhanaEntries) {
    const recentCompleted = sadhanaEntries
      .filter(entry => entry.chantingRounds >= entry.chantingTarget)
      .slice(0, 1);
    
    recentCompleted.forEach(entry => {
      activities.push({
        id: `sadhana-${entry.id}`,
        icon: Trophy,
        iconColor: "text-sacred-gold",
        iconBg: "bg-sacred-gold/10",
        title: "Sadhana Goal Completed",
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
        icon: BookOpen,
        iconColor: "text-lotus-pink",
        iconBg: "bg-lotus-pink/10",
        title: "Welcome to Sadhana Buddy",
        description: "Start your spiritual journey today",
        time: new Date(),
      }
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 mt-6 mb-20">
      <h3 className="text-gray-800 dark:text-gray-200 font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-3">
              <div className={`w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {activity.description} - {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
