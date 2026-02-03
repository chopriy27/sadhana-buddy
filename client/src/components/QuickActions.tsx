import { useQuery } from "@tanstack/react-query";
import { Target, Headphones, Calendar, PenLine } from "lucide-react";
import { Link } from "wouter";
import type { DevotionalSong, Lecture } from "@shared/schema";

export default function QuickActions() {
  const { data: songs } = useQuery<DevotionalSong[]>({
    queryKey: ["/api/songs"],
  });

  const { data: lectures } = useQuery<Lecture[]>({
    queryKey: ["/api/lectures"],
  });

  const songCount = songs?.length || 0;
  const lectureCount = lectures?.length || 0;

  const actions = [
    {
      href: "/calendar",
      icon: Calendar,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-500",
      title: "Calendar",
      subtitle: "Festivals & Ekadasis",
    },
    {
      href: "/lectures",
      icon: Headphones,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600",
      title: "Lectures",
      subtitle: `${lectureCount}+ by Prabhupada`,
    },
    {
      href: "/journal",
      icon: PenLine,
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600",
      title: "Journal",
      subtitle: "Spiritual reflections",
    },
    {
      href: "/goals",
      icon: Target,
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      iconColor: "text-rose-500",
      title: "Goals",
      subtitle: "Set your targets",
    },
  ];

  return (
    <div className="px-4 mt-6">
      <h3 className="text-gray-800 dark:text-gray-200 font-bold text-base mb-3">Quick Access</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-orange-100 dark:border-gray-700 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer">
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 ${action.iconBg} rounded-xl flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{action.title}</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{action.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
