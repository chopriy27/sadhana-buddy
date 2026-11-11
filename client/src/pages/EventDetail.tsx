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
    description?: string;
}> = {
    'srila prabhupada': {
        observances: ["Fast until noon"],
        bhajans: ['Yadi Prabhupada Na Hoito', 'Boro Krpa Koile Krsna', 'Sri Guru Carana Padma', 'Ohe Vaisnava Thakura', 'Je Anilo Prema Dhana Koruna Pracura'],
        description: "Srila Prabhupada (1896–1977) was the Founder-Acharya of the International Society for Krishna Consciousness (ISKCON). Carrying out the instruction of his spiritual master, Srila Bhaktisiddhanta Sarasvati Thakura, he traveled to the West aboard the Jaladutta in 1965 and founded ISKCON in New York in 1966. Over eleven years, he established 108 Radha-Krishna temples globally, published extensive English translations and purports of sacred Vedic texts such as the Srimad-Bhagavatam and Bhagavad-gita, introduced Jagannatha Ratha-yatra worldwide, and initiated thousands of disciples before passing into eternal pastimes in Vrindavana."
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
        bhajans: ['Namo Gaura-Kisoraya', 'Gaurangera Duti Pada', 'Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura'],
        description: "Srila Gaura Kisora Dasa Babaji Maharaja was an exalted paramahamsa babaji (Bhajananandi) in the Gaudiya disciplic succession. A disciple of Bhagavata Dasa Babaji and close associate of Srila Bhaktivinoda Thakura, he exemplified unmatched renunciation, detachment (nirapeksa), and humility. He wore discarded cloth from corpses on the Ganges, ate begged rice soaked in river water garnished with salt and chili, and slept under trees or overturned boats. In 1900, he accepted Srila Bhaktisiddhanta Sarasvati Thakura as his only initiated disciple. He passed into eternal pastimes on Utthana Ekadasi in 1915."
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
        bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Madana Mohana Tanu Gauranga Sundara', 'Gaurangera Duti Pada'],
        description: "An intimate associate of Lord Chaitanya Mahaprabhu from Srikhanda who regularly served Mahaprabhu by fanning Him with a camara whisk and composed sweet Bengali devotional songs glorifying Sri Gauranga's pastimes."
    },
    'vasudeva ghosh': {
        bhajans: ['Agam Agocara Gora', 'Akhil Gauranga Tumi More Doya Na', 'Gora Guna Gao Suni', 'Jaya Jaya Jagannatha Sacira Nandan', 'Jaya Jaya Kala Raba Nadiya Nagare', 'Madana Mohana Mani Gauranga Badana Khani', 'Niravadi Mora Mane Sacira Aginaya Nace', 'Sonari Puraba Lila', 'Yadi Gaura Na Hoito'],
        description: "Sri Vasudeva Ghosh was an intimate associate of Lord Caitanya Mahaprabhu and, in Vraja-lila, the Sakhi named Guntinga. Known for his sweet sankirtana alongside his brothers Govinda and Madhava Ghosh, his singing was so moving that even wood and stone would melt, inspiring Lord Nityananda to dance. He eventually resided in Tamluk, where a unique Deity of Mahaprabhu giving blessings is worshiped."
    },
    'srinivasa acharya': {
        bhajans: ['Krsnotkirtana Gana Nartana Parau', 'Je Anilo Prema Dhana Koruna Pracura', 'Sri Guru Carana Padma'],
        description: "Sri Srinivasa Acharya Thakur was an associate of Lord Chaitanya Mahaprabhu and an embodiment of Gaura-shakti (the divine energy of Lord Chaitanya). His birth was foretold by Lord Chaitanya Himself to his parents, Chaitanya Dasa and his wife, during their pilgrimage to Jagannatha Puri. He received initiation (diksha) from Gopala Bhatta Goswami and mastered Gaudiya philosophy under Srila Jiva Goswami at the Radha-Damodara temple in Vrindavan, earning the title \"Acharya\". Alongside Narottama Dasa Thakura and Shyamananda Prabhu, he spearheaded the first transcendental book distribution party, transporting bullock carts of the Goswamis' writings from Vrindavana across Bengal and Orissa. He converted King Bir Hambir to Vaishnavism and introduced a specialized style of kirtana."
    },
    'syamananda prabhu': {
        bhajans: ['Radhe Jaya Jaya Madhava Dayite']
    },
    'rasikananda prabhu': {
        bhajans: ['Ohe Vaisnava Thakura'],
        description: "Sri Rasikananda Deva (Rasika Murari) appeared in Rohini around 1590 AD as the son of King Acyuta Deva and Queen Bhavani. As the foremost disciple of Sri Syamananda Prabhu, he spent sixteen years preaching the message of Sri Gaura-Nityananda across Bengal and Orissa, transforming kings, robbers, tigers, and even a ferocious wild elephant into devotees of Krishna. He entered into his eternal pastimes by taking shelter at the lotus feet of Kshira-chora Gopinatha in Remuna."
    },
    'gadadhara dasa goswami': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura', 'Thakura Vaisnava Pada'],
        description: "Sri Gadadhara Dasa Goswami is considered a united expansion of Candrakanti gopi (an expansion of Srimati Radharani's effulgence) and Purnananda (an expansion of Lord Balarama's girlfriend). He was an intimate associate of Lord Chaitanya Mahaprabhu and Lord Nityananda who actively spread kirtana and Krishna consciousness across Bengal."
    },
    'dhananjaya pandita': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Vrndavana Vasi Jata Vaisnavera Gana'],
        description: "Sri Dhananjaya Pandita participated extensively in Lord Chaitanya's sankirtana pastimes in Navadvipa. Under the direct order of Lord Chaitanya, he traveled widely to preach Krishna consciousness."
    },
    'bhugarbha goswami': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura', 'Vrndavana Vasi Jata Vaisnavera Gana'],
        description: "Sri Bhugarbha Goswami: Along with his close friend Lokanatha Goswami, he located lost sacred places in Vrindavan under the direct order of Lord Chaitanya Mahaprabhu."
    },
    'kasisvara pandita': {
        bhajans: ['Je Anilo Prema Dhana Koruna Pracura', 'Ohe Vaisnava Thakura', 'Vrndavana Vasi Jata Vaisnavera Gana'],
        description: "Sri Kasisvara Pandita: Served as Lord Chaitanya's bodyguard in Jagannatha Puri and distributed prasadam following kirtana."
    },
    'nimbarkacharya': {
        bhajans: ['Hari Haraye Namah Krsna Yadavaya Namah', 'Isvara Parama Krsna'],
        description: "Marks the appearance of Sri Nimbarkacharya, the principal Acharya of the Kumara Sampradaya (one of the four orthodox line of Vaishnava teachers). He preached Krishna consciousness and propounded the Dvaitadvaita (qualified dualistic) philosophy centered on Radha-Krishna worship approximately 300 years before Lord Chaitanya."
    },
    'kaliya krsnadasa': {
        bhajans: ['Nitai Pada Kamala', 'Nitai Guna Mani', 'Je Anilo Prema Dhana Koruna Pracura'],
        description: "Marks the disappearance of Sri Kaliya Krsnadasa, a prominent disciple of Gauridasa Pandita and intimate associate of Lord Nityananda Prabhu and Lord Chaitanya."
    }
};

