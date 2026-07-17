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
    title: string;
    bio: string;
    teachings: string[];
    famousWorks: string[];
    bhajans?: string[];
}> = {
    'srila prabhupada': {
        title: 'Founder-Ācārya of ISKCON',
        bio: 'His Divine Grace A.C. Bhaktivedanta Swami Prabhupāda (1896–1977) was the Founder-Ācārya of the International Society for Kṛṣṇa Consciousness (ISKCON). He translated and commented on over 80 volumes of the Vedic scriptures, including Bhagavad-gītā As It Is and Śrīmad-Bhāgavatam. He circled the globe 14 times, established 108 temples, and initiated approximately 5,000 disciples.',
        teachings: [
            'Chant Hare Kṛṣṇa and be happy',
            'Kṛṣṇa consciousness is the original consciousness',
            'Back to Godhead — our original home',
            'Human life is meant for self-realization'
        ],
        famousWorks: [
            'Bhagavad-gītā As It Is',
            'Śrīmad-Bhāgavatam',
            'Caitanya-caritāmṛta',
            'The Nectar of Devotion'
        ],
        bhajans: ['Boro Krpa Koile Krsna', 'Krsna Tava Punya Habe Bhai', 'Sri Guru Carana Padma']
    },
    'bhaktivinoda thakura': {
        title: 'Pioneer of Kṛṣṇa Consciousness in the Modern Age',
        bio: 'Śrīla Bhaktivinoda Ṭhākura (1838–1914) was a great Vaiṣṇava ācārya who revived the teachings of Śrī Caitanya Mahāprabhu. He was a prolific writer, composing hundreds of books, songs, and articles. He discovered the birthplace of Lord Caitanya in Māyāpur and predicted that devotees from all over the world would come together to chant the holy names.',
        teachings: [
            'The holy name is the essence of all spiritual practices',
            'Devotional service is the highest perfection',
            'Śrī Caitanya\'s teachings are for all humanity',
            'Pure devotion transcends all material designations'
        ],
        famousWorks: [
            'Jaiva Dharma',
            'Śrī Caitanya Śikṣāmṛta',
            'Harināma Cintāmaṇi',
            'Gītāvalī and Kalyāṇakalpataru'
        ],
        bhajans: ['Jiv Jago Jiv Jago', 'Amar Jivana', 'Udilo Aruna Puraba Bhage']
    },
    'narottama dasa thakura': {
        title: 'Treasure of Devotional Songs',
        bio: 'Śrīla Narottama dāsa Ṭhākura was one of the most important ācāryas in the Gauḍīya Vaiṣṇava tradition. Born in the 16th century, he was a direct disciple of Śrīla Lokanātha Goswami. His devotional songs are sung daily in temples around the world and are considered the standard for expressing devotional sentiments.',
        teachings: [
            'Association of devotees is essential',
            'The dust of Vṛndāvan is most sacred',
            'Six Goswamis are our guiding lights',
            'Love of God is the ultimate goal'
        ],
        famousWorks: [
            'Prārthanā',
            'Prema-bhakti-candrikā',
            'Numerous devotional songs'
        ],
        bhajans: ['Nitai Pada Kamala', 'Radha Krsna Prana Mora', 'Vrndavana Ramya Sthana']
    },
    'jiva goswami': {
        title: 'Greatest Philosopher of Gauḍīya Vaiṣṇavism',
        bio: 'Śrīla Jīva Goswami (1513–1598) was the nephew of Śrīla Rūpa Goswami and Sanātana Goswami. He is considered the greatest philosopher and theologian in the Gauḍīya Vaiṣṇava tradition. He established the philosophical foundation of acintya-bhedābheda-tattva through his Six Sandarbhas.',
        teachings: [
            'Acintya-bhedābheda — inconceivable oneness and difference',
            'Sambandha, abhidheya, and prayojana',
            'Kṛṣṇa is the Supreme Personality of Godhead',
            'Devotional service is the means and the end'
        ],
        famousWorks: [
            'Ṣaṭ-sandarbha (Six Sandarbhas)',
            'Gopāla-campū',
            'Commentaries on Bhakti-rasāmṛta-sindhu'
        ],
        bhajans: ['Krsna Prema Mayi Radha', 'Jaya Radhe Jaya Krsna Jaya Vrndavana']
    },
    'rupa goswami': {
        title: 'Chief of the Six Goswamis',
        bio: 'Śrīla Rūpa Goswami was the leader of the Six Goswamis of Vṛndāvan, directly empowered by Śrī Caitanya Mahāprabhu to establish the science of devotional service. His writings form the foundation of Gauḍīya Vaiṣṇava philosophy and practice.',
        teachings: [
            'Bhakti-rasāmṛta-sindhu — the ocean of devotional nectar',
            'Vaidhī and rāgānugā bhakti',
            'The science of rasa (spiritual relationships)',
            'Ujjvala-nīlamaṇi — conjugal love of God'
        ],
        famousWorks: [
            'Bhakti-rasāmṛta-sindhu',
            'Ujjvala-nīlamaṇi',
            'Laghu-bhāgavatāmṛta',
            'Vidagdha-mādhava and Lalita-mādhava (dramas)'
        ],
        bhajans: ['Radhe Jaya Jaya Madhava Dayite', 'Krsna Deva Bhavantam Vande', 'Sri Rupa Manjari Pada']
    },
    'sanatana goswami': {
        title: 'Elder of the Six Goswamis',
        bio: 'Śrīla Sanātana Goswami was the elder brother of Rūpa Goswami and one of the most important figures in establishing Gauḍīya Vaiṣṇavism. Śrī Caitanya Mahāprabhu personally instructed him for two months, teaching the essence of devotional service.',
        teachings: [
            'Hari-bhakti-vilāsa — the standards of devotional practice',
            'Bṛhad-bhāgavatāmṛta — the gradations of devotees',
            'Serving the Deity is essential',
            'Following the previous ācāryas'
        ],
        famousWorks: [
            'Bṛhad-bhāgavatāmṛta',
            'Hari-bhakti-vilāsa',
            'Commentaries on Śrīmad-Bhāgavatam'
        ],
        bhajans: ['Vrndavana Ramya Sthana', 'Jaya Radhe Jaya Krsna Jaya Vrndavana']
    },
    'bhaktisiddhanta sarasvati thakura': {
        title: 'Founder of Gauḍīya Maṭha and Guru of Śrīla Prabhupāda',
        bio: 'Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura (1874–1936) was the son of Śrīla Bhaktivinoda Ṭhākura and the spiritual master of Śrīla Prabhupāda. He established the Gauḍīya Maṭha institution with 64 temples worldwide, vigorously preached Kṛṣṇa consciousness in a modern context, and initiated over 5,000 disciples. He emphasized printing and distributing Vaiṣṇava literature as the primary preaching tool.',
        teachings: [
            'Preaching is more important than personal renunciation',
            'Books are the basis of the spiritual movement',
            'Serve the spiritual master and spread the holy name',
            'Kṛṣṇa consciousness can be shared with everyone'
        ],
        famousWorks: [
            'Anubhāṣya (commentary on Caitanya-caritāmṛta)',
            'Brāhmaṇa O Vaiṣṇava',
            'Vaiṣṇavism and Nām-Bhajan',
            'Numerous editorials in Gauḍīya magazine'
        ],
        bhajans: ['Dusta Mana', 'Krsna Hoite Caturmukha', 'Sri Guru Carana Padma']
    },
    'gopala bhatta goswami': {
        title: 'Establisher of Vaiṣṇava Deity Worship Standards',
        bio: 'Śrīla Gopāla Bhaṭṭa Goswami (1503–1578) was one of the Six Goswamis of Vṛndāvan. Born in a South Indian brāhmaṇa family in Śrīraṅgam, he received the direct mercy of Śrī Caitanya Mahāprabhu. He established the standards of Deity worship in the Gauḍīya Vaiṣṇava tradition and compiled the Hari-bhakti-vilāsa together with Sanātana Goswami.',
        teachings: [
            'Proper Deity worship according to pāñcarātrika regulations',
            'Service to the Deities is non-different from direct service to the Lord',
            'Following Vaiṣṇava etiquette is essential',
            'Devotional service purifies the heart'
        ],
        famousWorks: [
            'Hari-bhakti-vilāsa (co-authored with Sanātana Goswami)',
            'Sat-kriyā-sāra-dīpikā',
            'Vaiṣṇava-toṣaṇī (partial commentary on Śrīmad-Bhāgavatam)'
        ],
        bhajans: ['Sri Guru Carana Padma', 'Suddha Bhakata Carana Renu']
    },
    'lokanatha goswami': {
        title: 'Renunciant Goswami of Vṛndāvan',
        bio: 'Śrīla Lokanātha Goswami was one of the Six Goswamis of Vṛndāvan. He traveled with Bhugarbha Goswami from Bengal to Vṛndāvan upon the instruction of Śrī Caitanya Mahāprabhu. Known for his extreme renunciation, he avoided contact with women so strictly that even Narottama dāsa Ṭhākura had to receive initiation by a roundabout method.',
        teachings: [
            'Renunciation as the foundation of devotional life',
            'Living simply in the holy dhāma',
            'Following the principles of the previous ācāryas',
            'Dedication to the service of Rādhā and Kṛṣṇa'
        ],
        famousWorks: [
            'Vṛndāvana Mahimāmṛta',
            'Various verses on Vṛndāvan'
        ],
        bhajans: ['Vrndavana Ramya Sthana', 'Radha Krsna Bol Bol']
    },
    'raghunatha dasa goswami': {
        title: 'Exemplar of Renunciation Among the Six Goswamis',
        bio: 'Śrīla Raghunātha dāsa Goswami (1494–1586) was one of the Six Goswamis of Vṛndāvan. Despite being the son of a wealthy zamīndār, he renounced everything to join Śrī Caitanya Mahāprabhu at Purī. After the Lord\'s departure, he went to Vṛndāvan, weeping in separation, subsisting on buttermilk, and ultimately revealing the site of Rādhā Kuṇḍa.',
        teachings: [
            'Intense renunciation in the service of the Lord',
            'Remembering the Lord in separation intensifies love',
            'Rādhā Kuṇḍa is the highest place of pilgrimage',
            'Follow the six Goswamis as the path to perfection'
        ],
        famousWorks: [
            'Vilāpa-kusumāñjali',
            'Stavāvalī (collection of prayers)',
            'Mukta-carita',
            'Dāna-carita'
        ],
        bhajans: ['Radha Kunda Tata Kunja Kutir', 'Gurau Gosthe Gosthalayisu', 'Vrndavana Ramya Sthana']
    },
    'raghunatha bhatta goswami': {
        title: 'Reciter of Śrīmad-Bhāgavatam Among the Six Goswamis',
        bio: 'Śrīla Raghunātha Bhaṭṭa Goswami (1505–1579) was one of the Six Goswamis of Vṛndāvan. He received the direct mercy of Śrī Caitanya Mahāprabhu and served Him personally in Purī. He never accepted a disciple or commented on scripture, but his beautiful recitation of Śrīmad-Bhāgavatam enchanted all who heard it. He established the Govindajī temple in Vṛndāvan.',
        teachings: [
            'Śrīmad-Bhāgavatam is the ripened fruit of the Vedic tree',
            'Service through sacred sound vibration purifies',
            'Simplicity and devotion are more powerful than scholarship',
            'The beauty of devotional recitation draws the Lord\'s mercy'
        ],
        famousWorks: [
            'Established and served at Govindajī temple in Vṛndāvan',
            'Known for his beautiful recitation rather than written works'
        ],
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana', 'Krsna Krsna Krsna Krsna']
    },
    'krsnadasa kaviraja goswami': {
        title: 'Author of Śrī Caitanya-caritāmṛta',
        bio: 'Śrīla Kṛṣṇadāsa Kavirāja Goswami (c. 1530–1616) was a great Vaiṣṇava author who composed the Śrī Caitanya-caritāmṛta at an advanced age, following the direct instruction of the Madana-Mohana Deity of Vṛndāvan. This work is considered the post-graduate study of spiritual life and the most complete biography of Śrī Caitanya Mahāprabhu.',
        teachings: [
            'The teachings of Caitanya Mahāprabhu are the highest philosophy',
            'Acintya-bhedābheda is the perfect understanding of reality',
            'The mercy of the guru is the essential factor',
            'Love of Rādhā and Kṛṣṇa is the highest attainment'
        ],
        famousWorks: [
            'Śrī Caitanya-caritāmṛta',
            'Govinda-līlāmṛta'
        ],
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana', 'Jaya Radha Giri Vara Dhari', 'Krsna Krsna Krsna Krsna']
    },
    'haridasa thakura': {
        title: 'Nāmācārya — The Ideal Chanter of the Holy Name',
        bio: 'Śrīla Haridāsa Ṭhākura (1451–1515) was personally chosen by Śrī Caitanya Mahāprabhu as the "Nāmācārya" — the ideal teacher of the holy name. Born in a Muslim family, he was accepted as a Vaiṣṇava by the Lord Himself due to his unparalleled devotion. He chanted 300,000 names of the Lord daily and departed from this world in the arms of Śrī Caitanya Mahāprabhu.',
        teachings: [
            'The holy name must be chanted with humility and full attention',
            'Nāma-aparādha (offenses to the name) are the greatest obstacle',
            'The name is transcendental and non-different from the Lord',
            'Even quiet chanting brings spiritual benefit to all nearby'
        ],
        famousWorks: [
            'His life and teachings are recorded in Caitanya-caritāmṛta',
            'His life itself is the teaching'
        ],
        bhajans: ['Bolo Hari Bolo', 'Ceto Darpana Marjanam', 'Hari Bolo Hari Bolo Hari Bolo Bhai Re']
    },
    'baladeva vidyabhusana': {
        title: 'Establisher of Gauḍīya Sampradāya\'s Scriptural Authority',
        bio: 'Śrīla Baladeva Vidyābhūṣaṇa (18th century) was a great Vaiṣṇava philosopher who wrote the Govinda-bhāṣya commentary on the Vedānta-sūtra, thereby establishing that the Gauḍīya Vaiṣṇava sampradāya has its own authentic commentary on Vedānta. He was a prolific writer who produced many important philosophical works.',
        teachings: [
            'Gauḍīya Vaiṣṇavism has complete philosophical grounding in Vedānta',
            'Govinda is the Supreme Lord established by all scripture',
            'Devotional service is the ultimate conclusion of Vedic philosophy',
            'The guru-disciple succession is the authoritative chain of knowledge'
        ],
        famousWorks: [
            'Govinda-bhāṣya (Vedānta commentary)',
            'Siddhānta-ratna',
            'Sāhitya-kaumudī',
            'Vedānta-syāmantaka'
        ],
        bhajans: ['Isvara Parama Krsna', 'Krsna Hoite Caturmukha']
    },
    'gadadhara pandita': {
        title: 'Śakti of Śrī Caitanya Mahāprabhu',
        bio: 'Śrī Gadādhara Paṇḍita was one of the Pañcatattva — the five members of the Lord\'s eternal associates. He is considered to be the internal energy (hlādinī-śakti) of the Lord, identified with Śrīmatī Rādhārāṇī. He spent his later years at Purī in the service of Lord Jagannātha and was the recipient of Śrīmad-Bhāgavatam recitation from Caitanya Mahāprabhu Himself.',
        teachings: [
            'Pure devotion expressed through service to the Lord',
            'The highest form of love is that of Rādhārāṇī',
            'Association with the Lord in His pastimes is the highest benediction',
            'Tolerance and humility are the ornaments of a Vaiṣṇava'
        ],
        famousWorks: [
            'His life is documented in Caitanya-caritāmṛta and Caitanya-bhāgavata'
        ],
        bhajans: ['Gaurangera Duti Pada', 'Bhale Gaura Gadadharer Arati', 'Jaya Jaya Goracander Arotik']
    },
    'srivasa pandita': {
        title: 'Associate of the Pañcatattva',
        bio: 'Śrī Śrīvāsa Paṇḍita was one of the intimate associates of Śrī Caitanya Mahāprabhu and one of the Pañcatattva. His home in Māyāpur, known as Śrīvāsa Aṅgam, was the site of the first secret nightly saṅkīrtana movement organized by Caitanya Mahāprabhu. His entire household was devoted to the Lord.',
        teachings: [
            'The home can be a center of devotional practice',
            'Saṅkīrtana is the yuga-dharma of this age',
            'Service to devotees is as important as service to the Lord',
            'Pure devotion transcends all social boundaries'
        ],
        famousWorks: [
            'His service is documented in Caitanya-caritāmṛta'
        ],
        bhajans: ['Jaya Jaya Sri Krsna Caitanya Nityananda', 'Doyal Nitai Caitanya']
    },
    'nityananda prabhu': {
        title: 'Ādi-Guru — The Supremely Merciful Associate of Lord Caitanya',
        bio: 'Śrī Nityānanda Prabhu is the avatāra of Lord Balarāma who appeared as the most intimate associate of Śrī Caitanya Mahāprabhu. He is especially known for His unlimited mercy, distributing divine love freely to all without consideration of qualification. He is regarded as the Ādi-Guru, the original spiritual master, and is particularly worshipped in Bengal.',
        teachings: [
            'Divine mercy is freely available to all',
            'The spiritual master delivers the fallen souls',
            'Association of devotees is the means of elevation',
            'Serve the devotees to receive the mercy of the Lord'
        ],
        famousWorks: [
            'His pastimes are documented in Caitanya-caritāmṛta and Caitanya-bhāgavata'
        ],
        bhajans: ['Nitai Pada Kamala', 'Dhana Mor Nityananda', 'Parama Karuna Pahu Dui Jana', 'Akrodha Paramananda']
    },
    'gaura kisora dasa babaji': {
        title: 'Paramahaṁsa Saint and Guru of Bhaktisiddhānta',
        bio: 'Śrīla Gaura Kiśora dāsa Bābājī Mahārāja (1838–1915) was a renowned Vaiṣṇava saint and the spiritual master of Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura. He lived in Navadvīpa and Vṛndāvan as a bābājī (renunciant), known for his pure devotion, complete detachment from material life, and his direct realizations of transcendental love.',
        teachings: [
            'Pure devotion requires complete detachment from material concerns',
            'The holy dhāma reveals itself to sincere seekers',
            'Internal realization is more important than external show',
            'Bhakti comes through the grace of the Vaiṣṇava'
        ],
        famousWorks: [
            'Teachings preserved through Bhaktisiddhānta\'s writings'
        ],
        bhajans: ['Gurudeva Krpa Bindu Diya', 'Sri Guru Carana Padma']
    },
    'narahari sarakara thakura': {
        title: 'Intimate Associate of Śrī Caitanya Mahāprabhu',
        bio: 'Śrī Narahari Sārakāra Ṭhākura was one of the closest associates of Śrī Caitanya Mahāprabhu in Navadvīpa and Śrīkhaṇḍa. He was known for his deep love for the Lord and his beautiful bhajans. He was the spiritual master of Locanā dāsa Ṭhākura, who wrote the famous Caitanya-maṅgala.',
        teachings: [
            'Personal service to the Lord is the highest engagement',
            'Devotional songs carry the Lord\'s mercy',
            'Association of pure devotees transforms the heart',
            'Kṛṣṇa is present in His holy name and His devotees'
        ],
        famousWorks: [
            'Several bhajans and devotional songs',
            'Teachings preserved in Caitanya-maṅgala'
        ],
        bhajans: ['Jiv Jago Jiv Jago', 'Sri Krsna Caitanya Prabhu Jive Doya Kori']
    },
    'vasudeva ghosh': {
        title: 'Singer and Associate of Nityānanda Prabhu',
        bio: 'Śrī Vāsudeva Ghoṣa was an associate of Śrī Caitanya Mahāprabhu and a companion of Nityānanda Prabhu. He was a wonderful singer of devotional songs. His compositions, including the famous "Yadi Gaura Na Hoito," are still sung in Bengal today and reflect his pure love for Gaura-Nitāi.',
        teachings: [
            'Devotional singing carries spiritual potency',
            'The mercy of Gaura and Nitāi is unlimited',
            'Association of the Lord\'s devotees is most valuable',
            'Singing the glories of the Lord purifies the heart'
        ],
        famousWorks: [
            'Gaurāṅga Tumi More Doyā Nā Chāḍiho',
            'Jaya Jaya Jagannātha Sacīra',
            'Yadi Gaura Nā Hoito'
        ],
        bhajans: ['Gauranga Tumi More Doya Na Chadiho', 'Jaya Jaya Jagannatha Sacira', 'Yadi Gaura Na Hoito']
    },
    'srinivasa acharya': {
        title: 'Preacher of Gauḍīya Vaiṣṇavism in Oḍisha and Bengal',
        bio: 'Śrīla Śrīnivāsa Ācārya was one of the most important preachers of Gauḍīya Vaiṣṇavism after the generation of the Six Goswamis. He retrieved the books of the Six Goswamis when they were stolen during a journey from Vṛndāvan to Bengal, and this dramatic event resulted in the conversion of the thief king. He established many devotees throughout Oḍisha and Bengal.',
        teachings: [
            'The books of the Six Goswamis are the life of the movement',
            'Preaching the glories of the Lord transforms even enemies',
            'Persistence in devotional service overcomes all obstacles',
            'The Lord protects His devotees and their mission'
        ],
        famousWorks: [
            'Kṛṣṇotkīrtana Gāna Nartana Parau',
            'Teachings documented in Bhakti-ratnākara'
        ],
        bhajans: ['Krsnotkirtana Gana Nartana Parau', 'Je Anilo Prema Dhana Koruna Pracura']
    },
    'syamananda prabhu': {
        title: 'Preacher of Gauḍīya Vaiṣṇavism in Oḍisha',
        bio: 'Śrī Śyāmānanda Prabhu was an intimate disciple of Śrīla Hṛdaya Caitanya and later of Jīva Goswami. He received the special mercy of Śrīmatī Rādhārāṇī in Vṛndāvan. He preached Gauḍīya Vaiṣṇavism extensively throughout Oḍisha and established many devotees.',
        teachings: [
            'The mercy of Śrīmatī Rādhārāṇī is the highest attainment',
            'Preaching the holy name reaches every corner of the world',
            'Devotional service transforms society',
            'Follow the path of the Six Goswamis'
        ],
        famousWorks: [
            'Teachings preserved in Bhakti-ratnākara'
        ],
        bhajans: ['Radhe Jaya Jaya Madhava Dayite', 'Radha Krsna Bol Bol']
    },
    'rasikananda prabhu': {
        title: 'Disciple of Śyāmānanda and Great Preacher',
        bio: 'Śrī Rasikānanda Prabhu was the foremost disciple of Śyāmānanda Prabhu. He is famous for the miracle of converting a wild elephant by singing the holy names. He established many centers of devotion in Oḍisha and Jhārkhaṇḍ and is celebrated for his miraculous preaching.',
        teachings: [
            'The holy name can transform even animals',
            'Pure devotion knows no limits',
            'Surrender to the Lord completely',
            'Preach the glories of the Lord fearlessly'
        ],
        famousWorks: [
            'Śrī Prema-bhakti Candrikā',
            'Multiple devotional compositions'
        ],
        bhajans: ['Radha Krsna Bol Bol', 'Hare Krishna Maha Mantra']
    }
};

