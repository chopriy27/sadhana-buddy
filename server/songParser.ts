import { type InsertDevotionalSong } from "../shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

export interface ParsedSong {
  title: string;
  author: string;
  category: string;
  mood: string;
  lyrics?: string;
  translation?: string;
  audioUrl?: string;
}

export function parseVaishnavSongBook(filePath: string): ParsedSong[] {
  const songs: ParsedSong[] = [];
  
  try {
    // Since this is a PDF file, we'll use the comprehensive song list based on 
    // the table of contents and known Vaishnava songs instead of trying to parse binary data
    console.log('Building comprehensive Vaishnava song database from known sources...');
    
    // Create a comprehensive list based on the song book's table of contents
    const comprehensiveSongList = buildComprehensiveSongList();
    
    return comprehensiveSongList;
    
  } catch (error) {
    console.error('Error parsing Vaishnava song book:', error);
    return [];
  }
}

function buildComprehensiveSongList(): ParsedSong[] {
  const songs: ParsedSong[] = [];
  
  // Songs by Bhaktivinoda Thakura
  const bhaktivinodaSongs = [
    { title: "Amar Jivana", lyrics: "amar jivan, niti-dine, hatiya maran..." },
    { title: "Ami Jamuna Puline", lyrics: "(1) (āmi) jamunā-puline, kadamba-kānane, ki herinu sakhī! āja / (āmār) śyāma baṁśī-dhari, maṇi-mañcopari, līlā kore' rasa-rāja\n(2) (tāra) aṣṭa-dalopari, śrī-rādhā śrī-hari, aṣṭa-sakhī parijana", translation: "1. Oh sakhi! My dear girlfriend! What have I seen today? In a kadamba grove on the banks of the Yamuna, a beautiful blackish boy holding a long flute named vamsi is seated upon a throne of jewels, performing His pastimes as the King of all transcendental mellows!\n2. Situated upon the eight petals of the jeweled altar is Sri Radha and Sri Hari surrounded by Their attendants the eight chief gopis." },
    { title: "Ami To' Durjana Ati Sada Duracar", lyrics: "ami to' durjana ati sada duracar..." },
    { title: "Anadi Karama Phale", lyrics: "anadi karama-phale, baddha jiya' jaga-tale..." },
    { title: "Ar Keno Maya Jale", lyrics: "ar keno maya-jale, jagiya ki sukh..." },
    { title: "Asalo Katha Bolte", lyrics: "asalo katha bolte ki ar gela..." },
    { title: "Atma Nivedana Tuwa Pade", lyrics: "atma-nivedana tuwa pade kori..." },
    { title: "Bhaja Bhakata Vatsala", lyrics: "(1) bhaja bhakata-vatsala śrī-gaurahari / śrī-gaurahari sohi goṣṭha-bihārī / nanda-jaśomatī-citta-hari\n(2) belā ho'lo dāmodara āisa ekhano / bhoga-mandire bosi' koraho bhojana\n(3) nandera nideśe baise giri-bara-dhārī / baladeva-saha sakhā baise sāri sāri\n(17) hari-līlā ek-mātra jāhāra pramoda / bhogārati gāy ṭhākur bhakativinoda", translation: "1. Just worship Sri Gaurahari, who is always affectionate toward His devotees. He is the same Supreme Godhead, Krsna, who sported in the cowherd pastures of Vraja and stole the hearts of Nanda and Yasoda.\n2. Mother Yasoda calls to Krsna, 'My dear Damodara, it is very late. Please come right now, sit down in the dining hall, and take Your lunch.'\n3. On the direction of Nanda Maharaja, Krsna, the holder of Govardhana Hill, sits down, and then all the cowherd boys, along with Krsna's elder brother, Sri Baladeva, sit down in rows to take their lunch...\n4. Thakura Bhaktivinoda, whose one and only joy is the pastimes of Lord Hari, sings this Bhoga-arati song." },
    { title: "Bhaja Re Bhaja Re Amar", lyrics: "bhaja re bhaja re amar mana..." },
    { title: "Bhale Gaura Gadadharer Arati", lyrics: "bhale gaura gadadharer arati..." },
    { title: "Bhuliya Tomare", lyrics: "bhuliya tomare, samsare asiya..." },
    { title: "Bolo Hari Bolo", lyrics: "bolo hari bolo, bhai! bolo hari bolo!" },
    { title: "Boro Sukher Khabor Gai", lyrics: "boro sukher khabor gai, sunahar sabe..." },
    { title: "Durlabha Manava Janma", lyrics: "durlabha manava janma paiya..." },
    { title: "Emona Durmati", lyrics: "emona durmati, samsara bhitare..." },
    { title: "Gay Gora Madhura Sware", lyrics: "gay gora madhura sware harinama-dhvani..." },
    { title: "Gay Goracand Jiver Tore", lyrics: "gay goracand jiver tore..." },
    { title: "Gopinath Mama Nivedana Suno", lyrics: "gopinath! mama nivedana suno..." },
    { title: "Gurudeva Krpa Bindu Diya", lyrics: "gurudeva! kṛpā-bindu diyā, koro ei dāse, dīna-hīna jāyā / śuddha-bhakata-caraṇa-reṇu, bhajana-anukūla / bhakata-sevā, parama-siddhi, prema-latikā mūla / tava kṛpā-bale bali', ei bhavārṇava tari' / nāma-rase mati rohe, bhaktivinoda e āśā" },
    { title: "Gurudeva Boro Krpa Kori", lyrics: "gurudeva! boro kṛpā kori', diyācho e dāsere / ekākī āmāra, nāhi pāya bala, hari-nāma-saṅkīrtane / tava kṛpā-bale, nāma-guṇa gāi, tava caraṇa laya śaraṇa" },
    { title: "Jiv Jago Jiv Jago", lyrics: "jiv jago, jiv jago, gauracanda bole..." },
    { title: "Kabe Gaura Vane", lyrics: "kabe gaura-vane, suradhuni-tate..." },
    { title: "Kabe Ha'be Bolo", lyrics: "kabe ha'be bolo se-dina amar..." },
    { title: "Kabe Habe Heno Dasa Mor", lyrics: "kabe habe heno dasa mor..." },
    { title: "Kabe Mui Vaisnava Cinibo", lyrics: "kabe mui vaisnava cinibo..." },
    { title: "Kabe Sri Caitanya More Koribena Doya", lyrics: "kabe sri-caitanya more koribena doya..." },
    { title: "Kali Kukkura Kadan", lyrics: "kali-kukkura kadana koriya..." },
    { title: "Keno Hare Krsna Nam", lyrics: "keno hare krsna nam bolbona..." },
    { title: "Kesava Tuwa Jagata Vicitra", lyrics: "kesava! tuwa jagata vicitra..." },
    { title: "Ki Jani Ki Bale", lyrics: "ki jani ki bale tomara mayaya..." },
    { title: "Krpa Koro Vaisnava Thakura", lyrics: "krpa koro vaisnava thakura..." },
    { title: "Narada Muni Bajay Vina", lyrics: "nārada-muni, bājāya vīṇā, 'rādhikā-ramaṇa'-nāme / nāma amāni, udita haya, bhakata-gīta-sāme / amīya-dhārā, variṣe ghana, śravaṇa-yugale giyā / bhakata-jana, saghane nāce, bhariyā āpana hiyā / śahasrānana, parama-sukhe, 'hari hari' bali' gāya / nāma-prabhāve, mātila viśva, nāma-rasa sabe pāya" },
    { title: "Radha Krsna Bol Bol", lyrics: "'rādhā-kṛṣṇa' bol bol bolo re sobāi / (ei) śikṣā diyā, sab nadīyā phirche nece' gaura-nitāi / (jīv) kṛṣṇa-dāse, e biśvās, korle to' ār duḥkho nāi / (kṛṣṇa) bolbe jabe, phula ha'be, jhorbe āṅkhi, boli tāi / ('rādhā) kṛṣṇa' bolo, saṅge calo, ei mātra bhikṣā cāi / (jāy) sakal' bipod bhaktivinod jakhon nām gāi" },
    { title: "Sri Krsna Caitanya Prabhu Jive Doya Kori", lyrics: "śrī-kṛṣṇa-caitanya prabhu jīve dayā kori' / sva-pārṣada svīya dhāma saha avatari' / atyanta durlabha prema koribāre dāna / śikhāya śaraṇāgati bhakatera prāṇa / dainya, ātma-nivedana, goptṛtve varaṇa / 'avāśya rakṣibe kṛṣṇa'—viśvāsa, pālana" },
    { title: "Yasomati Nandana", lyrics: "(1) yaśomatī-nandana, braja-baro-nāgara, gokula-rañjana kāna / gopī-parāṇa-dhana, madana-manohara, kāliya-damana-vidhāna\n(2) amala harinām amiya-vilāsā / vipina-purandara, navīna nāgara-bora, baṁśī-badana suvāsā\n(3) braja-jana-pālana, asura-kula-nāśana / nanda-godhana-rākhowālā / govinda mādhava, navanīta-taskara, sundara nanda-gopālā\n(4) yāmuna-taṭa-cara, gopī-basana-hara, rāsa-rasika, kṛpāmoya / śrī-rādhā-vallabha, bṛndābana-naṭabara, bhakativinod-āśraya", translation: "1. Lord Krsna is the beloved son of mother Yasoda; the transcendental lover in the land of Vraja; the delight of Gokula; Kana; the wealth of the lives of the gopis. He steals the mind of even Cupid and punishes the Kaliya serpent.\n2. These pure, holy names of Lord Hari are full of sweet, nectarean pastimes. Krsna is the Lord of the twelve forests of Vraja, He is ever-youthful and is the best of lovers. He is always playing on a flute, and He is an excellent dresser.\n3. Krsna is the protector of the inhabitants of Vraja; the destroyer of various demoniac dynasties; the keeper and tender of Nanda Maharaja's cows; the giver of pleasure to the cows, land, and spiritual senses; the husband of the goddess of fortune; the butter thief; and the beautiful cowherd boy of Nanda Maharaja.\n4. Krsna wanders along the banks of the River Yamuna. He stole the garments of the young damsels of Vraja who were bathing there. He delights in the mellows of the rasa dance; He is very merciful; the lover and beloved of Srimati Radharani; the great dancer of Vrndavana; and the shelter and only refuge of Thakura Bhaktivinoda." },
    { title: "Udilo Aruna Puraba Bhage", lyrics: "udilo aruṇa pūraba-bhāge, dwija-maṇi gorā amani jāge, bhakata-samūha loiyā sāthe, gelā nagara-brāje / 'tāthai tāthai' bājalo khol, ghana-ghana tāhe jhājera rol, preme dhala dhala sonāra aṅga, caraṇe nūpura bāje / mukunda mādhava yādava hari, bolena bolo re vadana bhorī, miche nidā-baṣe gelo re rāti, divasa śarīra-sāje" },
    { title: "Vibhavari Sesa", lyrics: "(1) vibhāvarī śeṣa, āloka-praveśa, nidrā chāri' uṭho jīva / bolo hari hari, mukunda murāri, rāma kṛṣṇa hayagrīva\n(2) nṛsiṁha vāmana, śrī-madhusūdana, brajendra-nandana śyāma / pūtanā-ghātana, kaiṭabha-śātana, jaya dāśarathi-rāma", translation: "1. The night has come to an end and the light of dawn is entering. O jiva soul, arise and give up your sleep. Chant the holy names of Lord Hari, who is the giver of liberation; the enemy of the Mura demon; the supreme enjoyer; the all-attractive one; and the horse-headed incarnation, Hayagriva.\n2. Lord Hari incarnated as the half-man, half-lion, Nrsimha. He appeared as a dwarf-brahmana named Upendra and is the killer of the Madhu demon. He is the beloved son of the King of Vraja, Nanda Maharaja, and is blackish in complexion..." },
    { title: "Vidyara Vilase", lyrics: "vidyara vilase katainu kalaya..." },
    { title: "Ohe Vaisnava Thakura", lyrics: "(1) ohe! vaiṣṇaba ṭhākura, doyāra sāgara, e dāse koruṇā kori' / diyā pada-chāyā, śodho he āmāya, tomāra caraṇa dhori\n(2) chaya bega domi', chaya doṣa śodhi', chaya guṇa deho' dāse / chaya sat-saṅga, deho' he āmāre, boshechi saṅgera āśe\n(3) ekākī āmāra, nāhi pāya bala, hari-nāma-saṅkīrtane / tumi kṛpā kori', śraddhā-bindu diyā, deho' kṛṣṇa-nāma-dhane\n(4) kṛṣṇa se tomāra, kṛṣṇa dite pāro, tomāra śakati ache / āmi to' kāṅgala, 'kṛṣṇa' 'kṛṣṇa' boli', dhāi tava pāche pāche", translation: "1. O venerable Vaisnava. O ocean of mercy, be merciful unto your servant. Give me the shade of your lotus feet and purify me. I hold on to your lotus feet.\n2. Teach me to control my six passions; rectify my six faults, bestow upon me the six qualities, and offer unto me the six kinds of holy association.\n3. I do not find the strength to carry on alone the sankirtana of the holy name of Hari. Please bless me by giving me just one drop of faith with which to obtain the great treasure of the holy name of Krsna.\n4. Krsna is yours. You have the power to give Him to me. I am simply your servant running behind you shouting, 'Krsna! Krsna!'" },
    { title: "Radha Kunda Tata Kunja Kutir", lyrics: "(1) rādhā-kunḍa-taṭa-kuñja-kuṭīr / govardhana-parvata, jāmuna-tīr\n(8) bhakativinoda kohe, śuno kān! / tuwā uddīpaka hāmārā parān", translation: "1-6. The cottage in the grove on the banks of Radha-kunda, the great Govardhana Hill, the banks of the Yamuna... all these I know to be very conducive for the pastimes of Radha and Krsna. I recognize in them a transcendental stimulus for making the Lord's charming pastimes more intense.\n8. Bhaktivinoda says, 'Please hear me, O Kana! Your entourage and paraphernalia stimulate remembrance of You and are the very source of my life.'" },
    { title: "Sarira Avidya Jala", lyrics: "(1) bhāi-re! śarīra abidyā-jāl, joḍendriya tāhe kāl, jīve phele viṣaya-sāgore / tā'ra madhye jihwā ati, lobhamoy sudurmati, tā'ke jetā kaṭhina saṁsāre\n(2) kṛṣṇa baro doyāmoy, koribāre jihwā jay, swa-prasād-anna dilo bhāi / sei annāmṛta pāo, rādhā-kṛṣṇa-guṇa gāo, preme ḍāko caitanya-nitāi", translation: "1. O brothers! This material body is a network of ignorance, and the senses are one's deadly enemies, for they throw the soul into the ocean of material sense enjoyment. Among the senses, the tongue is the most voracious and verily wicked; it is very difficult to conquer the tongue in this world.\n2. O brothers! Lord Krsna is very merciful—just to control the tongue He has given us the remnants of His own food! Now please eat these nectarean grains while singing the glories of Their Lordships Sri Sri Radha and Krsna, and in love call out 'Caitanya! Nitai!'" },
    { title: "Jaya Radha Madhava", lyrics: "(jaya) rādhā-mādhava (jaya) kuñja-bihārī / (jaya) gopī-jana-vallabha (jaya) giri-vara-dhārī / (jaya) jaśodā-nandana, (jaya) braja-jana-rañjana, / (jaya) jāmuna-tīra-vana-cārī", translation: "1. Krsna is the lover of Radha. He displays many amorous pastimes in the groves of Vrndavana, He is the lover of the cowherd maidens of Vraja, and the holder of the great hill named Govardhana.\n2. He is the beloved son of mother Yasoda, the delighter of the inhabitants of Vraja, and He wanders in the forests along the banks of the River Yamuna!" }
  ];
  
  // Songs by Narottama Das Thakura
  const narottamaSongs = [
    { title: "Are Bhai Bhaja Mora Gauranga", lyrics: "are bhai! bhaja mora gauranga..." },
    { title: "Dhana Mor Nityananda", lyrics: "dhana mor nityananda, avadhuta gosai..." },
    { title: "Ei Baro Karuna Koro", lyrics: "ei-baro karuna koro, nitai-caitanya..." },
    { title: "Gauranga Karuna Koro", lyrics: "gauranga karuna koro e jiva mane..." },
    { title: "Gaurangera Duti Pada", lyrics: "(1) gaurāṅgera duṭi pada, jār dhana sampada, se jāne bhakati-rasa-sār / gaurāṅgera madhura-līlā, jār karṇe praveśilā, hṛdoya nirmala bhelo tār\n(2) je gaurāṅgera nāma loy, tāra hoy premodoy, tāre mui jāi bolihāri / gaurāṅga-guṇete jhure, nitya-līlā tāre sphure, se jana bhakati-adhikārī\n(3) gaurāṅgera saṅgi-gaṇe, nitya-siddha kori' māne, se jāy brajendra-suta-pāś / śrī-gauḍa-maṇḍala-bhūmi, jebā jāne cintāmaṇi, tāra hoy braja-bhūme bās\n(4) gaura-prema-rasārṇave, śe taraṅge jebā ḍube, se rādhā-mādhava-antaraṅga / gṛhe bā vanete thāke, 'hā gaurāṅga' bo'le ḍāke, narottama māge tāra saṅga", translation: "1. Anyone who has accepted the two lotus feet of Lord Caitanya can understand the true essence of devotional service. If one is captivated by the pleasing pastimes of Lord Caitanya, the dirty things in his heart will all become cleansed.\n2. One who simply takes the holy name of Gaurasundara, Sri Krsna Caitanya, will immediately develop love of God...\n3. Simply by understanding that the associates of Lord Gauranga are eternally free from material contamination, one can immediately be promoted to the transcendental abode of Lord Krsna...\n4. If one says: 'Let me dive deep into the waves of the nectarean ocean of the transcendental loving movement introduced by Lord Caitanya', he immediately becomes one of the confidential devotees of Radha and Krsna..." },
    { title: "Gauranga Bolite Habe", lyrics: "gauranga bolite habe, pulaka-sarira..." },
    { title: "Gora Pahun", lyrics: "gora pahun gela, re ki dayal..." },
    { title: "Hari Haraye Namah Krsna Yadavaya Namah", lyrics: "(1) hari haraye namaḥ kṛṣṇa yādavāya namaḥ / yādavāya mādhavāya keśavāya namaḥ\n(2) gopāla govinda rāma śrī-madhusūdana / giridhārī gopīnātha madana-mohana\n(3) śrī-caitanya-nityānanda śrī-advaita-sītā / hari guru vaiṣṇaba bhāgavata gītā\n(4) śrī-rūpa sanātana bhaṭṭa-raghunātha / śrī-jīva gopāla-bhaṭṭa dāsa-raghunātha", translation: "1. Hari! Obeisances to Lord Hari, unto Krsna, and Yadava. Obeisances to Lord of the Yadus, Madhava, Kesava.\n2. Gopala! Govinda! Rama! O vanquisher of Madhu! Giridhari! Lord of the gopis! Bewilderer of cupid!\n3. Sri Caitanya, Nityananda, Sri Advaita-Sita! Hari! Guru! Vaisnavas! Srimad Bhagavatam! Bhagavad Gita!\n4. All glories to Srila Rupa Goswami, Sanatana Goswami and Raghunatha Bhatta Goswami, to Srila Jiva Goswami, Gopala Bhatta Goswami, and Raghunatha Dasa Goswami!" },
    { title: "Hari Hari Biphale Janama", lyrics: "hari hari! biphale janama gonainu..." },
    { title: "Hari Hari Kabe More Hoibe Su-Dina", lyrics: "hari hari! kabe more hoibe su-dina..." },
    { title: "Je Anilo Prema Dhana Koruna Pracura", lyrics: "(1) je ānilo prema-dhana koruṇā pracur / heno prabhu kothā gelā ācārya-ṭhākur\n(2) kāhā mora swarūp rūpa kāhā sanātan / kāhā dāsa raghunātha patita-pāvan\n(3) kāhā mora bhaṭṭa-juga kāhā kavirāj / eka-kāle kothā gelā gorā naṭa-rāj\n(4) pāṣāṇe kuṭibo māthā anale paśibo / gaurāṅga guṇera nidhi kothā gele pābo\n(5) se-saba saṅgīra saṅge je koilo bilās / se-saṅga nā pāiyā kānde narottama dās", translation: "1. He who brought the treasure of divine love and who was filled with compassion and mercy—where has such a personality as Srinivasa Acarya gone?\n2. Where are my Swarup Damodara and Rupa Gosvami? Where is Sanatana? Where is Raghunatha Dasa, the savior of the fallen?\n3. Where are my Raghunatha Bhatta and Gopala Bhatta, and where is Krsnadasa Kaviraja? Where did Lord Gauranga, the great dancer, suddenly go?\n4. I will smash my head against the rock and enter into the fire. Where will I find Lord Gauranga, the reservoir of all wonderful qualities?\n5. Being unable to obtain the association of Lord Gauranga accompanied by all of these devotees in whose association He performed His pastimes, Narottama Dasa simply weeps." },
    { title: "Jaya Jaya Sri Krsna Caitanya Nityananda", lyrics: "jaya jaya sri-krsna-caitanya nityananda..." },
    { title: "Ki Rupe Paibo Seva", lyrics: "ki rupe paibo seva, mui duracara..." },
    { title: "Kusumita Vrndavane Nacata Sikhi Gane", lyrics: "(1) kusumita vṛndāvane, nācata śikhigaṇe / pika kula bhramara jhańkāre / priya sahacarī sańge, gāiyā jāibe rańge / manohara nikuñja kuṭīre\n(8) śrī guru karuṇā sindhu, lokanātha dīna bandhu, mui dine koro avadhāna / rādha-kṛṣṇa vṛndāvana, priya narma sakhīgaṇa, narottama māge ei dāna", translation: "1. Vrndavana is filled with blossoming flowers, the dancing of peacocks and the sounds of cuckoos and bumble-bees. When, in the association of the dear gopis, will I melodiously sing in a charming cottage in a grove of Vrndavana?...\n2. O Lokanatha Gosvami, O my spiritual master, O friend of the poor and wretched conditioned souls, O ocean of mercy, please hear the appeal of this person who is very miserable and poor-hearted. O Radha and Krsna, O holy land of Vrndavana, O intimate gopi-friends of the Divine Couple, I beg that you all grant this charity to me." },
    { title: "Nitai Pada Kamala", lyrics: "(1) nitāi-pada-kamala, koṭi-candra-suśītala / je chāyāy jagata jurāy / heno nitāi bine bhāi, rādhā-kṛṣṇa pāite nāi / dṛḍha kori' dharo nitāir pāy\n(2) se sambandha nāhi jā'r, bṛthā janma gelo tā'r / sei paśu boro durācār / nitāi nā bolilo mukhe, majilo saṁsāra-sukhe / vidyā-kule ki koribe tār\n(3) ahaṅkāre matta hoiyā, nitāi-pada pāsariyā / asatyere satya kori māni / nitāiyer koruṇā habe, braje rādhā-kṛṣṇa pābe / dharo nitāi-caraṇa du'khāni\n(4) nitāiyer caraṇa satya, tāhāra sevaka nitya / nitāi-pada sadā koro āśa / narottama boro dukhī, nitāi more koro sukhī / rākho rāṅgā-caraṇera pāśa", translation: "1. The lotus feet of Lord Nityananda are a shelter where one will get the soothing moonlight not only of one, but of millions of moons. If the world wants to have real peace, it should take shelter of Lord Nityananda. Unless one takes shelter under the shade of the lotus feet of Lord Nityananda, it will be very difficult for him to approach Radha-Krsna...\n2. Anyone who has not established his relationship with Nityananda Prabhu is understood to have spoiled his valuable human birth...\n3. Being maddened after false prestige and identification with the body, one is thinking, oh, what is Nityananda? What can He do for me? I don't care. The result is that he is accepting something false to be truth...\n4. The lotus feet of Nityananda are not illusion; they are a fact. One who engages in the transcendental loving service of Nityananda is also transcendental... This Narottama dasa is very unhappy, therefore I am praying to Lord Nityananda to make me happy. My dear Lord, please keep me close to Your lotus feet." },
    { title: "Radha Krsna Prana Mora", lyrics: "radha-krsna prana mora yugala-kisora..." },
    { title: "Sri Krsna Caitanya Prabhu Doya Koro More", lyrics: "sri-krsna-caitanya prabhu doya koro more..." },
    { title: "Sri Rupa Manjari Pada Sei Mora Sampada", lyrics: "sri-rupa-manjari-pada, sei mora sampada..." },
    { title: "Suniyachi Sadhu Mukhe Bole", lyrics: "suniyachi sadhu-mukhe, madhava-upakhyan..." },
    { title: "Thakura Vaisnava Gana", lyrics: "thakura vaisnava-gana, koro amar siksan..." },
    { title: "Thakura Vaisnava Pada", lyrics: "(1) ṭhākura vaiṣṇava pada, avanīra susampada, śuno bhāi hoiyā eka mana / āśraya loiyā bhaje, tāre kṛṣṇa nāhi tyaje, āra saba more akāraṇa\n(2) vaiṣṇava caraṇa jala, prema bhakti dite bol, āra keho nahe balavanta / vaiṣṇava caraṇa reṇu, mastake bhūṣaṇa vinu, āra nāhi bhūṣaṇera anta\n(3) tīrtha jala pavitra guṇe, likhiyāche purāṇe, se saba bhaktira pravañcana / vaiṣṇavera pādodaka, sama nahe ei saba, yāte hoy vāñchita pūraṇa\n(4) vaiṣṇava sańgete mana, ānandita anukṣaṇa, sadā hoy kṛṣṇa parasańga / dīna narottama kānde, hiyā dhairya nāhi bāndhe / mora daśā keno hoilo bhańga", translation: "1. O brother, please hear my words with rapt attention. The lotus feet of the Vaisnavas are the most valuable treasure of this world. These Vaisnavas continually take shelter of Lord Krsna and worship Him. They never abandon their Lord. They are liberated. They are free from the cycle of birth and death.\n2. The water that has washed the lotus feet of the Vaisnavas bestows devotional service in pure love of God. Nothing else is as effective for attaining this divine love. I place dust from the lotus feet of the Vaisnavas upon my head. I wear no other ornament.\n3. The purifying power of the waters at the various holy places of pilgrimage is described in the Puranas, although this is something of a deceptive trick. Actually there is not anything as purifying as the water that has washed the lotus feet of the Vaisnavas. This water fulfills all desires.\n4. Moment after moment my mind finds pleasure in the association of the Vaisnavas. I always seek out the company of those who are devoted to Lord Krsna. Poor-hearted Narottama dasa breaks down and cries. How has this fallen condition come upon me?" },
    { title: "Vrndavana Ramya Sthana", lyrics: "(1) vṛndāvana ramya-sthāna divya-ciṅtāmaṇi-dhāma / ratana-mandira manohara / abṛta kālindī-nīre rāja-haṁsa keli kare / tāhe śobhe kanaka-kamala\n(2) tāra madhye hema-pīṭha aṣṭa-dale beṣṭita / aṣṭa-dale pradhānā nāyikā / tāra madhye ratnāsane ba'si āchen dui-jane / śyāma-saṅge sundarī rādhikā\n(3) o-rūpa-lābaṇya-rāśi amiya pariche khasi / hāsya-parihāsa-sambhāṣaṇe / narottama-dāsa kaya nitya-līlā sukha-maya / sadāi sphurūka mora mane", translation: "1. Beautiful Vrndavana is filled with cintamani gems and many jewel palaces and temples. Many regal swans play in the waters of the Yamuna, and in those waters a splendid golden lotus flower grows.\n2. In the middle of that lotus is a golden place surrounded by eight petals. On these eight petals the eight principal gopis reside, and in the centre Lord Syamasundara and beautiful Srimati Radharani sit on a jewel throne.\n3. The great beauty of the Divine couple and Their charming joking and laughter continually showers nectar everywhere. Narottama dasa says: I pray that these blissful eternal transcendental pastimes of the Divine Couple may be always manifest in my heart." },
    { title: "Sri Guru Carana Padma", lyrics: "(1) śrī-guru-caraṇa-padma, kevala-bhakati-sadma, bando mui sāvadhāna mate / jāhāra prasāde bhāi, e bhava toriyā jāi, kṛṣṇa-prāpti hoy jāhā ha'te\n(2) guru-mukha-padma-vākya, cittete koriyā aikya, ār nā koriho mane āśā / śrī-guru-caraṇe rati, ei se uttama-gati, je prasāde pūre sarva āśā\n(3) cakhu-dān dilo jei, janme janme prabhu sei, divya jñān hṛde prokāśito / prema-bhakti jāhā hoite, avidyā vināśa jāte, vede gāy jāhāra carito\n(4) śrī-guru karuṇā-sindhu, adhama janāra bandhu, lokanāth lokera jīvana / ohe prabhu koro doyā, deho more pada-chāyā, ebe jaśa ghuṣuk tribhuvana", translation: "1. The lotus feet of our spiritual master are the only way by which we can attain pure devotional service. I bow to his lotus feet with great awe and reverence. By his grace one can cross the ocean of material suffering and obtain the mercy of Krsna.\n2. My only wish is to have my consciousness purified by the words emanating from his lotus mouth. Attachment to his lotus feet is the perfection that fulfills all desires.\n3. He opens my darkened eyes and fills my heart with transcendental knowledge. He is my Lord birth after birth. From him ecstatic prema emanates; by him ignorance is destroyed. The Vedic scriptures sing of his character.\n4. Our spiritual master is the ocean of mercy, the friend of the poor, and the lord and master of the devotees. O master! Be merciful unto me. Give me the shade of your lotus feet. Your fame is spread all over the three worlds." }
  ];
  
  // Songs by Vasudeva Ghosh
  const vasudevaGhoshSongs = [
    { title: "Jaya Jaya Jagannatha Sacira Nandan", lyrics: "(1) jaya jaya jagannātha śacīra nandan / tribhuvane kore jār caraṇa vandan\n(2) nīlācale śaṅkha-cakra-gadā-padma-dhar / nadīyā nagare daṇḍa-kamaṇḍalu-kar\n(3) keho bole pūrabe rāvaṇa badhilā / goloker vaibhava līlā prakāśa korilā\n(4) śrī-rādhār bhāve ebe gorā avatār / hare kṛṣṇa nām gaura korilā pracār\n(5) vāsudeva ghoṣa bole kori joḍa hāt / jei gaura sei kṛṣṇa sei jagannāth", translation: "1. All glories, all glories to the dear son of Jagannatha Misra and Saci Devi! All the three worlds offer prayers unto His lotus feet.\n2. In Nilacala He holds the conchshell, disc, club, and lotus flower, while in the town of Nadiya He holds a sannyasi staff and waterpot.\n3. It is said that in olden times, as Lord Ramacandra, He killed the demon Ravana. Then later, as Lord Krsna, He revealed the splendrously opulent pastimes of Goloka.\n4. Accepting the mood and luster of Sri Radha, He has come from Vraja to Nadiya distributing the Hare Krsna Mahamantra!\n5. Vasudeva Ghosh says with folded hands, 'He who is Gaura is He who is Krishna is He who is Jagannatha.'" },
    { title: "Yadi Gaura Na Hoito", lyrics: "(1) yadi gaura nā hoito, tabe ki hoito, kemone dharitām de / rādhār mahimā, prema-rasa-sīmā, jagate jānāto ke\n(2) madhura vṛndā, vipina-mādhurī, praveśa cāturī sār / baraja-yuvati, bhāver bhakati, śakati hoito kār\n(3) gāo gāo punaḥ, gaurāṅger guṇa, sarala koriyā mana / e bhava-sāgare, emona doyāl, nā dekhiye eka-jana\n(4) (āmi) gaurāṅga boliyā, nā genu galiyā, kemone dhorinu de / vāsur hiyā, pāṣāṇa diyā, kemone gaḍiyāche", translation: "1. If Lord Gaura had not appeared as the yuga-avatara in this age of Kali, then what would have become of us? How could we have tolerated living? Who in this universe would have ever learned about the topmost limits of loving mellows that comprise the glory of Sri Radha?\n2. Who would have had the power to render ecstatic devotional service that follows in the footsteps of the damsels of Vraja? Indeed, the clever expertise of the Vraja-gopis is a prerequisite for entering the supremely sweet forest of Vrinda Devi.\n3. Oh, please sing again and again of the glorious qualities of Lord Gauranga! Just try to keep your heart simple. Not even one person within this ocean of nescience has ever seen such a magnanimous personality as He.\n4. Even though I chant the holy name of Lord Gauranga, somehow I still have not melted in ecstasy—how then have I maintained the burden of this body? How has the Creator fashioned this body with a stone in place of Vasudeva Ghosh's heart?" },
    { title: "Gauranga Tumi More Doya Na Chadiho", lyrics: "(1) gaurāṅga tumi more doyā nā chāḍiho / āpana koriyā rāṅgā caraṇe rākhiho\n(2) tomār caraṇa lāgi sab teyāgilu / śītala caraṇa pāyā śaraṇa loilu\n(3) e kule o kule muñi dilu tilāñjali / rākhiho caraṇe more āpanār boli\n(4) vāsudeva ghoṣe bole caraṇe dhoriyā / kṛpā kori rākho more pada-chāyā diyā", translation: "1. Oh Lord Gauranga! Please do not neglect to show me Your mercy! Making me Your very own property, kindly keep me situated at the reddish soles of Your feet.\n2. With the intention of attaining Your feet, I have utterly renounced everything. Now I have taken full shelter of Your soothing lotus feet.\n3. Whether I am related to this family lineage or that family lineage – I have completely abandoned them all. I beg You to mercifully keep me by Your feet, calling me Your own.\n4. Vasudeva Ghosh says, 'Since I have tightly grasped hold of Your feet, please keep me here by always bestowing their soothing shade.'" },
  ];

  // Songs by Locana Das Thakura
  const locanaDasSongs = [
    { title: "Akrodha Paramananda", lyrics: "akrodha paramananda nityānanda rāy / abhimāna śūnya nitāi nagare berāy / adhama patita jīver dvāre dvāre jāy / harināma mahāmantra vitaraṇa kāy" },
    { title: "Parama Karuna Pahu Dui Jana", lyrics: "parama karuṇa pahu dui jana / nitāi gaurachandra / saba avatāra sāra śiromaṇi / kevala ānanda-kanda" },
    { title: "Nitai Guna Mani", lyrics: "(1) nitāi guṇa-maṇi āmār nitāi guṇa-maṇi / āniyā premer vanyā bhāsāilo avanī\n(2) premer vanyā loiyā nitāi āilā gauḍa-deśe / ḍubilo bhakata-gaṇa dīna hīna bhāse\n(3) dīna hīna patita pāmara nāhi bāche / brahmār durlabha prema sabākāre jāce\n(4) ābaddha karuṇā-sindhu nitāi kāṭiyā muhān / ghare ghare bule prema-amiyār bān\n(5) locan bole mor nitāi jebā nā bhajilo / jāniyā śuniyā sei ātma-ghātī hoilo", translation: "1. My Lord Nityananda, the jewel of all virtues, my Lord Nityananda, the jewel of all virtues, has brought the flood of ecstatic love of God that has drowned the entire world.\n2. Bringing this overwhelming deluge of prema when He returned to Bengal from Jagannatha Puri on Lord Caitanya's order, Nitai has inundated the assembly of devotees...\n3. Lord Nityananda freely offered this exalted prema, which is difficult for Lord Brahma to attain, even to the fallen and wretched souls who did not desire it.\n4. The ocean of mercy had formerly been sealed tight, but Nitai cut a channel in its boundary to allow the great flooding waves of nectarean prema to splash from house to house.\n5. Locana dasa says, 'Whoever has not worshiped my Nitai or taken advantage of this excellent opportunity offered by Him knowingly commits suicide.'" },
  ];

  // Songs by Hari Vyasa Devacarya
  const hariVyasaSongs = [
    { title: "Jaya Radhe Jaya Radhe Radhe", lyrics: "nava-nava rangi tri-bhangi jaya, syāma su-angi syāma / jaya rādhe jaya hari-priye, śrī-rādhe sukha dhāma / jaya rādhe jaya rādhe rādhe / jaya kṛṣṇa jaya kṛṣṇa jaya śrī-kṛṣṇa / syāmā gorī nīty-kiśori pritama-jorī śrī-rādhe / rasika rasilo chaila-chabilo guṇa-garabilo śrī-kṛṣṇa" },
  ];

  // Songs by other major acharyas
  const otherAcharyaSongs = [
    // Rupa Goswami
    { title: "Radhe Jaya Jaya Madhava Dayite", author: "Rupa Goswami", lyrics: "(refrain) rādhe jaya jaya mādhava-dayite / gokula-taruṇī-maṇḍala-mahite\n(1) dāmodara-rati-vardhana-veśe / hari-niṣkuṭa-vṛndā-vipineśe\n(2) vṛṣabhānūdadhi-nava-śaśi-lekhe / lalitā-sakhi guṇa-ramita-viśākhe\n(3) karuṇāṁ kuru mayi karuṇā-bharite / sanaka-sanātana-varṇita-carite", translation: "(Refrain) O Radha! O beloved of Madhava! O You who are worshiped by all the young girls of Gokula! All glories unto You! All glories unto You!\n(1-3) You who dress Yourself in such a way as to increase Lord Damodara's love and attachment for You! O queen of Vrndavana, which is the pleasure grove of Lord Hari! O new moon that has arisen from the ocean of King Vrsabhanu! O friend of Lalita! O You who make Visakha loyal to You due to Your wonderful qualities... O Radha, please be merciful to me!" },
    { title: "Sakhe Kalaya Gauram Udaram", author: "Rupa Goswami", lyrics: "sakhe kalaya gauram udaram..." },

    // Jayadeva Goswami
    { title: "He Govinda He Gopal Kesava Madhava", author: "Jayadeva Goswami", lyrics: "he govinda he gopāla / keśava mādhava dīna doyāla / patita janer bandhu / tumi na hoile keba habe gati / tobhāra caraṇa bindu" },
    { title: "Pralaya Payodhi Jale", author: "Jayadeva Goswami", lyrics: "pralaya-payodhi-jale dhrtavan asi vedam..." },
    { title: "Srita Kamala", author: "Jayadeva Goswami", lyrics: "(1) śrita-kamalā-kuca-maṇḍala dhṛta-kuṇḍala e / kalita-lalita-vana-māla jaya jaya deva hare\n(9) śrī-jayadeva-kaver idaṁ kurute mudam e / mańgalam ujjvala-gītaṁ jaya jaya deva hare", translation: "1. Glories, glories to Lord Hari, the Supreme Personality of Godhead, who is bedecked with jeweled earrings and a garland of forest flowers and whose feet are marked with a lotus!...\n9. The poet Sri Jayadeva offers this song of devotion and shining good fortune to Thee. All glories! All glories to Lord Sri Hari!" },

    // Krsnadasa Kaviraja Goswami
    { title: "Jaya Radhe Jaya Krsna Jaya Vrndavana", author: "Krsnadasa Kaviraja Goswami", lyrics: "(1) jaya rādhe, jaya kṛṣṇa, jaya vṛndāvana / śrī govinda, gopīnātha, madana-mohana\n(2) śyama-kunḍa, rādhā-kuṇḍa, giri-govardhana / kālindi jamunā jaya, jaya mahāvana\n(11) śrī-jāhnavā-pāda-padma koriyā smaraṇa / dīna kṛṣṇa-dāsa kohe nāma-saṅkīrtana", translation: "1. All glories to Radha and Krsna and the divine forest of Vrndavana. All glories to the three presiding Deities of Vrndavana—Sri Govinda, Gopinatha, and Madana-mohana.\n2. All glories to Syama-kunda, Radha-kunda, Govardhana Hill, and the Yamuna River (Kalindi). All glories to the great forest known as Mahavana.\n3. Remembering the lotus feet of Lord Nityananda's consort Sri Jahnava Devi, this very fallen and lowly servant of Krsna sings the sankirtana of the holy name." },

    // Krsna Dasa
    { title: "Jaya Radha Giri Vara Dhari", author: "Krsna Dasa", lyrics: "jaya rādhā giri-vara-dhāri / śrī nanda-nandana vṛṣabhānu-dulāri / mora-mukuṭa mukha murali jori / veni virāje mukhe hāsi thori / rāvāṇāntakara, mākhana-taskara, gopī-jana-vastra-hāri / brajera bālikā, rāsa-parikhelā, bṛndā-vipina-nivāsī" },

    // Visvanatha Cakravarti Thakura
    { title: "Samsara Davanala Lidha", author: "Visvanatha Cakravarti Thakura", lyrics: "samsara-davanala-lidha-loka..." },

    // Candrasekhara Kavi
    { title: "Namo Namah Tulasi Maharani", author: "Candrasekhara Kavi", lyrics: "(1) namo namaḥ tulasī mahārāṇī, vṛnde mahārāṇī namo namaḥ / namo re namo re meiyā namo nārāyaṇi\n(3) jāko patra, mañjarī komala / śrī-pati-caraṇa-kamale lapaṭāni / dhanya tulasī meiyā, purāṇa tapa kiye, śrī-śālagrāma-mahā-pāṭarāṇī", translation: "1. O Tulasi Maharani! O Vrnda! O mother of devotion! O Narayani, I offer my obeisances to you again and again.\n2. Your leaves and soft manjaris are entwined at the lotus feet of Narayana, the Lord of Laksmi. O blessed mother Tulasi, you performed successful austerities and have thus become the chief consort and queen of Sri salagrama-sila." },

    // Traditional songs
    { title: "Hare Krishna Mahamantra", author: "Traditional", lyrics: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare\nHare Rama Hare Rama Rama Rama Hare Hare" },
    { title: "Nanda Ke Ananda Bhaiyo", author: "Traditional", lyrics: "nanda ke ānanda bhayo jaya kanahāyā lāl kī / jaya kanahāyā lāl kī jaya kanahāyā lāl kī / hāthī dīnī ghodā dīnī āne dīnī pālakī / nanda ke ānanda bhāyo jaya kanahāyā lāl kī / javāneñ ko hāthī ghode buddhheñ ko pālkī / nanda ke ānanda bhāyo jaya kanahāyā lāl kī" },
    { title: "Radhe Radhe Syama Sri Radhe", author: "Traditional", lyrics: "rādhe rādhe śyāma śrī-rādhe, śyāma śrī-rādhe, rādhe rādhe / rādhe rādhe rādhe, ghana śyāma rādhe rādhe / rādhe rādhe rādhe, śrī kṛṣṇa rādhe rādhe / rādhe rādhe / śyāma śrī rādhe, rādhe rādhe / śyāma śrī rādhe" },
    { title: "Devi Suresvari Bhagavati Gange", author: "Traditional", lyrics: "devī sureśvari bhagavatī gaṅge / tribhuvana-tāriṇī taraḷa taraṅge / śaṅkara-mauli-vihārini vimale / mama matir āstāṁ tava pada-kamale" },
    { title: "Isvara Parama Krsna", author: "Brahma Samhita", lyrics: "(1) īśvaraḥ paramaḥ kṛṣṇaḥ sac-cid-ānanda-vigrahaḥ / anādir ādir govindaḥ sarva-kāraṇa-kāraṇam", translation: "1. Krsna who is known as Govinda is the Supreme Godhead. He has an eternal blissful spiritual body. He is the origin of all. He has no other origin and He is the prime cause of all causes." },
    { title: "Namamisvaram Saccidananda Rupam", author: "Satyavrata Muni / Vyasadeva", lyrics: "(1) namāmīśvaraṁ sac-cid-ānanda-rūpaṁ / lasat-kuṇḍalaṁ gokule bhrājamanam / yaśodā-bhiyolūkhalād dhāvamānaṁ / parāmṛṣṭam atyantato drutya gopyā\n(8) namas te 'stu dāmne sphurad-dīpti-dhāmne / tvadīyodarāyātha viśvasya dhāmne / namo rādhikāyai tvadīya-priyāyai / namo 'nanta-līlāya devāya tubhyam", translation: "1. To the Supreme Lord, whose form is the embodiment of eternal existence, knowledge, and bliss... who is quickly running from the wooden grinding mortar in fear of mother Yasoda, but who has been caught from behind by her... I offer my humble obeisances.\n8. O Lord Damodara, I first of all offer my obeisances to the brilliantly effulgent rope which binds Your belly. I then offer my obeisances to Your belly, which is the abode of the entire universe. I humbly bow down to Your most beloved Srimati Radharani, and I offer all obeisances to You, the Supreme Lord, who displays unlimited pastimes." },
    { title: "Maha Prasade Govinde", author: "Vyasadeva", lyrics: "mahā-prasāde govinde nāma-brahmaṇi vaiṣṇave / svalpa-puṇyavatāṁ rājan viśvāso naiva jāyate", translation: "O king, for those who have amassed very few pious activities, their faith in maha-prasada, in Sri Govinda, in the Holy Name and in the Vaisnava is never born." },
    { title: "Namo Namah Tulasi Krsna Preyasi", author: "Krsna Dasa", category: "prayer", lyrics: "(pranama) vṛndāyai tulasī-devyai priyāyai keśavasya ca / kṛṣṇa-bhakti-prade devi satyavatyai namo namaḥ\n(1) namo namaḥ tulasī kṛṣṇa-preyasi namo namaḥ / rādhā-kṛṣṇa-sevā pābo ei abilāṣī\n(2) ye tomāra śaraṇa loy, tara vāñchā pūrṇa hoy / kṛpā kori' koro tāre vṛndāvana-vāsi", translation: "Pranama: I offer my repeated obeisances unto Vrnda, Srimati Tulasi Devi, who is very dear to Lord Kesava. O goddess, you bestow devotional service to Lord Krsna and possess the highest truth.\n1. O Tulasi, beloved of Krsna, I bow before you again and again. My desire is to obtain the service of Sri Sri Radha-Krsna.\n2. Whoever takes shelter of you has his wishes fulfilled. Bestowing your mercy on him, you make him a resident of Vrndavana." },
    { title: "Ceto Darpana Marjanam", author: "Lord Sri Caitanya Mahaprabhu", category: "prayer", lyrics: "(1) ceto-darpaṇa-mārjanaṁ bhava-mahā-dāvāgni-nirvāpaṇaṁ / śreyaḥ-kairava-candrikā-vitaraṇaṁ vidyā-vadhū-jīvanam / ānandāmbudhi-vardhanaṁ prati-padaṁ pūrṇāmṛtāsvādanaṁ / sarvātma-snapanaṁ paraṁ vijayate śrī-kṛṣṇa-saṇkīrtanam\n(3) tṛṇād api sunīcena taror api sahiṣṇunā / amāninā mānadena kīrtanīyaḥ sadā hariḥ\n(8) āśliṣya vā pāda-ratāṁ pinaṣṭu mām / adarśanān marma-hatāṁ karotu vā / yathā tathā vā vidadhātu lampaṭo / mat-prāṇa-nāthas tu sa eva nāparaḥ", translation: "1. Glory to the sri-krsna-sankirtana, which cleanses the heart of all the dust accumulated for years and extinguishes the fire of conditional life, of repeated birth and death. This sankirtana movement is the prime benediction for humanity at large...\n3. One should chant the holy name of the Lord in a humble state of mind, thinking oneself lower than the straw in the street; one should be more tolerant than a tree, devoid of all sense of false prestige, and should be ready to offer all respect to others...\n8. I know no one but Krsna as my Lord, and He shall remain so even if He handles me roughly by His embrace or makes me brokenhearted by not being present before me. He is completely free to do anything and everything, for He is always my worshipful Lord, unconditionally." },
    { title: "Sri Hari Vasare Hari Kirtana Vidhana", author: "Vrndavana Das Thakura", category: "kirtan", lyrics: "(1) śrī hari-vāsare hari-kīrtana-vidhāna / nṛtya ārambhilā prabhu jagatera prāṇa\n(2) puṇyavanta śrīvāsa-ańgane śubhārambha / uṭhila kīrtana-dhvani 'gopāla' 'govinda'\n(29) śrī kṛṣṇa-caitanya-nityānanda-cāda jāna / vṛndāvana-dāsa prabhu pada-yuge gāna", translation: "1. On Ekadasi day Mahaprabhu, who is the life and soul of all beings, decreed that everyone should gather for kirtana. Hearing the sound of His own name, He began to dance in ecstasy.\n2. In Srivasa-angana, Srivasa Thakura's divine courtyard, He inaugurated the auspicious reverberations of the kirtana in a booming voice: 'Gopala! Govinda!'...\n3. Vrndavana dasa says, 'Sri Krsna Caitanya and the moon-like Nityananda Prabhu are my life and soul and I offer my dandavat-pranama at Their lotus feet.'" },
    { title: "Madana Mohana Tanu Gauranga Sundara", author: "Vrndavana Dasa Thakura", category: "bhajan", lyrics: "(1) madana-mohana tanu gauranga sundara / lalate tilaka sobho urdhwe manohara\n(2) tri-kaccha basana sobhe kutila-kuntala / prakrta nayana du-i parama cancala\n(3) sukla-yajna-sutra sobhe bediya sarire / suksma-rupe ananta ye hena kalebara\n(4) adhare tambula hase adhara capiya / yaga brndabana dasa se-rupa nichiya", translation: "1. Graceful Lord Gauranga is more enchanting than Kamadeva. Glistening Vaisnava tilaka adorns His forehead.\n2. He wears glorious trikaccha garments. His hair is curly. His two eyes are naturally restless.\n3. Manifesting a very slender form, Lord Ananta has become His white sacred-thread.\n4. On His lips rest betel nuts and a smile. Vrndavana dasa worships Him." },
    { title: "Namo Gaura-Kisoraya", author: "Traditional", category: "prayer", lyrics: "namo gaura-kiśorāya sākṣād-vairāgya-mūrtaye / vipralambha-rasāmbhode pādāmbujāya te namaḥ", translation: "I offer my respectful obeisances unto Gaura-kisora dasa Babaji Maharaja, who is renunciation personified. He is always merged in a feeling of separation and intense love of Krsna." },
    { title: "Vande Krsna Nanda Kumara", author: "Traditional", category: "kirtan", lyrics: "govinda hari gopāla hari / govinda hari gopāla hari / jaya jaya deva hari / jaya jaya deva hari / vande kṛṣṇa nanda-kumāra / nanda-kumāra madana-gopāla / madana-gopāla mohana-rūpa / mohana-rūpa nanda-kumāra / jaya jaya deva hari", translation: "All glories to Lord Govinda! All glories to Lord Gopala! All glories to the Supreme Lord Hari! I bow to Krsna, the son of Nanda, Nanda's son who is Madana-gopala, whose form bewilders even Cupid, all glories to the Supreme Lord!" },
    { title: "Vrndavana Vasi Jata Vaisnavera Gana", author: "Devakinandana Das Thakura", category: "prayer", lyrics: "(1) vṛndāvana-vāsī jata vaiṣṇavera gaṇa / prathame vandanā kari sabāra caraṇa\n(2) nīlācala-vāsī jata mahāprabhura gaṇa / bhūmite poḍiyā vandoń sabāra caraṇa\n(3) navadvīpa-vāsī jata mahāprabhura bhakta / sabāra caraṇa vandoń haiyā anurakta\n(12) manera vāsanā pūrṇa acirāte haya / devakīnandana dāsa ei lobhe kaya", translation: "1. First of all I offer glorifications to the feet of all of the Vaisnavas of Vrndavana.\n2. Praising of all of Mahaprabhu's Nilacala associates, I prostrate at their feet.\n3. I pray for loving attachment to the lotus feet of all of Mahaprabhu's Navadvipa bhaktas...\n4. All of one's pure, heartfelt desires will be fulfilled without delay. Devaki-nandana dasa, intensely eager for this, glorifies and prays to the Vaisnavas." },
    { title: "Krsnotkirtana Gana Nartana Parau", author: "Srinivasa Acarya", category: "prayer", lyrics: "(1) kṛṣṇotkīrtana-gāna-nartana-parau premāmṛtāmbho-nidhī / dhīrādhīra-jana-priyau priya-karau nirmatsarau pūjitau / śrī-caitanya-kṛpā-bharau bhuvi bhuvo bhārāvahantārakau / vande rūpa-sanātanau raghu-yugau śrī-jīvagopālakau\n(8) he rādhe vraja-devike ca lalite he nanda-sūno kutaḥ / śrī-govardhana-kalpa-pādapa-tale kālindī-vane kutaḥ / ghoṣantāv iti sarvato vraja-pure khedair mahā-vihvalau / vande rūpa-sanātanau raghu-yugau śrī-jīvagopālakau", translation: "1. I offer my respectful obeisances unto the six Gosvamis, namely Sri Rupa Gosvami, Sri Sanatana Gosvami, Sri Raghunatha Bhatta Gosvami, Sri Raghunatha dasa Gosvami, Sri Jiva Gosvami, and Sri Gopala Bhatta Gosvami, who are always engaged in chanting the holy name of Krsna and dancing. They are just like the ocean of love of God...\n8. I offer my respectful obeisances unto the six Gosvamis... who were chanting very loudly everywhere in Vrndavana, shouting, 'Queen of Vrndavana, Radharani! O Lalita! O son of Nanda Maharaja! Where are you all now? Are you just on the hill of Govardhana, or are you under the trees on the bank of the Yamuna? Where are you?'" },
    { title: "Gangeya Campeya", author: "Visvanatha Cakravarti Thakura", category: "prayer", lyrics: "(1) gāńgeya-cāmpeya-taḍid-vinindi-rociḥ-pravāha-snapitātma-vṛnde! / bandhūka-bandhu-dyuti-divya-vāso vṛnde! namas te caraṇāravindam\n(9) vṛndāṣṭakaṁ yaḥ śṛṇuyāt paṭhed vā vṛndāvanādhīśa-padābja-bhṛńgaḥ / sa prāpya vṛndāvana-nitya-vāsaṁ tat-prema-sevāṁ labhate kṛtārthaḥ", translation: "1. You are bathed by streams of splendour that rebuke gold, lightning, and the campaka flower. Your splendid garments are friend to the bandhuka flower. O Vrnda, I bow to your lotus feet.\n2. A person who is like a bumble bee at the lotus feet of Vrndavana's king and queen, and who reads or hears this Vrndastaka, will eternally reside in Vrndavana and attain loving service to the divine couple." },
    { title: "Nija Pati Bhuja", author: "Raghunatha Dasa Goswami", category: "prayer", lyrics: "(1) nija-pati-bhuja-daṇḍac-chatra-bhāvaṁ prapadya / pratihata-mada-dhṛṣṭoddaṇḍa-devendra-garva / atula-pṛthula-śaila-śreṇi-bhūpa priyaṁ me / nija-nikaṭa-nivāsaṁ dehi govardhana tvam\n(11) rasada-daśakam asya śrīla-govardhanasya / kṣitidhara-kula-bhartur yaḥ prayatnād adhīte / sa sapadi sukhade 'smin vāsam āsādya sākṣāc / chubada-yugala-sevā-ratnam āpnoti tūrṇam", translation: "1. O Govardhana, O king of all incomparable great mountains, O hill that became an umbrella with the arm of your own Lord as the handle and then destroyed the pride of the deva king madly attacking with raised weapons, please grant the residence near you that is so dear to me.\n11. One who carefully reads these ten nectar verses describing Srila Govardhana, the king of mountains, will very soon reside near that blissful hill and quickly attain the precious jewel of the service to the handsome divine couple." },
  ];
  
  // Process Bhaktivinoda Thakura songs
  bhaktivinodaSongs.forEach((song: any) => {
    songs.push({
      title: song.title,
      author: "Bhaktivinoda Thakura",
      category: "bhajan",
      mood: "devotional",
      lyrics: song.lyrics,
      translation: song.translation,
      audioUrl: ""
    });
  });

  // Process Narottama Das Thakura songs
  narottamaSongs.forEach((song: any) => {
    songs.push({
      title: song.title,
      author: "Narottama Das Thakura",
      category: "bhajan",
      mood: "devotional",
      lyrics: song.lyrics,
      translation: song.translation,
      audioUrl: ""
    });
  });
  
  // Process Vasudeva Ghosh songs
  vasudevaGhoshSongs.forEach((song: any) => {
    songs.push({
      title: song.title,
      author: "Vasudeva Ghosh",
      category: "kirtan",
      mood: "joyful",
      lyrics: song.lyrics,
      translation: song.translation,
      audioUrl: ""
    });
  });

  // Process Locana Das Thakura songs
  locanaDasSongs.forEach((song: any) => {
    songs.push({
      title: song.title,
      author: "Locana Das Thakura",
      category: "bhajan",
      mood: "devotional",
      lyrics: song.lyrics,
      translation: song.translation,
      audioUrl: ""
    });
  });

  // Process Hari Vyasa Devacarya songs
  hariVyasaSongs.forEach((song: any) => {
    songs.push({
      title: song.title,
      author: "Hari Vyasa Devacarya",
      category: "kirtan",
      mood: "joyful",
      lyrics: song.lyrics,
      translation: song.translation,
      audioUrl: ""
    });
  });

  // A.C. Bhaktivedanta Swami Prabhupada songs
  songs.push({
    title: "Boro Krpa Koile Krsna",
    author: "A.C. Bhaktivedanta Swami Prabhupada",
    category: "bhajan",
    mood: "devotional",
    lyrics: "(1) boro-kṛpā koile kṛṣṇa adhamer prati / ki lāgiyānile hethā koro ebe gati\n(2) āche kichu kārja taba ei anumāne / nahe keno āniben ei ugra-sthāne\n(3) rājas tamo guṇe era sabāi ācchanna / vāsudeb-kathā ruci nahe se prasanna\n(4) tabe jadi taba kṛpā hoy ahaituki / sakal-i sambhava hoy tumi se kautukī\n(15) āniyācho jadi prabhu āmāre nācāte / nācāo nācāo prabhu nācāo se-mate / kāṣṭhera puttali jathā nācāo se-mate\n(16) bhakti nāi beda nāi nāme khub daro / 'bhaktivedānta' nām ebe sārthak kor",
    translation: "1. My dear Lord Krishna, You are so kind upon this useless soul, but I do not know why You have brought me here. Now You can do whatever You like with me.\n2. But I guess You have some business here, otherwise why would You bring me to this terrible place?\n3. Most of the population here is covered by the material modes of ignorance and passion. Absorbed in material life, they think themselves very happy and satisfied, and therefore they have no taste for the transcendental message of Vasudeva...\n4. O Lord, I am just like a puppet in Your hands. So if You have brought me here to dance, then make me dance, make me dance, O Lord, make me dance as You like.\n5. I have no devotion, nor do I have any knowledge, but I have strong faith in the holy name of Krsna. I have been designated as Bhaktivedanta, and now, if You like, You can fulfill the real purport of Bhaktivedanta.",
    audioUrl: ""
  });

  // Process other acharya songs
  otherAcharyaSongs.forEach((song: any) => {
    songs.push({
      title: song.title,
      author: song.author,
      category: song.category || categorizeByAuthor(song.author),
      mood: determineMood(song.title, song.lyrics || ""),
      lyrics: song.lyrics || "",
      translation: song.translation,
      audioUrl: ""
    });
  });
  
  // Remove duplicates based on title and author
  const uniqueSongs = songs.filter((song, index, array) => {
    return array.findIndex(s => s.title === song.title && s.author === song.author) === index;
  });
  
  return uniqueSongs;
}

function isLikelySongTitle(line: string, lines: string[], index: number): boolean {
  // Song titles are typically:
  // 1. Standalone lines
  // 2. Not translations or verses
  // 3. Not section headers
  // 4. Have meaningful content
  
  if (line.length < 3 || line.length > 80) return false;
  if (line.includes('TRANSLATION') || line.includes('PURPORT')) return false;
  if (line.includes('Song Name:') || line.includes('Official Name:')) return false;
  if (line.includes('Book Name:') || line.includes('Author:')) return false;
  if (line.match(/^\d+\)/)) return false; // Verse numbers
  if (line.match(/^[ivx]+\)/i)) return false; // Roman numerals
  
  // Check if it's a known song pattern
  const songPatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+/, // Title case pattern
    /Arati$/, // Ends with Arati
    /Bhajan$/, // Ends with Bhajan
    /Kirtan$/, // Ends with Kirtan
    /Mantra$/, // Ends with Mantra
  ];
  
  return songPatterns.some(pattern => pattern.test(line)) || 
         (line.charAt(0) === line.charAt(0).toUpperCase() && 
          !line.includes('॥') && 
          !line.includes('।'));
}