const festivalInfo: Record<string, {
    observances?: string[];
    bhajans?: string[];
    description?: string;
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
        bhajans: ['Krsna Pasadena Samasta Saila', 'Nija Pati Bhuja'],
        description: "Govardhana Puja (Annakuta) commemorates Lord Krishna instructing the cowherd men of Vrindavana to stop their traditional sacrifice to King Indra and instead worship Govardhana Hill, local brahmanas, and the cows. In response to Indra's anger and devastating rainstorms, Lord Krishna lifted Govardhana Hill on the little finger of His left hand for seven days to shelter all the residents and animals of Vrindavana, humbling Indra's pride. Go Puja highlights the sacred principle of cow protection, acknowledging cows and bulls as the mother and father of human society."
    },
    'gopastami': {
        bhajans: ['Bhaja Bhakata Vatsala', 'Nija Pati Bhuja', 'Yasomati Nandana', 'Vande Krsna Nanda Kumara'],
        description: "Gopashtami (or Gosthastami) occurs on the eighth lunar day (Ashtami) of the bright fortnight (Shukla Paksha) of the month of Kartik. It is a coming-of-age celebration marking the day Nanda Maharaja gave Lord Krishna full responsibility for grazing the adult cows of Vrindavan. Prior to this day, Krishna was a tender of calves (vatsapa), but upon entering the age of pauganda (sixth to tenth year), He officially became a qualified cowherd boy (gopa). Lord Krishna walked barefoot through the pastures of Vrindavan on this day to bless and purify the earth with His lotus footprints. Devotees observe Go-Puja by visiting cow shelters (gosalas), bathing, cleaning, and decorating cows with cloth and jewelry, feeding them special fodder, and performing circumambulations (pradakshina)."
    },
    'dipavali': {
        bhajans: ['Rajat Kirita Mani Didhiti', 'Raghavam Karunakaram Muni Sevitam'],
        description: "Dipavali (Dipa-dan) is a celebration marking Lord Rama's return from exile to His capital, Ayodhya, following the defeat of the demon Ravana. Although Kali Puja coincides with this time, Gaudiya Vaishnavas do not regularly observe the worship of Durga Devi (Kali)."
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
        bhajans: ['Maha Prasade Govinde', 'Sarira Avidya Jala'],
        description: "Concludes the sacred four-month Chaturmasya period of heightened vows and dietary austerities that began in the month of Ashadha."
    },
    'ganga puja': {
        bhajans: ['Sri Guru Carana Padma']
    },
    'bhisma pancaka': {
        bhajans: ['Namamisvaram Saccidananda Rupam', 'Jaya Radha Madhava', 'Bhaja Bhakata Vatsala'],
        description: "Bhisma Pancaka (or Vishnu Panchaka) comprises the final five sacred days of the Kartik month (Ekadashi to Purnima). It honors Grandfather Bhishma from the Mahabharata, who fasted and meditated on Lord Krishna while lying on a bed of arrows awaiting his departure. Devotees undertake intense vows (Kartik Vrata), daily holy baths, offering tarpana water to Bhishma, and fasting across different levels: Level 1: Consuming Panchagavya (cow products: dung, urine, milk, yogurt, and combined) across the five days. Level 2: Eating fruits and roots while avoiding grains, beans, and seeds. Level 3: Eating simple Havishya khichari prepared with specified ingredients like cow ghee and unpolished rice. Specific daily flower offerings are made to the Lord: lotus flowers to the feet on Day 1, Bilva leaves to the thighs on Day 2, fragrant scents to the navel on Day 3, Java flowers to the shoulders on Day 4, and Malati flowers to the head on Day 5."
    },
    'saradiya rasayatra': {
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana', 'Vrndavana Ramya Sthana', 'Kusumita Vrndavane Nacata Sikhi Gane', 'Radha Kunda Tata Kunja Kutir'],
        description: "Observed on Kartik Purnima (the full moon night of Kartik), this festival commemorates Lord Krishna's divine autumn Rasa-lila dance with Srimati Radharani and the gopis in Vrindavan. It represents the supreme expression of pure, unalloyed conjugal love (parakiya-bhava) and marks the grand conclusion of the holy month of Kartik."
    },
    'tulasi-saligram vivaha': {
        bhajans: ['Namo Namah Tulasi Krsna Preyasi', 'Namo Namah Tulasi Maharani', 'Vrndayai Tulasi-Devyai Priyayai Kesavasya Ca', 'Gangeya Campeya'],
        description: "Tulasi Vivaha is the ceremonial wedding uniting Srimati Tulasi Devi (the personification of Vrinda / Lakshmi) with the Shaligram stone or an Amla branch (personifications of Lord Vishnu/Krishna). Originating from the Puranic history of Vrinda and Jalandhara in the Skanda, Padma, and Shiva Puranas, Lord Vishnu blessed Vrinda to manifest as the sacred Tulasi plant and marry Him as Shaligram on Prabodhini Ekadashi / Kartik Purnima. Devotees build a courtyard altar (Tulasi Vrindavana), drape Tulasi in a sari and fine ornaments, place Shaligram in a dhoti, hold a white curtain (mangal-ashtaka) between them, recite wedding hymns, and perform Kanyadaan."
    },
    'katyayani vrata': {
        bhajans: ['Radhe Jaya Jaya Madhava Dayite', 'Ami Jamuna Puline', 'Srita Kamala'],
        description: "Commemorates the beginning of the month-long vow (Margasirsha) performed by the young unmarried cowherd maidens (gopis) of Vrindavan. They bathed early each morning in the Yamuna and worshiped Goddess Katyayani with incense and flowers, praying to obtain Lord Krishna as their husband. Impressed by their unalloyed devotion, Lord Krishna stole their garments while they bathed, climbed a kadamba tree, and blessed them that their desires would be fulfilled during the upcoming autumn Rasa-lila."
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
    'utthana ekadasi': { bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Ceto Darpana Marjanam', 'Jaya Radha Madhava', 'Vibhavari Sesa'], description: "Also known as Deva Uttana Ekadashi, Hari Prabodhini, or Thulo Ekadashi, this festival falls on the eleventh lunar day of the bright fortnight of Kartik. It marks the end of the four-month Chaturmasya period and signifies the awakening of Lord Vishnu from His cosmic sleep on the serpent Ananta Shesha. The conclusion of Chaturmasya on this day reopens the traditional Hindu wedding season. Devotees observe strict fasting, perform evening puja to Lord Vishnu and Lakshmi with sugarcane offerings, and sing prabhatiya songs urging the Lord to wake." },
    'moksada ekadasi': { bhajans: ['Isvara Parama Krsna', 'Ceto Darpana Marjanam'] },
    'utpanna ekadasi': { bhajans: ['Sri Hari Vasare Hari Kirtana Vidhana', 'Madana Mohana Tanu Gauranga Sundara', 'Gaurangera Duti Pada'], description: "Occurs in the dark fortnight (Krishna Paksha) of the month of Margasirsha. It commemorates the appearance of Ekadashi Devi from the body of Lord Vishnu to defeat and slay the demon Mura, who had conquered the demigods." },
    'parama ekadasi': { bhajans: ['Maha Prasade Govinde'] },
    'jagaddhatri puja': { bhajans: ['Hari Haraye Namah Krsna Yadavaya Namah'], description: "Dedicated to Jagaddhatri, a form of Mahamaya referred to as \"the maintainer of the material world\". Although noted on the traditional calendar, Gaudiya Vaishnavas do not usually observe this festival." },
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
    const observances = festivalDetails?.observances || acharya?.observances || null;
    const description = festivalDetails?.description || acharya?.description || null;

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
                {/* Description */}
                {description && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                    </div>
                )}

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
