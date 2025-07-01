import { Link, useLocation } from "wouter";
import { Home, Music, TrendingUp, BookOpen, User } from "lucide-react";
import { useMobileFeatures } from "@/hooks/use-mobile-features";
import { ImpactStyle } from "@capacitor/haptics";

const navigationItems = [
  { path: "/", label: "Hub", icon: Home },
  { path: "/songs", label: "Songs", icon: Music },
  { path: "/tracker", label: "Tracker", icon: TrendingUp },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/profile", label: "Profile", icon: User },
];

export default function BottomNavigation() {
  const [location] = useLocation();
  const { triggerHaptic } = useMobileFeatures();

  const handleNavigation = () => {
    triggerHaptic(ImpactStyle.Light);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  className="flex flex-col items-center py-2 px-3 transition-colors mobile-touch-target no-select"
                  onClick={handleNavigation}
                >
                  {isActive ? (
                    <div className="w-6 h-6 bg-sacred-orange rounded-full flex items-center justify-center mb-1">
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-1" />
                  )}
                  <span className={`text-xs font-medium ${
                    isActive 
                      ? "text-sacred-orange" 
                      : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
