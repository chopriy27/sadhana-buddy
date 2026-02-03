import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LOCATIONS, type Location, detectUserLocation } from '@/lib/locationCalendar';

interface LocationSelectorProps {
    selectedLocation: Location | null;
    onLocationChange: (location: Location) => void;
}

export default function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);

    // Group locations by region
    const groupedLocations = {
        india: LOCATIONS.filter(l => l.region === 'india'),
        us_east: LOCATIONS.filter(l => l.region === 'us_east'),
        us_west: LOCATIONS.filter(l => l.region === 'us_west'),
        europe: LOCATIONS.filter(l => l.region === 'europe'),
        asia: LOCATIONS.filter(l => l.region === 'asia'),
        australia: LOCATIONS.filter(l => l.region === 'australia'),
    };

    const regionLabels: Record<string, string> = {
        india: '🇮🇳 India',
        us_east: '🇺🇸 US East Coast',
        us_west: '🇺🇸 US West & Central',
        europe: '🇪🇺 Europe',
        asia: '🌏 Asia Pacific',
        australia: '🇦🇺 Australia',
    };

    // Filter locations based on search
    const filterLocations = (locations: Location[]) => {
        if (!searchQuery) return locations;
        const query = searchQuery.toLowerCase();
        return locations.filter(l =>
            l.name.toLowerCase().includes(query) ||
            l.city.toLowerCase().includes(query) ||
            l.country.toLowerCase().includes(query)
        );
    };

    // Auto-detect location
    const handleDetectLocation = async () => {
        setIsDetecting(true);
        try {
            const detected = await detectUserLocation();
            onLocationChange(detected);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to detect location:', error);
        } finally {
            setIsDetecting(false);
        }
    };

    const handleSelectLocation = (location: Location) => {
        onLocationChange(location);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-orange-200 dark:border-gray-600 hover:border-orange-400"
                >
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                        {selectedLocation?.city || 'Select Location'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-orange-500" />
                        Select Your Location
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ekadasi dates are adjusted based on your location
                    </p>
                </DialogHeader>

                {/* Auto-detect button */}
                <Button
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                >
                    {isDetecting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Detecting...
                        </>
                    ) : (
                        <>
                            <MapPin className="w-4 h-4 mr-2" />
                            Auto-detect My Location
                        </>
                    )}
                </Button>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search city or temple..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Location list */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {Object.entries(groupedLocations).map(([region, locations]) => {
                        const filtered = filterLocations(locations);
                        if (filtered.length === 0) return null;

                        return (
                            <div key={region}>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 sticky top-0 bg-white dark:bg-gray-900 py-1">
                                    {regionLabels[region]}
                                </h3>
                                <div className="space-y-1">
                                    {filtered.map(location => (
                                        <button
                                            key={location.id}
                                            onClick={() => handleSelectLocation(location)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedLocation?.id === location.id
                                                    ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                                                }`}
                                        >
                                            <div className="text-left">
                                                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                                    {location.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {location.city}, {location.country}
                                                </div>
                                            </div>
                                            {selectedLocation?.id === location.id && (
                                                <Check className="w-5 h-5 text-orange-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {searchQuery && Object.values(groupedLocations).every(locs => filterLocations(locs).length === 0) && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No locations found for "{searchQuery}"</p>
                            <p className="text-sm mt-1">Try searching for a city or country</p>
                        </div>
                    )}
                </div>

                <div className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                    Calendar dates adjust automatically for your selected location
                </div>
            </DialogContent>
        </Dialog>
    );
}

