import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import FestivalBanner from "@/components/FestivalBanner";
import SadhanaProgress from "@/components/SadhanaProgress";
import DailyVerse from "@/components/DailyVerse";
import QuickActions from "@/components/QuickActions";
import RecentActivity from "@/components/RecentActivity";
import { useAuth } from "@/hooks/useAuth";

export default function Hub() {
  const { user } = useAuth();
  const firstName = user?.firstName || user?.displayName?.split(' ')[0] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size={36} />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {firstName ? `Hare Kṛṣṇa, ${firstName}!` : 'Hare Kṛṣṇa! 🙏'}
              </h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Your Sādhana Companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        <FestivalBanner />
        <SadhanaProgress />
        <DailyVerse />
        <QuickActions />
        <RecentActivity />
      </main>

    </div>
  );
}
