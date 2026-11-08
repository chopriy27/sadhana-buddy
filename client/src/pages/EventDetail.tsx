import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import {
    ArrowLeft,
    Calendar,
    Star,
    Heart,
    Sun,
    Moon,
    Sparkles,
    Music
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

const acharyaInfo: Record<string, {
    observances?: string[];
    bhajans?: string[];
}> = {
    'srila prabhupada': {
        observances: ["Fast until noon"],
        bhajans: ['Yadi Prabhupada Na Hoito', 'Boro Krpa Koile Krsna', 'Sri Guru Carana Padma', 'Ohe Vaisnava Thakura', 'Je Anilo Prema Dhana Koruna Pracura']
    },
    'bhaktivinoda thakura': {
        observances: ["Fast until noon"],
        bhajans: ['Vibhavari Sesa', 'Bhaja Bhakata Vatsala', 'Jaya Radha Madhava', 'Ohe Vaisnava Thakura', 'Radha Kunda Tata Kunja Kutir']
    },
    'bhaktisiddhanta sarasvati thakura': {
        observances: ["Fast until noon"],
        bhajans: ['Sri Guru Carana Padma', 'Ohe Vaisnava Thakura', 'Vrndavana Vasi Jata Vaisnavera Gana']
    },
    'gaura kisora dasa babaji': {
        observances: ["Fast until noon"],
        bhajans: ['Namo Gaura-Kisoraya', 'Gaurangera Duti Pada', 'Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura']
    },
    'advaita acarya': {
        observances: ["Fast until noon"],
        bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Gaurangera Duti Pada', 'Ceto Darpana Marjanam']
    },
    'narottama dasa thakura': {
        bhajans: ['Nitai Pada Kamala', 'Kusumita Vrndavane Nacata Sikhi Gane', 'Vrndavana Ramya Sthana', 'Sri Guru Carana Padma']
    },
    'jiva goswami': {
        bhajans: ['Krsnotkirtana Gana Nartana Parau', 'Jaya Radhe Jaya Krsna Jaya Vrndavana']
    },
    'rupa goswami': {
        bhajans: ['Radhe Jaya Jaya Madhava Dayite', 'Krsnotkirtana Gana Nartana Parau']
    },
    'sanatana goswami': {
        bhajans: ['Vrndavana Ramya Sthana', 'Jaya Radhe Jaya Krsna Jaya Vrndavana']
    },
    'gopala bhatta goswami': {
        bhajans: ['Sri Guru Carana Padma', 'Namo Namah Tulasi Krsna Preyasi']
    },
    'lokanatha goswami': {
        bhajans: ['Vrndavana Ramya Sthana', 'Kusumita Vrndavane Nacata Sikhi Gane']
    },
    'raghunatha dasa goswami': {
        bhajans: ['Nija Pati Bhuja', 'Radha Kunda Tata Kunja Kutir', 'Vrndavana Ramya Sthana']
    },
    'raghunatha bhatta goswami': {
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana']
    },
    'krsnadasa kaviraja goswami': {
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana']
    },
    'haridasa thakura': {
        bhajans: ['Ceto Darpana Marjanam', 'Ohe Vaisnava Thakura']
    },
    'baladeva vidyabhusana': {
        bhajans: ['Isvara Parama Krsna', 'Namamisvaram Saccidananda Rupam']
    },
    'gadadhara pandita': {
        bhajans: ['Gaurangera Duti Pada', 'Ceto Darpana Marjanam']
    },
    'srivasa pandita': {
        bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Ceto Darpana Marjanam']
    },
    'nityananda prabhu': {
        bhajans: ['Nitai Pada Kamala', 'Nitai Guna Mani']
    },
    'narahari sarakara thakura': {
        bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Madana Mohana Tanu Gauranga Sundara', 'Gaurangera Duti Pada']
    },
    'vasudeva ghosh': {
        bhajans: ['Agam Agocara Gora', 'Akhil Gauranga Tumi More Doya Na', 'Gora Guna Gao Suni', 'Jaya Jaya Jagannatha Sacira Nandan', 'Jaya Jaya Kala Raba Nadiya Nagare', 'Madana Mohana Mani Gauranga Badana Khani', 'Niravadi Mora Mane Sacira Aginaya Nace', 'Sonari Puraba Lila', 'Yadi Gaura Na Hoito']
    },
    'srinivasa acharya': {
        bhajans: ['Krsnotkirtana Gana Nartana Parau', 'Je Anilo Prema Dhana Koruna Pracura', 'Sri Guru Carana Padma']
    },
    'syamananda prabhu': {
        bhajans: ['Radhe Jaya Jaya Madhava Dayite']
    },
    'rasikananda prabhu': {
        bhajans: ['Ohe Vaisnava Thakura']
    },
    'gadadhara dasa goswami': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura', 'Thakura Vaisnava Pada']
    },
    'dhananjaya pandita': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Vrndavana Vasi Jata Vaisnavera Gana']
    },
    'bhugarbha goswami': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura', 'Vrndavana Vasi Jata Vaisnavera Gana']
    },
    'kasisvara pandita': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura', 'Vrndavana Vasi Jata Vaisnavera Gana']
    },
    'nimbarkacharya': {
        bhajans: ['Hari Haraye Namah Krsna Yadavaya Namah', 'Isvara Parama Krsna']
    },
    'kaliya krsnadasa': {
        bhajans: ['Nitai Pada Kamala', 'Nitai Guna Mani', 'Je Anilo Prema Dhana Koruna Pracura']
    }
};

