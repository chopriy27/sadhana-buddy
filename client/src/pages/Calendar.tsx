import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar as CalendarIcon,
    Sparkles,
    Info,
    List,
    Grid3X3,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import LocationSelector from "@/components/LocationSelector";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    type Location as UserLocation,
    LOCATIONS,
    detectUserLocation,
    getEkadasisForLocation,
    type EkadasiDate
} from "@/lib/locationCalendar";
import Logo from "@/components/Logo";

interface Festival {
    id: number;
    name: string;
    date: string;
    description: string | null;
    significance: string | null;
    observances: string[] | null;
}

// Festival category detection
function getFestivalCategory(name: string): 'appearance' | 'disappearance' | 'ekadasi' | 'festival' | 'other' {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('appearance')) return 'appearance';
    if (lowerName.includes('disappearance')) return 'disappearance';
    if (lowerName.includes('ekadasi') || lowerName.includes('ekādaśī')) return 'ekadasi';
    if (lowerName.includes('janmashtami') || lowerName.includes('diwali') || lowerName.includes('holi') ||
        lowerName.includes('ratha') || lowerName.includes('gaura purnima') || lowerName.includes('rama navami')) return 'festival';
    return 'other';
}

// Get category colors
function getCategoryColor(category: string): string {
    switch (category) {
        case 'appearance': return 'bg-emerald-500';
        case 'disappearance': return 'bg-violet-500';
        case 'ekadasi': return 'bg-amber-500';
        case 'festival': return 'bg-rose-500';
        default: return 'bg-blue-500';
    }
}

function getCategoryBgColor(category: string): string {
    switch (category) {
        case 'appearance': return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
        case 'disappearance': return 'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800';
        case 'ekadasi': return 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
        case 'festival': return 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800';
        default: return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    }
}

function getCategoryTextColor(category: string): string {
    switch (category) {
        case 'appearance': return 'text-emerald-700 dark:text-emerald-300';
        case 'disappearance': return 'text-violet-700 dark:text-violet-300';
        case 'ekadasi': return 'text-amber-700 dark:text-amber-300';
        case 'festival': return 'text-rose-700 dark:text-rose-300';
        default: return 'text-blue-700 dark:text-blue-300';
    }
}

function getCategoryEmoji(category: string): string {
    switch (category) {
        case 'appearance': return '🌅';
        case 'disappearance': return '🙏';
        case 'ekadasi': return '🌙';
        case 'festival': return '🎉';
        default: return '📿';
    }
}