const festivalInfo: Record<string, {
    significance: string;
    observances: string[];
    story?: string;
    bhajans?: string[];
}> = {
    'janmashtami': {
        significance: 'The appearance day of Lord Śrī Kṛṣṇa, the Supreme Personality of Godhead, who appeared 5,000 years ago in Mathurā in the prison of Kaṁsa to deliver the world from demonic rule and re-establish dharma.',
        observances: [
            'Fasting until midnight',
            'Elaborate Deity worship and abhiṣeka',
            'Singing devotional songs (kīrtan)',
            'Reading Kṛṣṇa\'s pastimes from Śrīmad-Bhāgavatam',
            'Midnight celebration and prasādam feast'
        ],
        story: 'Lord Kṛṣṇa appeared at midnight in the prison of Kaṁsa to Devakī and Vasudeva. Despite heavy security, Vasudeva carried baby Kṛṣṇa across the Yamunā river to Gokula, where He was raised by Nanda Mahārāja and Yaśodā. The entire universe rejoiced at His appearance.',
        bhajans: ['Nanda Ke Ananda Bhaiyo', 'Yasomati Nandana', 'Jaya Radha Madhava']
    },
    'gaura purnima': {
        significance: 'The appearance day of Śrī Caitanya Mahāprabhu, who is Kṛṣṇa Himself appearing as a devotee to teach the yuga-dharma of chanting the holy names of the Lord for this age of Kali.',
        observances: [
            'Fasting until moonrise',
            'Kīrtan and saṅkīrtan throughout the day',
            'Reading Caitanya-caritāmṛta',
            'Offering special bhoga',
            'Celebrating with prasādam feast at moonrise'
        ],
        story: 'Śrī Caitanya Mahāprabhu appeared on the full moon night of Phālguna in 1486 CE in Māyāpur. His appearance was accompanied by a lunar eclipse, during which everyone spontaneously chanted the holy names.',
        bhajans: ['Gaurangera Duti Pada', 'Jaya Jaya Sri Krsna Caitanya Nityananda', 'Sri Krsna Caitanya Prabhu Jive Doya Kori']
    },
    'ekadasi': {
        significance: 'Ekādaśī is the eleventh day of the lunar fortnight, most dear to Lord Viṣṇu. Observing Ekādaśī purifies the heart and rapidly advances one in devotional service.',
        observances: [
            'Fasting from grains and beans',
            'Increased chanting of the holy names',
            'Reading Vaiṣṇava scriptures',
            'Extra rounds of japa',
            'Staying awake for night kīrtan (optional)'
        ],
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'ratha yatra': {
        significance: 'The annual chariot festival of Lord Jagannātha, celebrated with great joy and enthusiasm throughout the world. Pulling the Lord\'s chariot is said to grant liberation even to those who have never performed any other devotional activity.',
        observances: [
            'Pulling the chariot ropes',
            'Street saṅkīrtan along the route',
            'Distributing prasādam to all',
            'Decorating the chariots with flowers',
            'Offering special bhoga to Lord Jagannātha'
        ],
        story: 'The Ratha Yātrā commemorates Kṛṣṇa\'s return to Vṛndāvan after many years in Dvārakā. The gopīs\' intense love in separation is celebrated as the highest devotional mood. Lord Caitanya Mahāprabhu Himself danced in ecstasy before Lord Jagannātha\'s chariot in Purī every year.',
        bhajans: ['Jaya Jaya Jagannatha Sacira', 'He Govinda He Gopal Kesava Madhava', 'Yadi Gaura Na Hoito']
    },
    'radhastami': {
        significance: 'The appearance day of Śrīmatī Rādhārāṇī, the eternal consort of Lord Kṛṣṇa and the embodiment of His pleasure potency (hlādinī-śakti). Rādhārāṇī is the topmost devotee and the queen of Vṛndāvan. Her love for Kṛṣṇa is the highest expression of devotional service known in any of the universes.',
        observances: [
            'Fasting until noon',
            'Special abhiṣeka (bathing ceremony) of Rādhā-Kṛṣṇa Deities',
            'Decorating Śrīmatī Rādhārāṇī\'s altar with flowers and jewelry',
            'Singing Rādhārāṇī\'s glories (rādhikā-stuti)',
            'Reading from Ujjvala-nīlamaṇi and Brahma-saṁhitā',
            'Offering special bhoga with Rādhārāṇī\'s favourite items',
            'Evening saṅkīrtan and feast at moonrise'
        ],
        story: 'Śrīmatī Rādhārāṇī appeared on the aṣṭamī (eighth day) of the bright lunar fortnight in the month of Bhādra. She did not emerge from a womb but appeared fully formed in a lotus flower in a field near Barsānā. Vṛṣabhānu Mahārāja discovered the Divine Child floating on a lotus in a pond. She is considered the Goddess of all goddesses and the very life and soul of Lord Kṛṣṇa.',
        bhajans: ['Radhe Jaya Jaya Madhava Dayite', 'Jaya Radhe Jaya Radhe Radhe', 'Radha Krsna Bol Bol']
    },
    'govardhan puja': {
        significance: 'Govardhana Pūjā celebrates the day Lord Kṛṣṇa lifted Govardhana Hill to shelter the residents of Vṛndāvan from the devastating rain sent by the pride-stricken Indra. This festival establishes that devotion to the Supreme Lord is superior to ritual worship aimed at material benefits.',
        observances: [
            'Offering an Annakūṭ (mountain of food) to Lord Kṛṣṇa',
            'Circumambulating Govardhana Hill (or a symbolic representation)',
            'Worshipping cows and bulls as manifestations of dharma',
            'Preparing 56 items of bhoga (chappanna bhoga)',
            'Community feasting and prasādam distribution',
            'Reading the Govardhan-līlā from Śrīmad-Bhāgavatam'
        ],
        story: 'When the cowherd community prepared to worship Indra, young Kṛṣṇa convinced them to instead worship Govardhana Hill and the cows. The enraged Indra sent devastating rain. Kṛṣṇa then lifted Govardhana Hill with one finger and held it aloft for seven days as an umbrella, sheltering all the residents and animals of Vṛndāvan.',
        bhajans: ['Jaya Radha Giri Vara Dhari', 'Nanda Ke Ananda Bhaiyo', 'Jaya Radha Madhava']
    },
    'gopastami': {
        significance: 'Gopāṣṭamī marks the day Lord Kṛṣṇa was recognized as a fully qualified cowherd boy and given responsibility for herding the full herd of cows of Vṛndāvan, entering a new level of His eternal cowherd pastimes with the gopas.',
        observances: [
            'Worshipping cows and calves as manifestations of divine abundance',
            'Offering flowers, garlands, and food to cows',
            'Reading about Kṛṣṇa\'s cowherd pastimes from Śrīmad-Bhāgavatam',
            'Celebrating with kīrtan and prasādam',
            'Serving or donating to go-śālā (cow protection projects)'
        ],
        story: 'On the eighth day of the bright fortnight of Kārtika, the cowherd community performed the ceremony elevating Kṛṣṇa and Balarāma from tending calves to tending the full herd of cows. All the residents of Vṛndāvan celebrated this event with great joy.',
        bhajans: ['Yasomati Nandana', 'Nanda Ke Ananda Bhaiyo', 'Jaya Radha Madhava']
    },
    'dipavali': {
        significance: 'In the Vaiṣṇava tradition, Dīpāvalī is observed as the day King Bali Daityarāja was sent to rule the lower planets by Lord Vāmana, and as the day the residents of Ayodhyā welcomed Lord Rāmacandra back after 14 years of exile. It is a festival of light commemorating the victory of devotion over pride.',
        observances: [
            'Lighting dīyas (lamps) to welcome Lord Rāmacandra\'s return',
            'Offering special prayers to Lord Viṣṇu and Lakṣmī Devī',
            'Remembering the pastimes of Lord Vāmana and King Bali',
            'Distribution of prasādam sweets',
            'Evening saṅkīrtan by lamplight'
        ],
        story: 'When Lord Vāmana approached King Bali and requested three steps of land, Bali agreed despite his guru Śukrācārya\'s warning. The Lord expanded to cover the entire universe in two steps. Bali\'s pure devotion was so great that the Lord blessed him and installed him as ruler of the lower planets, promising to stand guard at his door.',
        bhajans: ['Jaya Radha Madhava', 'Bolo Hari Bolo', 'Hare Krishna Maha Mantra']
    },
    'guru purnima': {
        significance: 'Guru Pūrṇimā, also known as Vyāsa Pūrṇimā, is the auspicious full moon day for honouring the paramparā (disciplic succession) and one\'s own spiritual master. This day commemorates the birth of Śrīla Vyāsadeva, the compiler of the Vedic scriptures.',
        observances: [
            'Offering special worship and prayers to one\'s spiritual master',
            'Reciting the praṇāma mantra of the guru',
            'Reading the Guru Gītā and guru-related scriptures',
            'Honoring Vyāsadeva as the original spiritual master',
            'Making spiritual commitments and resolutions',
            'Community worship and pādābhiṣeka (bathing the guru\'s lotus feet)',
            'Distribution of prasādam'
        ],
        bhajans: ['Sri Guru Carana Padma', 'Gurudeva Krpa Bindu Diya', 'Gurudeva! Boro Krpa Kori']
    },
    'snana yatra': {
        significance: 'Snāna Yātrā is the bathing festival of Lord Jagannātha, celebrated 15 days before Ratha Yātrā. On this day Lord Jagannātha, Baladeva, and Subhadrā are brought out and bathed with 108 pots of sacred well water, after which the Lord rests for 15 days (Anavasara) before the chariot festival begins.',
        observances: [
            'Visiting Lord Jagannātha temple for the bathing ceremony',
            'Offering 108 pots of sacred water',
            'Singing kīrtans of Lord Jagannātha',
            'Fasting until the ceremony is complete',
            'Contemplating the Lord\'s universal form and mercy'
        ],
        story: 'On the full moon of Jyeṣṭha, Lord Jagannātha is brought to the bathing platform (snāna-vedī). After the elaborate bathing ceremony, the Lord is said to catch a "fever" due to exposure to the summer heat, and He rests for 14–15 days. During this period devotees intensify their hearing and chanting.',
        bhajans: ['Jaya Jaya Jagannatha Sacira', 'He Govinda He Gopal Kesava Madhava']
    },
    'panihati': {
        significance: 'The Panihāṭi Ciḍā Dahī Utsava (chipped rice and yogurt festival) celebrates the famous pastime of Raghunātha dāsa Goswami\'s initiation by Nityānanda Prabhu on the banks of the Gaṅgā at Panihāṭi. This festival represents the unlimited mercy of Nityānanda Prabhu through devotee community service.',
        observances: [
            'Preparing and distributing chipped rice (ciḍā) with yogurt',
            'Organizing large community feasts',
            'Remembering Nityānanda Prabhu\'s mercy on Raghunātha dāsa',
            'Kīrtan and celebration by the river or water',
            'Distributing prasādam to large numbers of people'
        ],
        story: 'When Raghunātha dāsa wanted to join Śrī Caitanya Mahāprabhu, he approached Nityānanda Prabhu at Panihāṭi. In a playful mood, Nityānanda Prabhu said Raghunātha had offended Him and must hold a feast for all His devotees as punishment. Raghunātha organized a massive feast of chipped rice and yogurt for thousands of devotees. Pleased, Nityānanda Prabhu blessed him, enabling him to eventually join Śrī Caitanya Mahāprabhu in Purī.',
        bhajans: ['Nitai Pada Kamala', 'Parama Karuna Pahu Dui Jana', 'Dhana Mor Nityananda']
    },
    'jhulan yatra': {
        significance: 'Jhulan Yātrā, the swing festival, is a five-day celebration during which Rādhā and Kṛṣṇa are placed on a beautifully decorated swing. This festival celebrates the intimate and joyful pastimes of Rādhā and Kṛṣṇa during the monsoon season in Vṛndāvan.',
        observances: [
            'Decorating the temple with swings and monsoon flowers',
            'Offering fragrant flowers and garlands to Rādhā-Kṛṣṇa',
            'Singing swing songs (jhulan kīrtan)',
            'Processing the Deities to a specially decorated swing maṇḍapa',
            'Devotees taking turns gently pulling the Lord\'s swing',
            'Special bhoga offerings featuring seasonal fruits'
        ],
        story: 'In the writings of the Six Goswamis, the swing pastimes of Rādhā and Kṛṣṇa in the forests of Vṛndāvan during the monsoon are described as particularly intimate and sweet. The sound of kadamba flowers in the rain, the peacock\'s call, and the beautifully decorated swings form the backdrop for these beloved pastimes.',
        bhajans: ['Jaya Radhe Jaya Krsna Jaya Vrndavana', 'Jaya Jaya Radha Krsna', 'Radhe Radhe Syama Sri Radhe']
    },
    'nandotsava': {
        significance: 'Nandotsava is the joyful celebration by Nanda Mahārāja and the residents of Vṛndāvan the day after Kṛṣṇa\'s appearance (Janmāṣṭamī). The entire cowherd community celebrated the birth of Nanda\'s son with charity, feasting, and music throughout Gokula.',
        observances: [
            'Celebrating with joy the day after Janmāṣṭamī',
            'Distributing prasādam and gifts to brāhmaṇas and devotees',
            'Kīrtan and community celebration',
            'Reading about Nanda Mahārāja\'s joy at Kṛṣṇa\'s birth',
            'Offering special worship to baby Kṛṣṇa'
        ],
        story: 'When the astrologer Garga Muni came to perform the name-giving ceremony for Kṛṣṇa, he secretly revealed to Nanda Mahārāja the divine nature of his son. As word spread, the residents of Gokula celebrated with great joy, decorating their homes, exchanging gifts, and the whole village resounded with the sounds of festival.',
        bhajans: ['Nanda Ke Ananda Bhaiyo', 'Yasomati Nandana', 'Jaya Radha Madhava']
    },
    'lord balarama': {
        significance: 'The appearance day of Lord Balarāma, the elder brother of Lord Kṛṣṇa and the first expansion of Viṣṇu. Lord Balarāma is the original spiritual master and the embodiment of devotional service. He is worshipped as Nityānanda Prabhu in the Gauḍīya tradition.',
        observances: [
            'Fasting until noon',
            'Special abhiṣeka of Balarāma\'s Deity',
            'Offering white flowers and white bhoga (Balarāma\'s favourite color)',
            'Reading about Balarāma\'s pastimes in Śrīmad-Bhāgavatam',
            'Kīrtan glorifying Nityānanda-Balarāma',
            'Breaking fast with prasādam feast'
        ],
        story: 'Lord Balarāma was transferred from the womb of Devakī to the womb of Rohiṇī by the mystic power of Yogamāyā, just before Kṛṣṇa\'s appearance. He appeared first, and His white complexion contrasts with Kṛṣṇa\'s dark blue form. In Vṛndāvan He enjoyed countless pastimes with Kṛṣṇa and the cowherd boys.',
        bhajans: ['Nitai Pada Kamala', 'Akrodha Paramananda', 'Parama Karuna Pahu Dui Jana']
    },
    'vamana': {
        significance: 'Śrī Vāmana Dvādaśī celebrates the appearance of Lord Vāmana, the dwarf brāhmaṇa avatāra of Viṣṇu, who appeared to subdue the pride of the demon king Bali Mahārāja and restore the dominion of the demigods.',
        observances: [
            'Fasting on the dvādaśī (twelfth day)',
            'Worshipping Lord Vāmana with sacred thread and brāhmaṇical items',
            'Reading the Vāmana-līlā from Śrīmad-Bhāgavatam (Canto 8)',
            'Offering lotus flowers and tulasī to Lord Vāmana',
            'Chanting prayers to Lord Trivikrama',
            'Breaking fast with Viṣṇu prasādam'
        ],
        story: 'When King Bali conquered all three worlds, Lord Viṣṇu appeared as a dwarf brāhmaṇa boy named Vāmana. He requested only three steps of land from Bali. When Bali agreed, Vāmana expanded to cosmic proportions and covered all the worlds in two steps. With the third step He pushed Bali to the lower planets, but pleased by Bali\'s surrender, He granted him special blessings.',
        bhajans: ['Isvara Parama Krsna', 'Namamisvaram Saccidananda Rupam', 'Hare Krishna Maha Mantra']
    },
    'ananta caturdasi': {
        significance: 'Ananta Caturdaśī is the vrata (vow) day honoring Lord Ananta Śeṣa, the divine serpent upon whom Lord Viṣṇu rests in the cosmic ocean. It is also associated with the appearance of Lord Padmanābha. Observing this vrata is said to fulfill all desires and ultimately grant liberation.',
        observances: [
            'Fasting on the caturdaśī (fourteenth day)',
            'Offering worship to Lord Ananta with 14 types of items',
            'Wearing a sacred thread with 14 knots as a vow',
            'Reading the Ananta Caturdaśī vrata-kathā',
            'Bathing in sacred rivers or waters',
            'Distributing prasādam'
        ],
        bhajans: ['Isvara Parama Krsna', 'Namamisvaram Saccidananda Rupam']
    },
    'caturmasya': {
        significance: 'Cāturmāsya ("four months") is a period of special austerity beginning on Śayana Ekādaśī when Lord Viṣṇu takes rest, and ending on Utthāna Ekādaśī when He awakens. Devotees observe additional vows, increase spiritual practices, and avoid certain foods each month.',
        observances: [
            'First month: Avoid leafy vegetables (hārita)',
            'Second month: Avoid yogurt (dadhi)',
            'Third month: Avoid milk (kṣīra)',
            'Fourth month: Avoid urad dhal and mustard oil',
            'Increased chanting, reading, and hearing throughout',
            'Special pūjā and kīrtan programs',
            'Study of scriptures with increased attention'
        ],
        bhajans: ['Sri Guru Carana Padma', 'Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'nityananda trayodasi': {
        significance: 'Nityānanda Trayodaśī celebrates the appearance of Śrī Nityānanda Prabhu, the avatāra of Lord Balarāma who came as the most intimate associate of Śrī Caitanya Mahāprabhu. He is famed for His unlimited mercy, distributing divine love freely to all without consideration of past sinful activities.',
        observances: [
            'Fasting until noon',
            'Special abhiṣeka and worship of Nityānanda Prabhu\'s Deity',
            'Singing songs glorifying Nityānanda Prabhu',
            'Large-scale saṅkīrtan and distribution of prasādam',
            'Reading about Nityānanda\'s pastimes from Caitanya-caritāmṛta',
            'Community feasting in the evening'
        ],
        story: 'Śrī Nityānanda Prabhu appeared in Ekacakra, West Bengal. He is especially known for the pastime of approaching the notorious sinners Jagāi and Mādhāi and, despite being struck and wounded by them, freely distributing divine love — demonstrating that no one is beyond the Lord\'s mercy.',
        bhajans: ['Nitai Pada Kamala', 'Dhana Mor Nityananda', 'Parama Karuna Pahu Dui Jana', 'Akrodha Paramananda']
    },
    'rama navami': {
        significance: 'Rāma Navamī celebrates the appearance of Lord Rāmacandra, the seventh avatāra of Lord Viṣṇu. He appeared to demonstrate perfect dharmic life and to defeat the demon Rāvaṇa who had abducted His wife Sītā Devī.',
        observances: [
            'Fasting until noon',
            'Reading or hearing the Rāmāyaṇa or relevant portions of Śrīmad-Bhāgavatam',
            'Worshipping Sītā-Rāma-Lakṣmaṇa-Hanumān',
            'Celebrating with kīrtan and prasādam',
            'Distributing Tulasī leaves as prasādam'
        ],
        story: 'Lord Rāma appeared as the son of Mahārāja Daśaratha in Ayodhyā on the ninth day of the bright fortnight of Caitra. He was exiled for 14 years due to palace intrigue. During exile, Rāvaṇa abducted His wife Sītā. Lord Rāma, with the help of Hanumān and an army of monkeys, built a bridge to Laṅkā, defeated Rāvaṇa, and returned triumphantly to Ayodhyā.',
        bhajans: ['Hari Hari Biphale Janama', 'Hare Krishna Maha Mantra']
    },
    'ganga puja': {
        significance: 'Gaṅgā Pūjā celebrates the descent of Mother Gaṅgā (the Ganges river) from the heavenly planets to Earth through the matted locks of Lord Śiva. The Ganges is the most sacred river, able to purify all sins through contact, and is non-different from the water of the Lord\'s lotus feet.',
        observances: [
            'Bathing in the Ganges or performing symbolic bathing',
            'Offering flowers, dīyas (lamps), and prasādam to Mother Gaṅgā',
            'Reciting Gaṅgā-stotras (hymns to the Ganges)',
            'Pouring Gaṅgā jala (sacred water) as an offering',
            'Requesting Mother Gaṅgā\'s blessings for purification',
            'Chanting the holy names by the riverside'
        ],
        story: 'King Bhagīratha performed severe austerities to bring the celestial Gaṅgā to Earth to purify the ashes of his ancestors. The Ganges descended through the locks of Lord Śiva to soften her force. She is also identified as the water from the lotus feet of Lord Viṣṇu, which is why bathing in her waters purifies all sins.',
        bhajans: ['Devi Suresvari Bhagavati Gange', 'Sri Guru Carana Padma']
    },
    // Individual Ekadasi descriptions
    'pandava nirjala ekadasi': {
        significance: 'Paṇḍava Nirjalā Ekādaśī is the most austere of all Ekādaśīs. Observing this one Ekādaśī by completely abstaining from even water (nirjalā — "without water") earns the merit of all 24 Ekādaśīs of the year. It was prescribed by Vyāsadeva to Bhīma (Bhīmasenī) who found it impossible to fast on every Ekādaśī.',
        observances: [
            'Complete abstinence from food AND water for the entire day and night',
            'Intense chanting of the holy names',
            'Reading the glories of Paṇḍava Nirjalā Ekādaśī',
            'Donating water, umbrellas, shoes, and fans to brāhmaṇas',
            'Breaking fast on Dvādaśī only after sunrise',
            'This single fast gives the benefit of all 24 Ekādaśīs of the year'
        ],
        story: 'Bhīma, one of the Pāṇḍava brothers, was unable to fast on every Ekādaśī due to his enormous appetite. He went to Vyāsadeva who mercifully told him that by fasting strictly on this one Ekādaśī in the month of Jyeṣṭha — including abstaining from water — he would gain the merit of all the Ekādaśīs of the year.',
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'yogini ekadasi': {
        significance: 'Yoginī Ekādaśī falls in the dark fortnight of Āṣāḍha. Observing this Ekādaśī is said to free one from all sinful reactions, cure diseases, and bring spiritual wealth. It carries the merit equivalent to feeding 88,000 brāhmaṇas.',
        observances: [
            'Fasting from grains and beans',
            'Increased chanting of the holy names',
            'Worshipping Lord Viṣṇu with white flowers',
            'Donating food to brāhmaṇas and Vaiṣṇavas',
            'Reading the glories of Yoginī Ekādaśī',
            'Breaking fast the next morning after sunrise'
        ],
        story: 'A king named Hemamāli who served Lord Kubera faithfully was cursed with a terrible disease when he neglected his duty for his wife\'s pleasure. A sage instructed him to observe Yoginī Ekādaśī. By fasting and praying to Lord Viṣṇu on this day, he was completely cured.',
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'sayana ekadasi': {
        significance: 'Śayana Ekādaśī marks the beginning of Cāturmāsya, the period when Lord Viṣṇu takes His mystic rest on the serpent Śeṣa in the Milk Ocean. From this day the four months of special observance begin. This Ekādaśī initiates the most spiritually potent four-month period of the year.',
        observances: [
            'Fasting from grains and beans',
            'Beginning Cāturmāsya vows from this day',
            'Avoiding leafy vegetables during the first month',
            'Increased devotional reading and hearing',
            'Offering tulasī and lotus flowers to Lord Viṣṇu',
            'Night-long kīrtan (optional)'
        ],
        story: 'On this Ekādaśī, Lord Viṣṇu lies down on the serpent Ananta Śeṣa in the cosmic ocean of milk and enters His yoga-nidrā (mystic rest) for four months. During this period, weddings and major saṁskāras are traditionally avoided. The four months of Cāturmāsya begin.',
        bhajans: ['Isvara Parama Krsna', 'Narada Muni Bajay Vina', 'Namamisvaram Saccidananda Rupam']
    },
    'kamika ekadasi': {
        significance: 'Kāmikā Ekādaśī falls in the dark fortnight of Śrāvaṇa during Cāturmāsya. This Ekādaśī is said to destroy the greatest sins, including those committed through mantra offenses. Worshipping Lord Viṣṇu with tulasī on this day is especially powerful.',
        observances: [
            'Fasting from grains and beans',
            'Worshipping Lord Viṣṇu with tulasī leaves',
            'Reading or hearing the glories of Kāmikā Ekādaśī',
            'Increased chanting of the holy names',
            'Offering a lamp in the evening to Lord Viṣṇu',
            'Breaking fast on Dvādaśī after sunrise'
        ],
        story: 'A king named Brahmasena accidentally killed a brāhmaṇa. Tormented by the sin of brāhmaṇa-killing, he sought counsel from a sage who instructed him to observe Kāmikā Ekādaśī. By fasting and worshipping Lord Viṣṇu with tulasī on this day, he was completely freed from his sin.',
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'pavitropana ekadasi': {
        significance: 'Pavitropaṇā Ekādaśī falls in the bright fortnight of Śrāvaṇa during Cāturmāsya. This Ekādaśī purifies all vows and is particularly recommended for those who have broken their vows or have been unable to maintain their Cāturmāsya observances. It restores spiritual purity.',
        observances: [
            'Fasting from grains and beans',
            'Renewing and reconfirming spiritual vows',
            'Worshipping Lord Viṣṇu with a special sacred thread (pavitra)',
            'Offering tulasī garlands and flowers',
            'Reading the glories of Pavitropaṇā Ekādaśī',
            'Night-long saṅkīrtan (optional)'
        ],
        bhajans: ['Narada Muni Bajay Vina', 'Sri Guru Carana Padma']
    },
    'annada ekadasi': {
        significance: 'Annadā Ekādaśī falls in the dark fortnight of Bhādra. Observing this Ekādaśī frees one from sins related to food and hunger, and is said to liberate one\'s ancestors from lower regions of existence. Donating food on this day carries special spiritual merit.',
        observances: [
            'Fasting from grains and beans',
            'Donating food to brāhmaṇas and the poor',
            'Performing śrāddha (memorial) rites for ancestors',
            'Reading the glories of Annadā Ekādaśī',
            'Increasing chanting and hearing',
            'Breaking fast the following morning'
        ],
        story: 'King Indrasena was told in a dream that his father was suffering in a lower region due to past sins. A sage instructed him to observe Annadā Ekādaśī on his father\'s behalf. By fasting, worshipping Lord Viṣṇu, and offering the merit to his father, his father was liberated.',
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'parsva ekadasi': {
        significance: 'Pārśva Ekādaśī (Parivartinī Ekādaśī) falls in the bright fortnight of Bhādra. On this day, Lord Viṣṇu, who has been resting on His left side since Śayana Ekādaśī, turns to lie on His right side (pārśva = flank). This day also coincides with Vāmana Dvādaśī.',
        observances: [
            'Fasting from grains and beans',
            'Worshipping Lord Vāmana with flowers and tulasī',
            'Circumambulating the Deity',
            'Chanting Viṣṇu-sahasranāma',
            'Reading the glories of Pārśva Ekādaśī',
            'Breaking fast on Dvādaśī'
        ],
        story: 'During Cāturmāsya, Lord Viṣṇu sleeps on His left side from Śayana Ekādaśī. On Pārśva Ekādaśī, He turns to lie on His right side. This subtle divine movement is celebrated as highly auspicious and the day coincides with Vāmana Dvādaśī.',
        bhajans: ['Isvara Parama Krsna', 'Narada Muni Bajay Vina']
    },
    'indira ekadasi': {
        significance: 'Indrā Ekādaśī falls in the dark fortnight of Āśvina during Pitṛ Pakṣa (the ancestral worship period). Uniquely among Ekādaśīs, this one has the power to liberate deceased relatives and ancestors from lower regions of existence. Named after King Indrasena who observed it.',
        observances: [
            'Fasting from grains and beans',
            'Performing śrāddha for ancestors in the morning',
            'Offering sesame seeds and water to ancestors',
            'Worshipping Lord Viṣṇu with full devotion',
            'Giving charity to brāhmaṇas in the names of one\'s ancestors',
            'Reading the glories of Indrā Ekādaśī'
        ],
        story: 'King Indrasena was told in a dream that his father was suffering in a lower region. A sage instructed him to observe Indrā Ekādaśī on his father\'s behalf. By fasting, worshipping Lord Viṣṇu, and offering the merit to his father during the ancestral fortnight, his father was liberated.',
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'pasankusa ekadasi': {
        significance: 'Pāśāṅkuśā Ekādaśī falls in the bright fortnight of Āśvina. The name refers to the goad (aṅkuśa) that drives away the noose of sins (pāśa). Observing this Ekādaśī destroys massive accumulations of sinful karma, and even the merit of thinking about it is said to benefit the observer.',
        observances: [
            'Fasting from grains and beans',
            'Worshipping Lord Padmanābha (Viṣṇu) with full devotion',
            'Offering lotus flowers and tulasī',
            'Increasing rounds of japa',
            'Reading the glories of Pāśāṅkuśā Ekādaśī',
            'Night-long devotional service (optional)'
        ],
        story: 'A hunter named Pāpāṅkuśa was a great sinner throughout his life. On the day of Pāśāṅkuśā Ekādaśī, he inadvertently fasted due to finding no prey, and spent the night awake. Due to this accidental observance, he was freed from all his sins and elevated to the spiritual world — illustrating the extraordinary power of this Ekādaśī.',
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'rama ekadasi': {
        significance: 'Rāmā Ekādaśī falls in the dark fortnight of Kārtika, the month most dear to Lord Viṣṇu. This Ekādaśī destroys sinful reactions and grants liberation. Kārtika month multiplies the benefit of all devotional activities, making Rāmā Ekādaśī one of the most powerful for spiritual advancement.',
        observances: [
            'Fasting from grains and beans',
            'Lighting lamps in honor of Lord Viṣṇu (Kārtika dīpa)',
            'Increased chanting in the sacred month of Kārtika',
            'Offering tulasī leaves with devotion',
            'Night vigil with kīrtan (especially beneficial in Kārtika)',
            'Reading the glories of Rāmā Ekādaśī'
        ],
        story: 'A king named Mucukunda asked the sage Vaśiṣṭha about the most auspicious Ekādaśī. Vaśiṣṭha described Rāmā Ekādaśī in Kārtika as supremely powerful, able to destroy the accumulated sins of millions of lifetimes and grant the observer a position in the Vaikuṇṭha planets.',
        bhajans: ['Vibhavari Sesa', 'Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'utthana ekadasi': {
        significance: 'Utthāna Ekādaśī (Devotthanī / Prabodhini Ekādaśī) falls in the bright fortnight of Kārtika and marks the end of Cāturmāsya. On this day Lord Viṣṇu "awakens" from His four-month rest. It is also the day of Tulasī-Śāligrāma Vivāha, the sacred marriage ceremony of Tulasī Devī with the Śāligrāma śilās.',
        observances: [
            'Completing Cāturmāsya vows with special ceremony',
            'Performing Tulasī-Śāligrāma Vivāha (sacred marriage ceremony)',
            'Fasting from grains and beans',
            'Night-long kīrtan celebrating Lord Viṣṇu\'s awakening',
            'Decorating Tulasī plant with flowers and lights',
            'Community celebration with prasādam feast'
        ],
        story: 'For four months, Lord Viṣṇu rests on the divine serpent Śeṣa. On Utthāna Ekādaśī He awakens. All suspended ceremonies resume. The Tulasī-Śāligrāma Vivāha performed on this day is especially auspicious, as Tulasī Devī — the embodiment of pure devotion — is ceremonially married to the Lord.',
        bhajans: ['Namo Namah Tulasi Maharani', 'Namo Namah Tulasi Krsna Preyasi', 'Narada Muni Bajay Vina']
    },
    'moksada ekadasi': {
        significance: 'Mokṣadā Ekādaśī falls in the bright fortnight of Mārgaśīrṣa — the same period as Gītā Jayantī. This is the Ekādaśī on which Lord Kṛṣṇa spoke the Bhagavad-gītā to Arjuna on the battlefield of Kurukṣetra. Observing this day and studying the Gītā is said to grant liberation (mokṣa).',
        observances: [
            'Fasting from grains and beans',
            'Reading or hearing the Bhagavad-gītā',
            'Attending community Gītā readings and discourses',
            'Studying the Gītā\'s philosophical teachings',
            'Gifting copies of Bhagavad-gītā As It Is to others',
            'Offering Gītā recitation to Lord Kṛṣṇa'
        ],
        story: 'On this day, Lord Kṛṣṇa spoke the Bhagavad-gītā to Arjuna on the battlefield of Kurukṣetra — a conversation containing the complete essence of Vedic wisdom. Distributing Bhagavad-gītā As It Is on this day is considered especially meritorious.',
        bhajans: ['Isvara Parama Krsna', 'Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'utpanna ekadasi': {
        significance: 'Utpannā Ekādaśī is the Ekādaśī on which the goddess Ekādaśī herself was manifested from Lord Viṣṇu to defeat the demon Mura. This is the origin of all Ekādaśī observances. By learning this story, one gains the merit of all other Ekādaśīs.',
        observances: [
            'Fasting from grains and beans',
            'Reading the origin story of the Ekādaśī goddess',
            'Worshipping Lord Viṣṇu and Ekādaśī devī',
            'Increased chanting and hearing of Viṣṇu-kathā',
            'Donating sesame seeds and gold to brāhmaṇas',
            'Night vigil with devotional readings'
        ],
        story: 'The demon Mura was harassing all the demigods. When Lord Viṣṇu fought him for thousands of years and rested in a cave, Mura approached to kill the sleeping Lord. A beautiful goddess emerged from Lord Viṣṇu\'s body and defeated Mura. The Lord told her she would be known as Ekādaśī and worshipped throughout the universe.',
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    },
    'parama ekadasi': {
        significance: 'Paramā Ekādaśī is a special Ekādaśī that occurs only in a leap lunar year (Adhika Māsa, the extra month). Observing this Ekādaśī during the extra lunar month is considered especially powerful for purification and spiritual merit, as the extra month itself carries extraordinary blessings.',
        observances: [
            'Fasting from grains and beans during the leap month Ekādaśī',
            'Reading the special glories of Adhika Māsa and Paramā Ekādaśī',
            'Taking advantage of the extra month for increased devotional practice',
            'Worshipping Lord Viṣṇu with particular attention',
            'Charity and donations during this auspicious extra month'
        ],
        bhajans: ['Narada Muni Bajay Vina', 'Hare Krishna Maha Mantra']
    }
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
        'gadadhara': 'gadadhara pandita',
        'srivasa': 'srivasa pandita',
        'nityananda': 'nityananda prabhu',
        'gaura kisora': 'gaura kisora dasa babaji',
        'narahari': 'narahari sarakara thakura',
        'vasudeva ghosh': 'vasudeva ghosh',
        'srinivasa acharya': 'srinivasa acharya',
        'syamananda': 'syamananda prabhu',
        'rasikananda': 'rasikananda prabhu',
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

                {/* Story */}
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
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">About the Ācārya</h2>
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
                                        <span key={i} className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-amber-200 dark:border-gray-600">
                                            {work}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Description fallback */}
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

                {/* Suggested Bhajans */}
                {suggestedBhajans && suggestedBhajans.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Music className="w-5 h-5 text-rose-500" />
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Suggested Bhajans</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestedBhajans.map((bhajan, i) => (
                                <span key={i} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-full text-sm font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    {bhajan}
                                </span>
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