const festivalInfo: Record<string, {
    observances?: string[];
    bhajans?: string[];
}> = {
    'janmashtami': {
        observances: ["Fast until midnight"],
        bhajans: ['Yasomati Nandana', 'Jaya Radha Madhava', 'Bhaja Bhakata Vatsala']
    },
    'gaura purnima': {
        observances: ["Fast until moonrise"],
        bhajans: ['Gaurangera Duti Pada', 'Ceto Darpana Marjanam', 'Sri Hari Vasare Hari Kirtana Vidhana']
    },
    'nityananda trayodasi': {
        observances: ["Fast until noon"],
        bhajans: ['Nitai Pada Kamala', 'Nitai Guna Mani']
    },
    'rama navami': {
        observances: ["Please read the GBC Śāstric Advisory Council paper for guidance on this observance"],
        bhajans: ['Isvara Parama Krsna', 'Namamisvaram Saccidananda Rupam']
    },
    'radhastami': {
        observances: ["Fast until noon"],
        bhajans: ['Radhe Jaya Jaya Madhava Dayite', 'Jaya Radhe Jaya Krsna Jaya Vrndavana']
    },
    'vamana': {
        observances: ["Fast until noon"],
        bhajans: ['Isvara Parama Krsna', 'Namamisvaram Saccidananda Rupam']
    },
    'lord balarama': {
        observances: ["Fast until noon"],
        bhajans: ['Nitai Pada Kamala', 'Nitai Guna Mani']
    },
    'nrsimha caturdasi': {
        observances: ["Fast until dusk"],
        bhajans: ['Namamisvaram Saccidananda Rupam', 'Isvara Parama Krsna']
    },
    'varaha dvadasi': {
        observances: ["Fast until noon"],
        bhajans: ['Isvara Parama Krsna', 'Namamisvaram Saccidananda Rupam']
    },
    'ekadasi': {
        bhajans: ['Maha Prasade Govinde', 'Sarira Avidya Jala']
    },
    'ratha yatra': {
        bhajans: ['Jaya Jaya Jagannatha Sacira Nandan', 'Yadi Gaura Na Hoito']
    },
    'govardhan puja': {
        bhajans: ['Krsna Pasadena Samasta Saila', 'Nija Pati Bhuja']
    },
    'gopastami': {
        bhajans: ['Bhaja Bhakata Vatsala', 'Nija Pati Bhuja', 'Yasomati Nandana', 'Vande Krsna Nanda Kumara']
    },
    'dipavali': {
        bhajans: ['Rajat Kirita Mani Didhiti', 'Raghavam Karunakaram Muni Sevitam']
    },
    'guru purnima': {
        bhajans: ['Sri Guru Carana Padma', 'Ohe Vaisnava Thakura']
    },
    'snana yatra': {
        bhajans: ['Jaya Jaya Jagannatha Sacira Nandan']
    },
    'panihati': {
        bhajans: ['Nitai Pada Kamala', 'Nitai Guna Mani']
    },
    'jhulan yatra': {
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana', 'Kusumita Vrndavane Nacata Sikhi Gane']
    },
    'nandotsava': {
        bhajans: ['Yasomati Nandana', 'Jaya Radha Madhava', 'Bhaja Bhakata Vatsala']
    },
    'ananta caturdasi': {
        bhajans: ['Isvara Parama Krsna', 'Namamisvaram Saccidananda Rupam']
    },
    'caturmasya': {
        bhajans: ['Maha Prasade Govinde', 'Sarira Avidya Jala']
    },
    'ganga puja': {
        bhajans: ['Sri Guru Carana Padma']
    },
    'bhisma pancaka': {
        bhajans: ['Namamisvaram Saccidananda Rupam', 'Jaya Radha Madhava', 'Bhaja Bhakata Vatsala']
    },
    'saradiya rasayatra': {
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana', 'Vrndavana Ramya Sthana', 'Kusumita Vrndavane Nacata Sikhi Gane', 'Radha Kunda Tata Kunja Kutir']
    },
    'tulasi-saligram vivaha': {
        bhajans: ['Namo Namah Tulasi Krsna Preyasi', 'Namo Namah Tulasi Maharani', 'Vrndayai Tulasi-Devyai Priyayai Kesavasya Ca', 'Gangeya Campeya']
    },
    'katyayani vrata': {
        bhajans: ['Radhe Jaya Jaya Madhava Dayite', 'Ami Jamuna Puline', 'Srita Kamala']
    },
    'pandava nirjala ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'yogini ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'sayana ekadasi': { bhajans: ['Isvara Parama Krsna'] },
    'kamika ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'pavitropana ekadasi': { bhajans: ['Sri Guru Carana Padma'] },
    'annada ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'parsva ekadasi': { bhajans: ['Isvara Parama Krsna'] },
    'indira ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'pasankusa ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'rama ekadasi': { bhajans: ['Vibhavari Sesa'] },
    'utthana ekadasi': { bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Ceto Darpana Marjanam', 'Jaya Radha Madhava', 'Vibhavari Sesa'] },
    'moksada ekadasi': { bhajans: ['Isvara Parama Krsna', 'Ceto Darpana Marjanam'] },
    'utpanna ekadasi': { bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Madana Mohana Tanu Gauranga Sundara', 'Gaurangera Duti Pada'] },
    'parama ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'jagaddhatri puja': { bhajans: ['Hari Haraye Namah Krsna Yadavaya Namah'] },
};

function extractAcharyaName(festivalName: string): string | null {
    const lowerName = festivalName.toLowerCase();
    const keywordMap: Record<string, string> = {
        'prabhupada': 'srila prabhupada',
        'bhaktivinoda': 'bhaktivinoda thakura',
        'narottama': 'narottama dasa thakura',
        'jiva goswami': 'jiva goswami',
        'rupa goswami': 'rupa goswami',
        'sanatana goswami': 'sanatana goswami',
        'gopala bhatta': 'gopala bhatta goswami',
        'lokanatha': 'lokanatha goswami',
        'raghunatha dasa': 'raghunatha dasa goswami',
        'raghunatha bhatta': 'raghunatha bhatta goswami',
        'krsnadasa kaviraja': 'krsnadasa kaviraja goswami',
        'haridasa': 'haridasa thakura',
        'baladeva vidyabhusana': 'baladeva vidyabhusana',
        'bhaktisiddhanta': 'bhaktisiddhanta sarasvati thakura',
        'gadadhara dasa': 'gadadhara dasa goswami',
        'gadadhara': 'gadadhara pandita',
        'srivasa': 'srivasa pandita',
        'nityananda': 'nityananda prabhu',
        'gaura kisora': 'gaura kisora dasa babaji',
        'narahari': 'narahari sarakara thakura',
        'vasudeva ghosh': 'vasudeva ghosh',
        'srinivasa acharya': 'srinivasa acharya',
        'syamananda': 'syamananda prabhu',
        'rasikananda': 'rasikananda prabhu',
        'dhananjaya pandita': 'dhananjaya pandita',
        'bhugarbha': 'bhugarbha goswami',
        'kasisvara': 'kasisvara pandita',
        'nimbarkacharya': 'nimbarkacharya',
        'nimbarka': 'nimbarkacharya',
        'kaliya krsnadasa': 'kaliya krsnadasa',
        'advaita': 'advaita acarya',
    };
    for (const [keyword, key] of Object.entries(keywordMap)) {
        if (lowerName.includes(keyword)) return key;
    }
    return null;
}

function extractFestivalType(festivalName: string): string | null {
    const n = festivalName.toLowerCase();
    if (n.includes('janmashtami') || n.includes('janmastami') || n.includes('krsna janma') || n.includes('sri krsna sept')) return 'janmashtami';
    if (n.includes('gaura purnima')) return 'gaura purnima';
    if (n.includes('nrsimha') || n.includes('narasimha') || n.includes('nṛsiṃha')) return 'nrsimha caturdasi';
    if (n.includes('varaha')) return 'varaha dvadasi';
    if (n.includes('pandava nirjala')) return 'pandava nirjala ekadasi';
    if (n.includes('yogini ekadasi') || n.includes('yogini ekādaśī')) return 'yogini ekadasi';
    if (n.includes('sayana ekadashi') || n.includes('sayana ekadasi')) return 'sayana ekadasi';
    if (n.includes('kamika ekadashi') || n.includes('kamika ekadasi')) return 'kamika ekadasi';
    if (n.includes('pavitropana') || n.includes('pavitropan')) return 'pavitropana ekadasi';
    if (n.includes('annada ekadashi') || n.includes('annada ekadasi')) return 'annada ekadasi';
    if (n.includes('parsva ekadashi') || n.includes('parsva ekadasi')) return 'parsva ekadasi';
    if (n.includes('indira ekadasi') || n.includes('indira ekadashi')) return 'indira ekadasi';
    if (n.includes('pasankusa') || n.includes('pashankusha')) return 'pasankusa ekadasi';
    if (n.includes('rama ekadashi') || n.includes('rama ekadasi')) return 'rama ekadasi';
    if (n.includes('utthana ekadashi') || n.includes('utthana ekadasi') || n.includes('devotthan')) return 'utthana ekadasi';
    if (n.includes('moksada') || n.includes('mokshada')) return 'moksada ekadasi';
    if (n.includes('utpanna ekadashi') || n.includes('utpanna ekadasi')) return 'utpanna ekadasi';
    if (n.includes('parama ekadashi') || n.includes('parama ekadasi')) return 'parama ekadasi';
    if (n.includes('ekadasi') || n.includes('ekādaśī') || n.includes('ekadashi')) return 'ekadasi';
    if (n.includes('ratha yatra') || n.includes('rathayatra') || n.includes('return of ratha')) return 'ratha yatra';
    if (n.includes('radhastami') || n.includes('radhasthami') || n.includes('appearance of srimati radharani')) return 'radhastami';
    if (n.includes('govardhan') || n.includes('govardhana puja') || n.includes('go puja') || n.includes('go-krda')) return 'govardhan puja';
    if (n.includes('gopastami') || n.includes('gosthastami')) return 'gopastami';
    if (n.includes('dipavali') || n.includes('dipa dana') || n.includes('dipawali')) return 'dipavali';
    if (n.includes('guru purnima') || n.includes('vyasa purnima') || n.includes('guru (vyasa)')) return 'guru purnima';
    if (n.includes('snana yatra')) return 'snana yatra';
    if (n.includes('panihati') || n.includes('cida dahi')) return 'panihati';
    if (n.includes('jhulan yatra') || n.includes('jhulan')) return 'jhulan yatra';
    if (n.includes('nandotsava')) return 'nandotsava';
    if (n.includes('lord balarama') || n.includes('balarama purnima') || n.includes('appearance day of lord balar')) return 'lord balarama';
    if (n.includes('vamana') || n.includes('trivikrama')) return 'vamana';
    if (n.includes('ananta caturdasi')) return 'ananta caturdasi';
    if (n.includes('caturmasya') || n.includes('caturmasya begins') || n.includes('caturmasya ends')) return 'caturmasya';
    if (n.includes('nityananda trayodasi')) return 'nityananda trayodasi';
    if (n.includes('rama navami') || n.includes('ramacandra vijayotsava') || n.includes('ramacandra')) return 'rama navami';
    if (n.includes('ganga puja')) return 'ganga puja';
    if (n.includes('jagaddhatri')) return 'jagaddhatri puja';
    if (n.includes('bhisma pancaka') || n.includes('bhishma panchaka') || n.includes('vishnu panchaka')) return 'bhisma pancaka';
    if (n.includes('saradiya rasayatra') || n.includes('rasayatra')) return 'saradiya rasayatra';
    if (n.includes('tulasi-saligram') || n.includes('tulasi saligram') || n.includes('tulasi vivaha')) return 'tulasi-saligram vivaha';
    if (n.includes('katyayani vrata') || n.includes('katyayani')) return 'katyayani vrata';
    return null;
}

function getFestivalCategory(name: string): 'appearance' | 'disappearance' | 'ekadasi' | 'festival' | 'other' {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('appearance')) return 'appearance';
    if (lowerName.includes('disappearance')) return 'disappearance';
    if (lowerName.includes('ekadasi') || lowerName.includes('ekādaśī') || lowerName.includes('ekadashi')) return 'ekadasi';
    if (lowerName.includes('janmashtami') || lowerName.includes('diwali') || lowerName.includes('holi') ||
        lowerName.includes('ratha') || lowerName.includes('gaura purnima') || lowerName.includes('rama navami') ||
        lowerName.includes('radhastami') || lowerName.includes('govardhan') || lowerName.includes('jhulan') ||
        lowerName.includes('balarama') || lowerName.includes('panihati') || lowerName.includes('snana') ||
        lowerName.includes('nandotsava') || lowerName.includes('dipavali') || lowerName.includes('dipa dana') ||
        lowerName.includes('gopastami') || lowerName.includes('govardhana')) return 'festival';
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

    const suggestedBhajans = festivalDetails?.bhajans || acharya?.bhajans || null;
    const observances = festival.observances || festivalDetails?.observances || acharya?.observances || null;

    const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const festivalDate = new Date(festival.date + 'T00:00:00');
    const formattedDate = festivalDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: userTimezone
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = festivalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Hero Header */}
            <div className={`bg-gradient-to-br ${getCategoryGradient(category)} text-white`}>
                <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation('/calendar')}
                        className="text-white/90 hover:text-white hover:bg-white/10 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Calendar
                    </Button>

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
                                    {diffDays === 0 ? 'Today!' :
                                        diffDays === 1 ? 'Tomorrow' :
                                            diffDays < 0 ? `${Math.abs(diffDays)} days ago` :
                                                `${diffDays} days remaining`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* How to Observe */}
                {observances && observances.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Heart className="w-5 h-5 text-rose-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">How to Observe</h2>
                        </div>
                        <ul className="space-y-2">
                            {observances.map((observance, i) => (
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

                {/* Suggested Bhajans */}
                {suggestedBhajans && suggestedBhajans.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Music className="w-5 h-5 text-rose-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Suggested Bhajans</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestedBhajans.map((bhajan, i) => (
                                <button
                                    key={i}
                                    onClick={() => setLocation(`/songs?search=${encodeURIComponent(bhajan)}`)}
                                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-full text-sm font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer transition-colors"
                                >
                                    {bhajan}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        onClick={() => setLocation('/tracker')}
                    >
                        <Star className="w-4 h-4 mr-2" />
                        Track Today's Sādhana
                    </Button>
                </div>
            </main>
        </div>
    );
}
