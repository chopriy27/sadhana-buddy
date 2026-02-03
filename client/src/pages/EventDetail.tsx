import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import {
    ArrowLeft,
    Calendar,
    Star,
    BookOpen,
    Heart,
    Sun,
    Moon,
    Sparkles,
    Info,
    Clock,
    MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface Festival {
    id: number;
    name: string;
    date: string;
    description: string | null;
    significance: string | null;
    observances: string[] | null;
}

// Acharya information database
const acharyaInfo: Record<string, {
    title: string;
    bio: string;
    teachings: string[];
    famousWorks: string[];
    image?: string;
}> = {
    'srila prabhupada': {
        title: 'Founder-Acharya of ISKCON',
        bio: 'His Divine Grace A.C. Bhaktivedanta Swami Prabhupada (1896-1977) was the Founder-Acharya of the International Society for Krishna Consciousness (ISKCON). He translated and commented on over 80 volumes of the Vedic scriptures, including Bhagavad-gita As It Is and Srimad-Bhagavatam. He circled the globe 14 times, establishing 108 temples, and initiated approximately 5,000 disciples.',
        teachings: [
            'Chant Hare Krishna and be happy',
            'Krishna consciousness is the original consciousness',
            'Back to Godhead - our original home',
            'Human life is meant for self-realization'
        ],
        famousWorks: [
            'Bhagavad-gita As It Is',
            'Srimad-Bhagavatam',
            'Caitanya-caritamrta',
            'The Nectar of Devotion'
        ]
    },
    'bhaktivinoda thakura': {
        title: 'Pioneer of Krishna Consciousness in Modern Age',
        bio: 'Srila Bhaktivinoda Thakura (1838-1914) was a great Vaishnava acharya who revived the teachings of Sri Caitanya Mahaprabhu. He was a prolific writer, composing hundreds of books, songs, and articles. He discovered the birthplace of Lord Caitanya in Mayapur and predicted that devotees from all over the world would come together to chant the holy names.',
        teachings: [
            'The holy name is the essence of all spiritual practices',
            'Devotional service is the highest perfection',
            'Sri Caitanya\'s teachings are for all humanity',
            'Pure devotion transcends all material designations'
        ],
        famousWorks: [
            'Jaiva Dharma',
            'Sri Caitanya Siksamrta',
            'Harinama Cintamani',
            'Gitavali and Kalyanakalpataru'
        ]
    },
    'narottama dasa thakura': {
        title: 'Treasure of Devotional Songs',
        bio: 'Srila Narottama dasa Thakura was one of the most important acharyas in the Gaudiya Vaishnava tradition. Born in the 16th century, he was a direct disciple of Srila Lokanatha Goswami. His devotional songs are sung daily in temples around the world and are considered the standard for expressing devotional sentiments.',
        teachings: [
            'Association of devotees is essential',
            'The dust of Vrindavan is most sacred',
            'Six Goswamis are our guiding lights',
            'Love of God is the ultimate goal'
        ],
        famousWorks: [
            'Prarthana',
            'Prema-bhakti-chandrika',
            'Numerous devotional songs'
        ]
    },
    'jiva goswami': {
        title: 'Greatest Philosopher of Gaudiya Vaishnavism',
        bio: 'Srila Jiva Goswami (1513-1598) was the nephew of Srila Rupa Goswami and Sanatana Goswami. He is considered the greatest philosopher and theologian in the Gaudiya Vaishnava tradition. He established the philosophical foundation of achintya-bhedabheda-tattva through his Six Sandarbhas.',
        teachings: [
            'Achintya-bhedabheda - inconceivable oneness and difference',
            'Sambandha, abhidheya, and prayojana',
            'Krishna is the Supreme Personality of Godhead',
            'Devotional service is the means and the end'
        ],
        famousWorks: [
            'Sat-sandarbha (Six Sandarbhas)',
            'Gopala-champu',
            'Commentaries on Bhakti-rasamrta-sindhu'
        ]
    },
    'rupa goswami': {
        title: 'Chief of the Six Goswamis',
        bio: 'Srila Rupa Goswami was the leader of the Six Goswamis of Vrindavan, directly empowered by Sri Caitanya Mahaprabhu to establish the science of devotional service. His writings form the foundation of Gaudiya Vaishnava philosophy and practice.',
        teachings: [
            'Bhakti-rasamrta-sindhu - the ocean of devotional nectar',
            'Vaidhi and raganuga bhakti',
            'The science of rasa (spiritual relationships)',
            'Ujjvala-nilamani - conjugal love of God'
        ],
        famousWorks: [
            'Bhakti-rasamrta-sindhu',
            'Ujjvala-nilamani',
            'Laghu-bhagavatamrta',
            'Vidagdha-madhava and Lalita-madhava (dramas)'
        ]
    },
    'sanatana goswami': {
        title: 'Elder of the Six Goswamis',
        bio: 'Srila Sanatana Goswami was the elder brother of Rupa Goswami and one of the most important figures in establishing Gaudiya Vaishnavism. Sri Caitanya Mahaprabhu personally instructed him for two months, teaching the essence of devotional service.',
        teachings: [
            'Hari-bhakti-vilasa - the standards of devotional practice',
            'Brhad-bhagavatamrta - the gradations of devotees',
            'Serving the Deity is essential',
            'Following the previous acharyas'
        ],
        famousWorks: [
            'Brhad-bhagavatamrta',
            'Hari-bhakti-vilasa',
            'Commentaries on Srimad-Bhagavatam'
        ]
    }
};

// Festival information database
const festivalInfo: Record<string, {
    significance: string;
    observances: string[];
    story?: string;
}> = {
    'janmashtami': {
        significance: 'The appearance day of Lord Sri Krishna, the Supreme Personality of Godhead, who appeared 5,000 years ago in Mathura.',
        observances: [
            'Fasting until midnight',
            'Elaborate Deity worship',
            'Singing devotional songs',
            'Reading Krishna\'s pastimes',
            'Midnight celebration and feast'
        ],
        story: 'Lord Krishna appeared at midnight in the prison of Kamsa to Devaki and Vasudeva. Despite heavy security, Vasudeva carried baby Krishna across the Yamuna river to Gokula, where He was raised by Nanda Maharaja and Yashoda.'
    },
    'gaura purnima': {
        significance: 'The appearance day of Sri Caitanya Mahaprabhu, who is Krishna Himself appearing as a devotee to teach the yuga-dharma of chanting the holy names.',
        observances: [
            'Fasting until moonrise',
            'Kirtan and sankirtan',
            'Reading Caitanya-caritamrta',
            'Offering special bhoga',
            'Celebrating with prasadam feast'
        ],
        story: 'Sri Caitanya Mahaprabhu appeared on the full moon night of Phalguna in 1486 CE in Mayapur. His appearance was accompanied by a lunar eclipse, during which everyone spontaneously chanted the holy names.'
    },
    'ekadasi': {
        significance: 'Ekadasi is the eleventh day of the lunar fortnight, most dear to Lord Vishnu. Observing Ekadasi purifies the heart and advances one in devotional service.',
        observances: [
            'Fasting from grains and beans',
            'Increased chanting of holy names',
            'Reading scriptures',
            'Extra rounds of japa',
            'Staying awake for night kirtan (optional)'
        ]
    },
    'ratha yatra': {
        significance: 'The annual chariot festival of Lord Jagannatha, celebrated with great joy and enthusiasm. Pulling the Lord\'s chariot grants liberation.',
        observances: [
            'Pulling the chariot ropes',
            'Street sankirtan',
            'Distributing prasadam',
            'Decorating the chariots',
            'Offering special bhoga'
        ],
        story: 'The Ratha Yatra commemorates Krishna\'s return to Vrindavan after many years in Dwaraka. The gopis\' intense love in separation is celebrated as the highest devotional mood.'
    }
};

// Extract acharya name from festival name
function extractAcharyaName(festivalName: string): string | null {
    const lowerName = festivalName.toLowerCase();

    const acharyas = [
        'srila prabhupada',
        'bhaktivinoda thakura',
        'narottama dasa thakura',
        'jiva goswami',
        'rupa goswami',
        'sanatana goswami'
    ];

    for (const acharya of acharyas) {
        if (lowerName.includes(acharya.split(' ')[0])) {
            return acharya;
        }
    }

    return null;
}

// Extract festival type
function extractFestivalType(festivalName: string): string | null {
    const lowerName = festivalName.toLowerCase();

    if (lowerName.includes('janmashtami') || lowerName.includes('janmastami')) return 'janmashtami';
    if (lowerName.includes('gaura purnima')) return 'gaura purnima';
    if (lowerName.includes('ekadasi') || lowerName.includes('ekādaśī')) return 'ekadasi';
    if (lowerName.includes('ratha yatra') || lowerName.includes('rathayatra')) return 'ratha yatra';

    return null;
}

function getFestivalCategory(name: string): 'appearance' | 'disappearance' | 'ekadasi' | 'festival' | 'other' {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('appearance')) return 'appearance';
    if (lowerName.includes('disappearance')) return 'disappearance';
    if (lowerName.includes('ekadasi') || lowerName.includes('ekādaśī')) return 'ekadasi';
    if (lowerName.includes('janmashtami') || lowerName.includes('diwali') || lowerName.includes('holi') ||
        lowerName.includes('ratha') || lowerName.includes('gaura purnima') || lowerName.includes('rama navami')) return 'festival';
    return 'other';
}