export default function Calendar() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Fetch all festivals
    const { data: festivals = [] } = useQuery<Festival[]>({
        queryKey: ["/api/festivals"],
    });

    // Detect user's location on mount
    useEffect(() => {
        const loadLocation = async () => {
            setIsLoadingLocation(true);
            try {
                const savedLocationId = localStorage.getItem('userLocationId');
                if (savedLocationId) {
                    const saved = LOCATIONS.find(l => l.id === savedLocationId);
                    if (saved) {
                        setUserLocation(saved);
                        setIsLoadingLocation(false);
                        return;
                    }
                }
                const detected = await detectUserLocation();
                setUserLocation(detected);
                localStorage.setItem('userLocationId', detected.id);
            } catch (error) {
                console.error('Failed to detect location:', error);
                const defaultLocation = LOCATIONS.find(l => l.id === 'mayapur')!;
                setUserLocation(defaultLocation);
            } finally {
                setIsLoadingLocation(false);
            }
        };
        loadLocation();
    }, []);

    const handleLocationChange = (location: UserLocation) => {
        setUserLocation(location);
        localStorage.setItem('userLocationId', location.id);
    };

    // Get Ekadasis for the selected location
    const locationEkadasis = useMemo(() => {
        if (!userLocation) return [];
        return getEkadasisForLocation(userLocation);
    }, [userLocation]);

    // Create a map of Ekadasi dates for quick lookup
    const ekadasiByDate = useMemo(() => {
        const map = new Map<string, EkadasiDate & { adjustedDate: string }>();
        locationEkadasis.forEach(ekadasi => {
            map.set(ekadasi.adjustedDate, ekadasi);
        });
        return map;
    }, [locationEkadasis]);

    // Calendar calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Create calendar days array
    const calendarDays = useMemo(() => {
        const days: (number | null)[] = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        return days;
    }, [startingDayOfWeek, daysInMonth]);

    // Group festivals by date (excluding Ekadasis)
    const festivalsByDate = useMemo(() => {
        const map = new Map<string, Festival[]>();
        festivals
            .filter(f => !f.name.toLowerCase().includes('ekadasi') && !f.name.toLowerCase().includes('ekādaśī'))
            .forEach(festival => {
                const dateKey = festival.date;
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey)!.push(festival);
            });
        return map;
    }, [festivals]);

    // Get events for a specific day
    const getEventsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayFestivals = festivalsByDate.get(dateStr) || [];
        const ekadasi = ekadasiByDate.get(dateStr);
        return { festivals: dayFestivals, ekadasi };
    };

    // Navigation handlers
    const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Check if a day is today
    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    // Handle day click - open sheet with day details
    const handleDayClick = (day: number) => {
        const { festivals: dayFestivals, ekadasi } = getEventsForDay(day);
        if (dayFestivals.length > 0 || ekadasi) {
            setSelectedDay(day);
            setIsSheetOpen(true);
        }
    };

    // Get all events for selected day (for sheet)
    const selectedDayEvents = useMemo(() => {
        if (!selectedDay) return { festivals: [], ekadasi: undefined, dateStr: '' };
        const { festivals: dayFestivals, ekadasi } = getEventsForDay(selectedDay);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
        return { festivals: dayFestivals, ekadasi, dateStr };
    }, [selectedDay, year, month, festivalsByDate, ekadasiByDate]);

    // Get all events for the current month (for list view)
    const monthEvents = useMemo(() => {
        const events: Array<{
            type: 'festival' | 'ekadasi';
            name: string;
            date: string;
            day: number;
            id?: number;
            festival?: Festival;
            ekadasi?: EkadasiDate & { adjustedDate: string };
        }> = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const { festivals: dayFestivals, ekadasi } = getEventsForDay(day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (ekadasi) {
                events.push({ type: 'ekadasi', name: ekadasi.name, date: dateStr, day, ekadasi });
            }
            dayFestivals.forEach(f => {
                events.push({ type: 'festival', name: f.name, date: dateStr, day, id: f.id, festival: f });
            });
        }

        return events.sort((a, b) => a.day - b.day);
    }, [daysInMonth, year, month, festivalsByDate, ekadasiByDate]);

    // Get upcoming events (for both views) - includes today's events
    const upcomingEvents = useMemo(() => {
        // Use local date instead of UTC to properly include today's events
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        const allEvents: Array<{
            type: 'festival' | 'ekadasi';
            name: string;
            date: string;
            id?: number;
            ekadasi?: EkadasiDate & { adjustedDate: string };
        }> = [];

        // Include festivals from today onwards
        festivals
            .filter(f => f.date >= today && !f.name.toLowerCase().includes('ekadasi'))
            .forEach(f => allEvents.push({ type: 'festival', name: f.name, date: f.date, id: f.id }));

        // Include ekadasis from today onwards
        locationEkadasis
            .filter(e => e.adjustedDate >= today)
            .forEach(e => allEvents.push({ type: 'ekadasi', name: e.name, date: e.adjustedDate, ekadasi: e }));

        return allEvents.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    }, [festivals, locationEkadasis]);

    const handleFestivalClick = (festivalId: number) => {
        setIsSheetOpen(false);
        setLocation(`/event/${festivalId}`);
    };

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weekDaysFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (isLoadingLocation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Detecting your location...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-orange-100 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-md mx-auto px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Logo size={36} />
                            <h1 className="text-base font-bold text-gray-800 dark:text-gray-200">Vaishnava Calendar</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* View Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-600 shadow-sm'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-600 shadow-sm'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            <LocationSelector
                                selectedLocation={userLocation}
                                onLocationChange={handleLocationChange}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-3 py-3">
                {/* Location Info Banner */}
                {userLocation && (
                    <div className="mb-3 p-2.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span className="font-medium text-orange-800 dark:text-orange-200">
                                {userLocation.name}
                            </span>
                            <span className="text-orange-500 dark:text-orange-400">•</span>
                            <span className="text-orange-600 dark:text-orange-400 truncate">
                                Ekadasi dates for {userLocation.city}
                            </span>
                        </div>
                    </div>
                )}

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-10 w-10">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-center flex-1">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{monthName}</h2>
                        <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs h-6 px-2 text-orange-600">
                            Today
                        </Button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-10 w-10">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Legend - Compact */}
                <div className="flex flex-wrap gap-2 mb-3 text-[10px] justify-center">
                    <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Appearance</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Disappearance</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Ekadasi</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Festival</span>
                    </div>
                </div>

                {/* Calendar Grid View */}
                {viewMode === 'grid' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-orange-100 dark:border-gray-700 overflow-hidden mb-4">
                        {/* Week days header */}
                        <div className="grid grid-cols-7 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-700">
                            {weekDays.map((day, idx) => (
                                <div key={idx} className="py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days - Touch optimized */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, index) => {
                                const { festivals: dayFestivals, ekadasi } = day ? getEventsForDay(day) : { festivals: [], ekadasi: undefined };
                                const hasEvents = dayFestivals.length > 0 || ekadasi;
                                const eventCount = dayFestivals.length + (ekadasi ? 1 : 0);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => day && handleDayClick(day)}
                                        className={`
                                            min-h-[52px] p-1 border-t border-r border-gray-100 dark:border-gray-700
                                            ${index % 7 === 0 ? 'border-l-0' : ''}
                                            ${!day ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
                                            ${day && hasEvents ? 'cursor-pointer active:bg-orange-100 dark:active:bg-gray-600' : ''}
                                            transition-colors
                                        `}
                                    >
                                        {day && (
                                            <div className="flex flex-col items-center h-full">
                                                {/* Day number */}
                                                <div className={`
                                                    text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-0.5
                                                    ${isToday(day) ? 'bg-orange-500 text-white' : 'text-gray-700 dark:text-gray-300'}
                                                `}>
                                                    {day}
                                                </div>

                                                {/* Event indicators - Dots for mobile */}
                                                {hasEvents && (
                                                    <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                                                        {ekadasi && (
                                                            <div className="w-2 h-2 rounded-full bg-amber-500" title="Ekadasi" />
                                                        )}
                                                        {dayFestivals.slice(0, 3).map((festival, i) => {
                                                            const category = getFestivalCategory(festival.name);
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`}
                                                                    title={festival.name}
                                                                />
                                                            );
                                                        })}
                                                        {eventCount > 4 && (
                                                            <div className="text-[8px] text-gray-500 font-medium">+{eventCount - 4}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-orange-100 dark:border-gray-700 overflow-hidden mb-4">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                Events in {currentDate.toLocaleString('default', { month: 'long' })}
                            </h3>
                            <p className="text-xs text-gray-500">{monthEvents.length} events</p>
                        </div>

                        {monthEvents.length === 0 ? (
                            <div className="p-8 text-center">
                                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No events this month</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto mobile-scroll">
                                {monthEvents.map((event, idx) => {
                                    const category = event.type === 'ekadasi' ? 'ekadasi' : getFestivalCategory(event.name);
                                    const eventDate = new Date(event.date + 'T00:00:00');
                                    const dayOfWeek = weekDaysFull[eventDate.getDay()];

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => event.id && handleFestivalClick(event.id)}
                                            className={`p-3 flex items-center gap-3 ${event.id ? 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700' : ''}`}
                                        >
                                            {/* Date badge */}
                                            <div className={`
                                                w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                                                ${isToday(event.day) ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}
                                            `}>
                                                <span className={`text-lg font-bold ${isToday(event.day) ? '' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {event.day}
                                                </span>
                                                <span className={`text-[10px] ${isToday(event.day) ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {dayOfWeek}
                                                </span>
                                            </div>

                                            {/* Event info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">{getCategoryEmoji(category)}</span>
                                                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                                                        {event.name}
                                                    </h4>
                                                </div>
                                                {event.type === 'ekadasi' && event.ekadasi && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                                                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded text-[10px] font-medium">
                                                            FAST
                                                        </span>
                                                        <span className="truncate">{event.ekadasi.paksha === 'shukla' ? 'Bright' : 'Dark'} fortnight</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Category indicator */}
                                            <div className={`w-1.5 h-8 rounded-full ${getCategoryColor(category)}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Upcoming Events - Always show */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-orange-100 dark:border-gray-700 p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Upcoming Sacred Events</h3>
                    </div>

                    <div className="space-y-2">
                        {upcomingEvents.map((event, idx) => {
                            const category = event.type === 'ekadasi' ? 'ekadasi' : getFestivalCategory(event.name);
                            const eventDate = new Date(event.date + 'T00:00:00');
                            const formattedDate = eventDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            });

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const diffTime = eventDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            return (
                                <div
                                    key={idx}
                                    onClick={() => event.id && handleFestivalClick(event.id)}
                                    className={`
                                        p-2.5 rounded-xl border transition-all
                                        ${event.id ? 'cursor-pointer active:scale-[0.98]' : ''}
                                        ${getCategoryBgColor(category)}
                                    `}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getCategoryColor(category)}`}></div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate">
                                                    {event.name}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                    {formattedDate}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`
                                            text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0
                                            ${diffDays === 0
                                                ? 'bg-orange-500 text-white'
                                                : diffDays === 1
                                                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                            }
                                        `}>
                                            {diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow' : `${diffDays}d`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {upcomingEvents.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                                No upcoming events found
                            </p>
                        )}
                    </div>
                </div>

                {/* Info about location-based dates */}
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-2">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                            <p className="font-medium mb-0.5">Location-Aware Ekadasi Dates</p>
                            <p className="text-blue-600 dark:text-blue-300 text-[11px]">
                                Ekadasi dates are calculated for {userLocation?.city}. Dates may differ in other locations.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Day Detail Sheet - Bottom drawer for mobile */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
                    <SheetHeader className="pb-2">
                        <SheetTitle className="flex items-center gap-3">
                            {selectedDay && (
                                <>
                                    <div className={`
                                        w-12 h-12 rounded-xl flex flex-col items-center justify-center
                                        ${isToday(selectedDay) ? 'bg-orange-500 text-white' : 'bg-orange-100 dark:bg-orange-900/30'}
                                    `}>
                                        <span className={`text-xl font-bold ${isToday(selectedDay) ? '' : 'text-orange-700 dark:text-orange-300'}`}>
                                            {selectedDay}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                            {new Date(selectedDayEvents.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {selectedDayEvents.festivals.length + (selectedDayEvents.ekadasi ? 1 : 0)} events
                                        </div>
                                    </div>
                                </>
                            )}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="space-y-3 mt-4">
                        {/* Ekadasi first if present */}
                        {selectedDayEvents.ekadasi && (
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700">
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">🌙</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-200">
                                                {selectedDayEvents.ekadasi.name}
                                            </h4>
                                            <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-semibold">
                                                FAST
                                            </span>
                                        </div>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                                            {selectedDayEvents.ekadasi.paksha === 'shukla' ? 'Śukla Pakṣa (Bright fortnight)' : 'Kṛṣṇa Pakṣa (Dark fortnight)'}
                                        </p>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            {selectedDayEvents.ekadasi.fastingInstructions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other festivals */}
                        {selectedDayEvents.festivals.map((festival, idx) => {
                            const category = getFestivalCategory(festival.name);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleFestivalClick(festival.id)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer active:scale-[0.98] transition-transform ${getCategoryBgColor(category)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-3xl">{getCategoryEmoji(category)}</div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-base ${getCategoryTextColor(category)}`}>
                                                {festival.name}
                                            </h4>
                                            {festival.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {festival.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-orange-500 mt-2 font-medium">
                                                Tap for more details →
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
