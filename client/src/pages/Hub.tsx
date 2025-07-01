import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FestivalBanner from "@/components/FestivalBanner";
import SadhanaProgress from "@/components/SadhanaProgress";
import DailyVerse from "@/components/DailyVerse";
import QuickActions from "@/components/QuickActions";
import RecentActivity from "@/components/RecentActivity";

export default function Hub() {
  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-soft-gray dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-sacred-orange to-saffron rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🪷</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sadhana Buddy</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-lotus-pink rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <FestivalBanner />
        <SadhanaProgress />
        <DailyVerse />
        <QuickActions />
        <RecentActivity />
      </main>

      {/* Floating Action Button */}
      <Button className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-sacred-orange to-saffron rounded-full shadow-lg z-40">
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