function getCategoryGradient(category: string): string {
    switch (category) {
        case 'appearance': return 'from-emerald-500 to-teal-600';
        case 'disappearance': return 'from-violet-500 to-purple-600';
        case 'ekadasi': return 'from-amber-500 to-orange-600';
        case 'festival': return 'from-rose-500 to-pink-600';
        default: return 'from-blue-500 to-indigo-600';
    }
}

export default function EventDetail() {
    const [, setLocation] = useLocation();
    const [match, params] = useRoute("/event/:id");
    const { user } = useAuth();

    const eventId = params?.id;

    // Fetch all festivals to find the specific one
    const { data: festivals = [] } = useQuery<Festival[]>({
        queryKey: ["/api/festivals"],
    });

    const festival = festivals.find(f => f.id === parseInt(eventId || '0'));

    if (!festival) {
        return (
            <div className="min-h-screen bg-warm-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Loading event...</h2>
                </div>
            </div>
        );
    }

    const category = getFestivalCategory(festival.name);
    const acharyaName = extractAcharyaName(festival.name);
    const festivalType = extractFestivalType(festival.name);

    const acharya = acharyaName ? acharyaInfo[acharyaName] : null;
    const festivalDetails = festivalType ? festivalInfo[festivalType] : null;

    // Format date
    const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const festivalDate = new Date(festival.date + 'T00:00:00');
    const formattedDate = festivalDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: userTimezone
    });

    // Calculate days remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = festivalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Hero Header */}
            <div className={`bg-gradient-to-br ${getCategoryGradient(category)} text-white`}>
                <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation('/calendar')}
                        className="text-white/90 hover:text-white hover:bg-white/10 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Calendar
                    </Button>

                    {/* Event Title */}
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            {category === 'appearance' && <Sun className="w-8 h-8" />}
                            {category === 'disappearance' && <Moon className="w-8 h-8" />}
                            {category === 'ekadasi' && <Star className="w-8 h-8" />}
                            {category === 'festival' && <Sparkles className="w-8 h-8" />}
                            {category === 'other' && <Calendar className="w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-2">{festival.name}</h1>
                            <div className="flex items-center gap-4 text-white/90 text-sm">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formattedDate}</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${diffDays === 0
                                        ? 'bg-white text-orange-600'
                                        : diffDays < 0
                                            ? 'bg-white/20'
                                            : 'bg-white/30'
                                    }`}>
                                    {diffDays === 0 ? '🎉 Today!' :
                                        diffDays === 1 ? 'Tomorrow' :
                                            diffDays < 0 ? `${Math.abs(diffDays)} days ago` :
                                                `${diffDays} days remaining`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Significance */}
                {(festival.significance || festivalDetails?.significance) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Significance</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {festival.significance || festivalDetails?.significance}
                        </p>
                    </div>
                )}

                {/* Story (if available) */}
                {festivalDetails?.story && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-violet-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">The Story</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {festivalDetails.story}
                        </p>
                    </div>
                )}

                {/* Observances */}
                {(festival.observances || festivalDetails?.observances) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Heart className="w-5 h-5 text-rose-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">How to Observe</h2>
                        </div>
                        <ul className="space-y-2">
                            {(festival.observances || festivalDetails?.observances || []).map((observance, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">{i + 1}</span>
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-300">{observance}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Acharya Information */}
                {acharya && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg border border-amber-200 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">About the Acharya</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-amber-700 dark:text-amber-400 text-sm uppercase tracking-wide mb-1">
                                    {acharya.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                    {acharya.bio}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Teachings</h4>
                                <ul className="space-y-1">
                                    {acharya.teachings.map((teaching, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span>{teaching}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Famous Works</h4>
                                <div className="flex flex-wrap gap-2">
                                    {acharya.famousWorks.map((work, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-amber-200 dark:border-gray-600"
                                        >
                                            {work}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Description (fallback) */}
                {festival.description && !festival.significance && !festivalDetails && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">About</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {festival.description}
                        </p>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3">
                    <Button
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        onClick={() => setLocation('/tracker')}
                    >
                        <Star className="w-4 h-4 mr-2" />
                        Track Sadhana
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setLocation('/songs')}
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Devotional Songs
                    </Button>
                </div>
            </main>
        </div>
    );
}