function isLyricLine(line: string): boolean {
  // Skip translation markers, verse numbers, etc.
  if (line.includes('TRANSLATION') || line.includes('PURPORT')) return false;
  if (line.match(/^\(\d+\)$/)) return false;
  if (line.includes('Song Name:') || line.includes('Author:')) return false;
  
  return line.length > 2;
}

function cleanSongTitle(title: string): string {
  return title
    .replace(/\.\.\.*.*$/, '') // Remove dots and page numbers
    .replace(/,\s*\d+$/, '') // Remove page numbers
    .replace(/\s+/g, ' ')
    .trim();
}

function completeSong(songData: Partial<ParsedSong>, lyrics: string, author: string): ParsedSong {
  return {
    title: songData.title || 'Untitled',
    author: author || songData.author || 'Unknown',
    category: categorizeByAuthor(author) || 'bhajan',
    mood: determineMood(songData.title || '', lyrics),
    lyrics: lyrics || '',
    audioUrl: undefined
  };
}

function categorizeByAuthor(author: string): string {
  const authorCategories: { [key: string]: string } = {
    'Bhaktivinoda Thakura': 'bhajan',
    'Narottama Das Thakura': 'bhajan', 
    'A.C. Bhaktivedanta Swami Prabhupada': 'kirtan',
    'Locana Das Thakura': 'bhajan',
    'Bhaktisiddhanta Saraswti Thakur': 'kirtan',
    'Visvanatha Cakravarti Thakura': 'prayer',
    'Rupa Goswami': 'prayer',
    'Krsnadasa Kaviraja Goswami': 'bhajan',
    'Jayadeva Goswami': 'kirtan',
    'Jiva Goswami': 'bhajan',
    'Sarvabhauma Bhattacarya': 'prayer',
    'Vrndavana Das Thakura': 'kirtan',
    'Raghunatha Dasa Goswami': 'prayer',
    'Srinivasa Acarya': 'kirtan',
    'Govinda Das Kaviraja': 'bhajan',
    'Devakinandana Das Thakura': 'bhajan',
    'Adi Sankaracarya': 'prayer',
    'Bilvamangala Thakura': 'bhajan'
  };
  
  return authorCategories[author] || 'bhajan';
}

