// Location-based Vaishnava Calendar Service
// Ekadasi and festival dates can vary by up to 1 day based on location due to moon rise times

export interface Location {
    id: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    region: 'india' | 'us_east' | 'us_west' | 'europe' | 'asia' | 'australia' | 'other';
}

// Major ISKCON centers and cities
export const LOCATIONS: Location[] = [
    // India
    { id: 'mayapur', name: 'ISKCON Mayapur', city: 'Mayapur', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 23.4231, lng: 88.3880 }, region: 'india' },
    { id: 'vrindavan', name: 'ISKCON Vrindavan', city: 'Vrindavan', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 27.5830, lng: 77.6960 }, region: 'india' },
    { id: 'mumbai', name: 'ISKCON Mumbai', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 19.1136, lng: 72.8261 }, region: 'india' },
    { id: 'bangalore', name: 'ISKCON Bangalore', city: 'Bangalore', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 13.0105, lng: 77.5514 }, region: 'india' },
    { id: 'delhi', name: 'ISKCON Delhi', city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 28.5513, lng: 77.2507 }, region: 'india' },
    { id: 'chennai', name: 'ISKCON Chennai', city: 'Chennai', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 13.0389, lng: 80.2342 }, region: 'india' },
    { id: 'kolkata', name: 'ISKCON Kolkata', city: 'Kolkata', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 22.5260, lng: 88.3638 }, region: 'india' },
    { id: 'pune', name: 'ISKCON Pune', city: 'Pune', country: 'India', timezone: 'Asia/Kolkata', coordinates: { lat: 18.5607, lng: 73.7800 }, region: 'india' },

    // US East Coast
    { id: 'new_york', name: 'ISKCON New York', city: 'New York', country: 'USA', timezone: 'America/New_York', coordinates: { lat: 40.7128, lng: -74.0060 }, region: 'us_east' },
    { id: 'washington_dc', name: 'ISKCON Washington DC', city: 'Washington DC', country: 'USA', timezone: 'America/New_York', coordinates: { lat: 38.9072, lng: -77.0369 }, region: 'us_east' },
    { id: 'boston', name: 'ISKCON Boston', city: 'Boston', country: 'USA', timezone: 'America/New_York', coordinates: { lat: 42.3601, lng: -71.0589 }, region: 'us_east' },
    { id: 'atlanta', name: 'ISKCON Atlanta', city: 'Atlanta', country: 'USA', timezone: 'America/New_York', coordinates: { lat: 33.7490, lng: -84.3880 }, region: 'us_east' },
    { id: 'miami', name: 'ISKCON Miami', city: 'Miami', country: 'USA', timezone: 'America/New_York', coordinates: { lat: 25.7617, lng: -80.1918 }, region: 'us_east' },

    // US West Coast
    { id: 'los_angeles', name: 'ISKCON Los Angeles', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', coordinates: { lat: 34.0522, lng: -118.2437 }, region: 'us_west' },
    { id: 'san_francisco', name: 'ISKCON San Francisco', city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles', coordinates: { lat: 37.7749, lng: -122.4194 }, region: 'us_west' },
    { id: 'seattle', name: 'ISKCON Seattle', city: 'Seattle', country: 'USA', timezone: 'America/Los_Angeles', coordinates: { lat: 47.6062, lng: -122.3321 }, region: 'us_west' },
    { id: 'denver', name: 'ISKCON Denver', city: 'Denver', country: 'USA', timezone: 'America/Denver', coordinates: { lat: 39.7392, lng: -104.9903 }, region: 'us_west' },
    { id: 'dallas', name: 'ISKCON Dallas', city: 'Dallas', country: 'USA', timezone: 'America/Chicago', coordinates: { lat: 32.7767, lng: -96.7970 }, region: 'us_west' },
    { id: 'houston', name: 'ISKCON Houston', city: 'Houston', country: 'USA', timezone: 'America/Chicago', coordinates: { lat: 29.7604, lng: -95.3698 }, region: 'us_west' },

    // Europe
    { id: 'london', name: 'ISKCON London', city: 'London', country: 'UK', timezone: 'Europe/London', coordinates: { lat: 51.5355, lng: -0.1265 }, region: 'europe' },
    { id: 'paris', name: 'ISKCON Paris', city: 'Paris', country: 'France', timezone: 'Europe/Paris', coordinates: { lat: 48.8566, lng: 2.3522 }, region: 'europe' },
    { id: 'berlin', name: 'ISKCON Berlin', city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', coordinates: { lat: 52.5200, lng: 13.4050 }, region: 'europe' },
    { id: 'zurich', name: 'ISKCON Zurich', city: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich', coordinates: { lat: 47.3769, lng: 8.5417 }, region: 'europe' },

    // Asia Pacific
    { id: 'sydney', name: 'ISKCON Sydney', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', coordinates: { lat: -33.8688, lng: 151.2093 }, region: 'australia' },
    { id: 'melbourne', name: 'ISKCON Melbourne', city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', coordinates: { lat: -37.8136, lng: 144.9631 }, region: 'australia' },
    { id: 'singapore', name: 'ISKCON Singapore', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', coordinates: { lat: 1.3521, lng: 103.8198 }, region: 'asia' },
    { id: 'hong_kong', name: 'ISKCON Hong Kong', city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', coordinates: { lat: 22.3193, lng: 114.1694 }, region: 'asia' },
    { id: 'tokyo', name: 'ISKCON Tokyo', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', coordinates: { lat: 35.6762, lng: 139.6503 }, region: 'asia' },
];

// Ekadasi dates for 2025 - adjusted by region
// Due to moon rise time differences, Ekadasi can be observed on different days
// Format: { name, india_date, us_west_date, us_east_date, europe_date }
export interface EkadasiDate {
    name: string;
    paksha: 'shukla' | 'krishna'; // bright/dark fortnight
    month: string;
    dates: {
        india: string;
        us_west: string;
        us_east: string;
        europe: string;
        australia: string;
    };
    fastingInstructions: string;
}

// 2025-2026 Ekadasi dates with regional variations
export const EKADASI_DATES: EkadasiDate[] = [
    // January 2025
    {
        name: 'Pausha Putrada Ekadasi', paksha: 'shukla', month: 'January',
        dates: { india: '2025-01-10', us_west: '2025-01-10', us_east: '2025-01-10', europe: '2025-01-10', australia: '2025-01-11' },
        fastingInstructions: 'Fast from grains and beans. Break fast next day between sunrise and 1/3 of daylight hours.'
    },
    {
        name: 'Shat-tila Ekadasi', paksha: 'krishna', month: 'January',
        dates: { india: '2025-01-25', us_west: '2025-01-24', us_east: '2025-01-25', europe: '2025-01-25', australia: '2025-01-25' },
        fastingInstructions: 'Fast from grains. Offer sesame seeds to Lord Vishnu.'
    },

    // February 2025
    {
        name: 'Jaya Ekadasi', paksha: 'shukla', month: 'February',
        dates: { india: '2025-02-09', us_west: '2025-02-08', us_east: '2025-02-09', europe: '2025-02-09', australia: '2025-02-09' },
        fastingInstructions: 'Fast from grains and beans. This Ekadasi liberates from ghostly existence.'
    },
    {
        name: 'Vijaya Ekadasi', paksha: 'krishna', month: 'February',
        dates: { india: '2025-02-23', us_west: '2025-02-23', us_east: '2025-02-23', europe: '2025-02-23', australia: '2025-02-24' },
        fastingInstructions: 'Fast from grains. Lord Rama observed this Ekadasi before building the bridge to Lanka.'
    },

    // March 2025
    {
        name: 'Amalaki Ekadasi', paksha: 'shukla', month: 'March',
        dates: { india: '2025-03-11', us_west: '2025-03-10', us_east: '2025-03-11', europe: '2025-03-11', australia: '2025-03-11' },
        fastingInstructions: 'Fast from grains. Worship the Amalaki tree (Indian gooseberry).'
    },
    {
        name: 'Papamochani Ekadasi', paksha: 'krishna', month: 'March',
        dates: { india: '2025-03-25', us_west: '2025-03-25', us_east: '2025-03-25', europe: '2025-03-25', australia: '2025-03-26' },
        fastingInstructions: 'Fast from grains. This Ekadasi removes all sins.'
    },

    // April 2025
    {
        name: 'Kamada Ekadasi', paksha: 'shukla', month: 'April',
        dates: { india: '2025-04-09', us_west: '2025-04-09', us_east: '2025-04-09', europe: '2025-04-09', australia: '2025-04-10' },
        fastingInstructions: 'Fast from grains. Fulfills all material and spiritual desires.'
    },
    {
        name: 'Varuthini Ekadasi', paksha: 'krishna', month: 'April',
        dates: { india: '2025-04-24', us_west: '2025-04-23', us_east: '2025-04-24', europe: '2025-04-24', australia: '2025-04-24' },
        fastingInstructions: 'Fast from grains. Protects one from hellish conditions.'
    },

    // May 2025
    {
        name: 'Mohini Ekadasi', paksha: 'shukla', month: 'May',
        dates: { india: '2025-05-09', us_west: '2025-05-08', us_east: '2025-05-09', europe: '2025-05-09', australia: '2025-05-09' },
        fastingInstructions: 'Fast from grains. Named after Lord Vishnu\'s Mohini form.'
    },
    {
        name: 'Apara Ekadasi', paksha: 'krishna', month: 'May',
        dates: { india: '2025-05-23', us_west: '2025-05-23', us_east: '2025-05-23', europe: '2025-05-23', australia: '2025-05-24' },
        fastingInstructions: 'Fast from grains. Destroys unlimited sins.'
    },

    // June 2025
    {
        name: 'Pandava Nirjala Ekadasi', paksha: 'shukla', month: 'June',
        dates: { india: '2025-06-07', us_west: '2025-06-07', us_east: '2025-06-07', europe: '2025-06-07', australia: '2025-06-08' },
        fastingInstructions: 'Complete fast without even water (nirjala). Most powerful Ekadasi. Equal to observing all 24 Ekadasis.'
    },
    {
        name: 'Yogini Ekadasi', paksha: 'krishna', month: 'June',
        dates: { india: '2025-06-22', us_west: '2025-06-21', us_east: '2025-06-22', europe: '2025-06-22', australia: '2025-06-22' },
        fastingInstructions: 'Fast from grains. Removes sins of killing a brahmana.'
    },

    // July 2025
    {
        name: 'Devshayani Ekadasi', paksha: 'shukla', month: 'July',
        dates: { india: '2025-07-06', us_west: '2025-07-06', us_east: '2025-07-06', europe: '2025-07-06', australia: '2025-07-07' },
        fastingInstructions: 'Fast from grains. Lord Vishnu goes to sleep (Chaturmas begins).'
    },
    {
        name: 'Kamika Ekadasi', paksha: 'krishna', month: 'July',
        dates: { india: '2025-07-21', us_west: '2025-07-21', us_east: '2025-07-21', europe: '2025-07-21', australia: '2025-07-22' },
        fastingInstructions: 'Fast from grains. Destroys all sinful reactions.'
    },

    // August 2025
    {
        name: 'Pavitropana Ekadasi', paksha: 'shukla', month: 'August',
        dates: { india: '2025-08-05', us_west: '2025-08-04', us_east: '2025-08-05', europe: '2025-08-05', australia: '2025-08-05' },
        fastingInstructions: 'Fast from grains. Offer sacred thread to Lord Vishnu.'
    },
    {
        name: 'Aja Ekadasi', paksha: 'krishna', month: 'August',
        dates: { india: '2025-08-20', us_west: '2025-08-19', us_east: '2025-08-20', europe: '2025-08-20', australia: '2025-08-20' },
        fastingInstructions: 'Fast from grains. Removes all sins including brahma-hatya.'
    },

    // September 2025
    {
        name: 'Parsva Ekadasi', paksha: 'shukla', month: 'September',
        dates: { india: '2025-09-03', us_west: '2025-09-03', us_east: '2025-09-03', europe: '2025-09-03', australia: '2025-09-04' },
        fastingInstructions: 'Fast from grains. Lord Vishnu turns to His side while sleeping.'
    },
    {
        name: 'Indira Ekadasi', paksha: 'krishna', month: 'September',
        dates: { india: '2025-09-18', us_west: '2025-09-18', us_east: '2025-09-18', europe: '2025-09-18', australia: '2025-09-19' },
        fastingInstructions: 'Fast from grains. Liberates ancestors from hellish planets.'
    },

    // October 2025
    {
        name: 'Pasankusa Ekadasi', paksha: 'shukla', month: 'October',
        dates: { india: '2025-10-02', us_west: '2025-10-02', us_east: '2025-10-02', europe: '2025-10-02', australia: '2025-10-03' },
        fastingInstructions: 'Fast from grains. Named after Lord Vishnu\'s goad.'
    },
    {
        name: 'Rama Ekadasi', paksha: 'krishna', month: 'October',
        dates: { india: '2025-10-17', us_west: '2025-10-17', us_east: '2025-10-17', europe: '2025-10-17', australia: '2025-10-18' },
        fastingInstructions: 'Fast from grains. Very dear to Goddess Lakshmi (Rama).'
    },

    // November 2025
    {
        name: 'Utthana/Devprabodhini Ekadasi', paksha: 'shukla', month: 'November',
        dates: { india: '2025-11-01', us_west: '2025-10-31', us_east: '2025-11-01', europe: '2025-11-01', australia: '2025-11-01' },
        fastingInstructions: 'Fast from grains. Lord Vishnu awakens (Chaturmas ends). Very auspicious for marriages.'
    },
    {
        name: 'Utpanna Ekadasi', paksha: 'krishna', month: 'November',
        dates: { india: '2025-11-16', us_west: '2025-11-15', us_east: '2025-11-16', europe: '2025-11-16', australia: '2025-11-16' },
        fastingInstructions: 'Fast from grains. Origin of Ekadasi. Mother of all Ekadasis.'
    },

    // December 2025
    {
        name: 'Mokshada Ekadasi', paksha: 'shukla', month: 'December',
        dates: { india: '2025-12-01', us_west: '2025-11-30', us_east: '2025-12-01', europe: '2025-12-01', australia: '2025-12-01' },
        fastingInstructions: 'Fast from grains. Grants liberation (moksha). Gita Jayanti - Bhagavad Gita was spoken.'
    },
    {
        name: 'Saphala Ekadasi', paksha: 'krishna', month: 'December',
        dates: { india: '2025-12-15', us_west: '2025-12-15', us_east: '2025-12-15', europe: '2025-12-15', australia: '2025-12-16' },
        fastingInstructions: 'Fast from grains. Makes all endeavors successful.'
    },
    {
        name: 'Vaikuntha Ekadasi', paksha: 'shukla', month: 'December',
        dates: { india: '2025-12-30', us_west: '2025-12-30', us_east: '2025-12-30', europe: '2025-12-30', australia: '2025-12-31' },
        fastingInstructions: 'Fast from grains. Gates of Vaikuntha open. Most auspicious Ekadasi.'
    },

    // ==================== 2026 Ekadasis ====================
    
    // January 2026
    {
        name: 'Sat-tila Ekadasi', paksha: 'krishna', month: 'January',
        dates: { india: '2026-01-14', us_west: '2026-01-13', us_east: '2026-01-14', europe: '2026-01-14', australia: '2026-01-14' },
        fastingInstructions: 'Fast from grains. Offer sesame seeds (tila) to Lord Vishnu. Very purifying.'
    },
    {
        name: 'Bhaimi Ekadasi (Jaya Ekadasi)', paksha: 'shukla', month: 'January',
        dates: { india: '2026-01-29', us_west: '2026-01-28', us_east: '2026-01-29', europe: '2026-01-29', australia: '2026-01-29' },
        fastingInstructions: 'Fast from grains. Also known as Jaya Ekadasi. Varaha Dvadasi next day.'
    },

    // February 2026
    {
        name: 'Vijaya Ekadasi', paksha: 'krishna', month: 'February',
        dates: { india: '2026-02-12', us_west: '2026-02-11', us_east: '2026-02-12', europe: '2026-02-12', australia: '2026-02-12' },
        fastingInstructions: 'Fast from grains. Lord Rama observed this before building the bridge to Lanka. Grants victory.'
    },
    {
        name: 'Amalaki Ekadasi', paksha: 'shukla', month: 'February',
        dates: { india: '2026-02-27', us_west: '2026-02-26', us_east: '2026-02-27', europe: '2026-02-27', australia: '2026-02-27' },
        fastingInstructions: 'Fast from grains. Worship the Amalaki tree (Indian gooseberry). Very auspicious.'
    },

    // March 2026
    {
        name: 'Papamocani Ekadasi', paksha: 'krishna', month: 'March',
        dates: { india: '2026-03-14', us_west: '2026-03-13', us_east: '2026-03-14', europe: '2026-03-14', australia: '2026-03-14' },
        fastingInstructions: 'Fast from grains. Removes all sins (papa). Highly purifying.'
    },
    {
        name: 'Kamada Ekadasi', paksha: 'shukla', month: 'March',
        dates: { india: '2026-03-28', us_west: '2026-03-27', us_east: '2026-03-28', europe: '2026-03-28', australia: '2026-03-28' },
        fastingInstructions: 'Fast from grains. Fulfills all material and spiritual desires (kama).'
    },

    // April 2026
    {
        name: 'Varuthini Ekadasi', paksha: 'krishna', month: 'April',
        dates: { india: '2026-04-13', us_west: '2026-04-12', us_east: '2026-04-13', europe: '2026-04-13', australia: '2026-04-13' },
        fastingInstructions: 'Fast from grains. Protects one from hellish conditions. Very powerful.'
    },
    {
        name: 'Mohini Ekadasi', paksha: 'shukla', month: 'April',
        dates: { india: '2026-04-27', us_west: '2026-04-26', us_east: '2026-04-27', europe: '2026-04-27', australia: '2026-04-27' },
        fastingInstructions: 'Fast from grains. Named after Lord Vishnu\'s Mohini form. Enchanting blessings.'
    },

    // May 2026
    {
        name: 'Apara Ekadasi', paksha: 'krishna', month: 'May',
        dates: { india: '2026-05-13', us_west: '2026-05-12', us_east: '2026-05-13', europe: '2026-05-13', australia: '2026-05-13' },
        fastingInstructions: 'Fast from grains. Destroys unlimited sins. Very merciful Ekadasi.'
    },
    {
        name: 'Padmini Ekadasi (Adhika Masa)', paksha: 'shukla', month: 'May',
        dates: { india: '2026-05-26', us_west: '2026-05-25', us_east: '2026-05-26', europe: '2026-05-26', australia: '2026-05-26' },
        fastingInstructions: 'Fast from grains. Special Ekadasi in the extra month (Purusottama Adhika Masa). Very rare and auspicious.'
    },

    // June 2026
    {
        name: 'Parama Ekadasi (Adhika Masa)', paksha: 'krishna', month: 'June',
        dates: { india: '2026-06-11', us_west: '2026-06-10', us_east: '2026-06-11', europe: '2026-06-11', australia: '2026-06-11' },
        fastingInstructions: 'Fast from grains. Special Ekadasi in the extra month (Purusottama Adhika Masa). Extremely rare.'
    },
    {
        name: 'Pandava Nirjala Ekadasi', paksha: 'shukla', month: 'June',
        dates: { india: '2026-06-25', us_west: '2026-06-24', us_east: '2026-06-25', europe: '2026-06-25', australia: '2026-06-25' },
        fastingInstructions: 'Complete fast without even water (nirjala). Most powerful Ekadasi. Equal to observing all 24 Ekadasis.'
    },

    // July 2026
    {
        name: 'Yogini Ekadasi', paksha: 'krishna', month: 'July',
        dates: { india: '2026-07-10', us_west: '2026-07-09', us_east: '2026-07-10', europe: '2026-07-10', australia: '2026-07-10' },
        fastingInstructions: 'Fast from grains. Removes even the sin of killing a brahmana.'
    },
    {
        name: 'Sayana Ekadasi (Devshayani)', paksha: 'shukla', month: 'July',
        dates: { india: '2026-07-24', us_west: '2026-07-23', us_east: '2026-07-24', europe: '2026-07-24', australia: '2026-07-24' },
        fastingInstructions: 'Fast from grains. Lord Vishnu goes to sleep. Chaturmas begins.'
    },

    // August 2026
    {
        name: 'Kamika Ekadasi', paksha: 'krishna', month: 'August',
        dates: { india: '2026-08-08', us_west: '2026-08-07', us_east: '2026-08-08', europe: '2026-08-08', australia: '2026-08-08' },
        fastingInstructions: 'Fast from grains. Destroys all sinful reactions. Offer Tulasi leaves.'
    },
    {
        name: 'Pavitraropana Ekadasi (Putrada)', paksha: 'shukla', month: 'August',
        dates: { india: '2026-08-23', us_west: '2026-08-22', us_east: '2026-08-23', europe: '2026-08-23', australia: '2026-08-23' },
        fastingInstructions: 'Fast from grains. Offer sacred thread to Lord Vishnu. Jhulana Yatra begins.'
    },

    // September 2026
    {
        name: 'Annada Ekadasi (Aja Ekadasi)', paksha: 'krishna', month: 'September',
        dates: { india: '2026-09-07', us_west: '2026-09-06', us_east: '2026-09-07', europe: '2026-09-07', australia: '2026-09-07' },
        fastingInstructions: 'Fast from grains. Grants food (anna) and removes sins. Near Janmashtami.'
    },
    {
        name: 'Parsva Ekadasi (Parivartini)', paksha: 'shukla', month: 'September',
        dates: { india: '2026-09-22', us_west: '2026-09-21', us_east: '2026-09-22', europe: '2026-09-22', australia: '2026-09-22' },
        fastingInstructions: 'Fast from grains. Lord Vishnu turns to His side while sleeping. Vamana Dvadasi next day.'
    },

    // October 2026
    {
        name: 'Indira Ekadasi', paksha: 'krishna', month: 'October',
        dates: { india: '2026-10-06', us_west: '2026-10-05', us_east: '2026-10-06', europe: '2026-10-06', australia: '2026-10-06' },
        fastingInstructions: 'Fast from grains. Liberates ancestors from hellish planets. During Pitru Paksha.'
    },
    {
        name: 'Pasankusa Ekadasi', paksha: 'shukla', month: 'October',
        dates: { india: '2026-10-21', us_west: '2026-10-20', us_east: '2026-10-21', europe: '2026-10-21', australia: '2026-10-21' },
        fastingInstructions: 'Fast from grains. Named after Lord Vishnu\'s goad (ankusa). Controls the mind.'
    },

    // November 2026
    {
        name: 'Rama Ekadasi', paksha: 'krishna', month: 'November',
        dates: { india: '2026-11-04', us_west: '2026-11-03', us_east: '2026-11-04', europe: '2026-11-04', australia: '2026-11-04' },
        fastingInstructions: 'Fast from grains. Very dear to Goddess Lakshmi (Rama). Before Diwali.'
    },
    {
        name: 'Utthana Ekadasi (Devprabodhini)', paksha: 'shukla', month: 'November',
        dates: { india: '2026-11-20', us_west: '2026-11-19', us_east: '2026-11-20', europe: '2026-11-20', australia: '2026-11-20' },
        fastingInstructions: 'Fast from grains. Lord Vishnu awakens. Chaturmas ends. Bhishma Panchaka begins.'
    },

    // December 2026
    {
        name: 'Utpanna Ekadasi', paksha: 'krishna', month: 'December',
        dates: { india: '2026-12-04', us_west: '2026-12-03', us_east: '2026-12-04', europe: '2026-12-04', australia: '2026-12-04' },
        fastingInstructions: 'Fast from grains. Origin of Ekadasi. Mother of all Ekadasis. Very significant.'
    },
    {
        name: 'Moksada Ekadasi (Gita Jayanti)', paksha: 'shukla', month: 'December',
        dates: { india: '2026-12-20', us_west: '2026-12-19', us_east: '2026-12-20', europe: '2026-12-20', australia: '2026-12-20' },
        fastingInstructions: 'Fast from grains. Grants liberation (moksha). Gita Jayanti - Bhagavad Gita was spoken on this day.'
    },
];

// Get region key from location
export function getRegionKey(location: Location): keyof EkadasiDate['dates'] {
    switch (location.region) {
        case 'india': return 'india';
        case 'us_west': return 'us_west';
        case 'us_east': return 'us_east';
        case 'europe': return 'europe';
        case 'australia': return 'australia';
        case 'asia': return 'india'; // Use India dates for most of Asia
        default: return 'us_east'; // Default fallback
    }
}

// Find nearest location based on coordinates
export function findNearestLocation(lat: number, lng: number): Location {
    let nearest = LOCATIONS[0];
    let minDistance = Infinity;

    for (const location of LOCATIONS) {
        const distance = calculateDistance(lat, lng, location.coordinates.lat, location.coordinates.lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = location;
        }
    }

    return nearest;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Get Ekadasi for a specific date and location
export function getEkadasiForDate(date: string, location: Location): EkadasiDate | null {
    const regionKey = getRegionKey(location);
    return EKADASI_DATES.find(e => e.dates[regionKey] === date) || null;
}

// Get all Ekadasis for a location (with adjusted dates)
export function getEkadasisForLocation(location: Location): Array<EkadasiDate & { adjustedDate: string }> {
    const regionKey = getRegionKey(location);
    return EKADASI_DATES.map(e => ({
        ...e,
        adjustedDate: e.dates[regionKey]
    }));
}

// Get upcoming Ekadasis for a location
export function getUpcomingEkadasis(location: Location, count: number = 3): Array<EkadasiDate & { adjustedDate: string }> {
    const today = new Date().toISOString().split('T')[0];
    const regionKey = getRegionKey(location);

    return EKADASI_DATES
        .filter(e => e.dates[regionKey] >= today)
        .sort((a, b) => a.dates[regionKey].localeCompare(b.dates[regionKey]))
        .slice(0, count)
        .map(e => ({
            ...e,
            adjustedDate: e.dates[regionKey]
        }));
}

// Detect location from browser
export async function detectUserLocation(): Promise<Location> {
    return new Promise((resolve) => {
        // First try browser timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const locationFromTimezone = LOCATIONS.find(l => l.timezone === timezone);

        if (locationFromTimezone) {
            resolve(locationFromTimezone);
            return;
        }

        // Try geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const nearest = findNearestLocation(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    resolve(nearest);
                },
                () => {
                    // Geolocation failed, use timezone-based guess or default
                    const defaultLocation = guessLocationFromTimezone(timezone);
                    resolve(defaultLocation);
                },
                { timeout: 5000 }
            );
        } else {
            // No geolocation, use timezone-based guess
            const defaultLocation = guessLocationFromTimezone(timezone);
            resolve(defaultLocation);
        }
    });
}

// Guess location from timezone
function guessLocationFromTimezone(timezone: string): Location {
    // Check for timezone matches
    const tzLocation = LOCATIONS.find(l => l.timezone === timezone);
    if (tzLocation) return tzLocation;

    // Guess by timezone prefix
    if (timezone.startsWith('America/Los_Angeles') || timezone.startsWith('America/Vancouver')) {
        return LOCATIONS.find(l => l.id === 'los_angeles')!;
    }
    if (timezone.startsWith('America/New_York') || timezone.startsWith('America/Toronto')) {
        return LOCATIONS.find(l => l.id === 'new_york')!;
    }
    if (timezone.startsWith('Europe/London')) {
        return LOCATIONS.find(l => l.id === 'london')!;
    }
    if (timezone.startsWith('Asia/Kolkata') || timezone.startsWith('Asia/Calcutta')) {
        return LOCATIONS.find(l => l.id === 'mayapur')!;
    }
    if (timezone.startsWith('Australia/')) {
        return LOCATIONS.find(l => l.id === 'sydney')!;
    }

    // Default to Mayapur (ISKCON World Headquarters)
    return LOCATIONS.find(l => l.id === 'mayapur')!;
}

