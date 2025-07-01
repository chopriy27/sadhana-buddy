import { useQuery } from "@tanstack/react-query";
import { Book, Sun } from "lucide-react";
import type { SadhanaEntry } from "@shared/schema";

const DEFAULT_USER_ID = 1; // For demo purposes

export default function SadhanaProgress() {
  const { data: todaysSadhana } = useQuery<SadhanaEntry | null>({
    queryKey: [`/api/sadhana/${DEFAULT_USER_ID}/today`],
  });

  const chantingRounds = todaysSadhana?.chantingRounds || 0;
  const chantingTarget = todaysSadhana?.chantingTarget || 16;
  const reading = todaysSadhana?.reading || false;
  const mangalaArati = todaysSadhana?.mangalaArati || false;

  const chantingProgress = Math.min((chantingRounds / chantingTarget) * 100, 100);
  const totalTasks = 3; // chanting, reading, mangala arati
  const completedTasks = (chantingRounds >= chantingTarget ? 1 : 0) + 
                        (reading ? 1 : 0) + 
                        (mangalaArati ? 1 : 0);
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
            <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
              reading ? "bg-peaceful-blue" : "bg-gray-200 dark:bg-gray-700"
            }`}>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Book className={`w-4 h-4 ${reading ? "text-peaceful-blue" : "text-gray-400"}`} />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Reading</p>
          </div>
          
          {/* Mangala Arati */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
              mangalaArati ? "bg-sacred-gold" : "bg-gray-200 dark:bg-gray-700"
            }`}>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Sun className={`w-4 h-4 ${mangalaArati ? "text-sacred-gold" : "text-gray-400"}`} />
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Mangala Arati</p>
          </div>
        </div>
      </div>
    </div>
  );
}