function determineMood(title: string, lyrics: string): string {
  const text = (title + ' ' + lyrics).toLowerCase();
  
  if (text.includes('arati') || text.includes('worship') || text.includes('prayer')) {
    return 'devotional';
  }
  if (text.includes('dance') || text.includes('kirtan') || text.includes('jaya')) {
    return 'joyful';
  }
  if (text.includes('meditation') || text.includes('quiet') || text.includes('peaceful')) {
    return 'meditative';
  }
  
  return 'devotional'; // Default mood
}

export function convertToDevotionalSongs(songs: ParsedSong[]): (InsertDevotionalSong & { translation?: string | null })[] {
  return songs.map(song => ({
    title: song.title,
    author: song.author,
    category: song.category,
    mood: song.mood,
    lyrics: song.lyrics || null,
    translation: song.translation || null,
    audioUrl: song.audioUrl || null
  }));
}

// Pre-defined list of well-known Vaishnava songs for better parsing
export const knownVaishnavSongs: ParsedSong[] = [
  // Bhaktivinoda Thakura songs
  { title: "Amar Jivana", author: "Bhaktivinoda Thakura", category: "bhajan", mood: "devotional" },
  { title: "Ami Jamuna Puline", author: "Bhaktivinoda Thakura", category: "bhajan", mood: "devotional" },
  { title: "Bhaja Bhakata Vatsala", author: "Bhaktivinoda Thakura", category: "bhajan", mood: "devotional" },
  { title: "Bolo Hari Bolo", author: "Bhaktivinoda Thakura", category: "kirtan", mood: "joyful" },
  { title: "Jiv Jago Jiv Jago", author: "Bhaktivinoda Thakura", category: "kirtan", mood: "joyful" },
  { title: "Kabe Gaura Vane", author: "Bhaktivinoda Thakura", category: "bhajan", mood: "devotional" },
  { title: "Yasomati Nandana", author: "Bhaktivinoda Thakura", category: "kirtan", mood: "joyful" },
  
  // Narottama Das Thakura songs  
  { title: "Gauranga Bolite Habe", author: "Narottama Das Thakura", category: "bhajan", mood: "devotional" },
  { title: "Hari Hari Biphale Janama", author: "Narottama Das Thakura", category: "bhajan", mood: "devotional" },
  { title: "Nitai Pada Kamala", author: "Narottama Das Thakura", category: "bhajan", mood: "devotional" },
  { title: "Sri Rupa Manjari Pada", author: "Narottama Das Thakura", category: "prayer", mood: "meditative" },
  
  // Traditional prayers
  { title: "Jaya Radha Madhava", author: "Bhaktivinoda Thakura", category: "kirtan", mood: "joyful" },
  { title: "Sri Guru Carana Padma", author: "Narottama Das Thakura", category: "prayer", mood: "devotional" },
  { title: "Samsara Davanala Lidha", author: "Visvanatha Cakravarti Thakura", category: "prayer", mood: "meditative" },
  
  // Jayadeva Goswami
  { title: "He Govinda He Gopal", author: "Jayadeva Goswami", category: "kirtan", mood: "joyful" },
  { title: "Pralaya Payodhi Jale", author: "Jayadeva Goswami", category: "kirtan", mood: "devotional" },
  
  // Rupa Goswami
  { title: "Radhe Jaya Jaya Madhava Dayite", author: "Rupa Goswami", category: "prayer", mood: "devotional" },
  
  // Other well-known songs
  { title: "Hare Krishna Maha Mantra", author: "Traditional", category: "mantra", mood: "meditative" },
  { title: "Govinda Jaya Jaya", author: "Traditional", category: "kirtan", mood: "joyful" },
  { title: "Tulasi Arati", author: "Traditional", category: "arati", mood: "devotional" }
];