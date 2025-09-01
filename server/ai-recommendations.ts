import OpenAI from "openai";
import type { DevotionalSong } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface RecommendationContext {
  userId: string;
  currentMood?: string;
  recentSadhanaProgress?: {
    chantingRounds: number;
    readingPages: number;
    hearingMinutes: number;
  };
  recentJournalEntries?: Array<{
    mood: string;
    content: string;
  }>;
  favoriteSongs?: DevotionalSong[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  practiceLevel?: 'beginner' | 'intermediate' | 'advanced';
  spiritualFocus?: 'radharani' | 'krishna' | 'caitanya' | 'guru' | 'general' | 'any';
}

export interface SongRecommendation {
  song: DevotionalSong;
  reason: string;
  confidence: number;
  spiritualBenefit: string;
}

export class AIRecommendationEngine {
  private categorizeSongBySpiritualFocus(song: DevotionalSong): 'radharani' | 'krishna' | 'caitanya' | 'guru' | 'general' {
    const title = song.title.toLowerCase();
    const author = song.author.toLowerCase();
    
    // Radharani-focused songs
    if (title.includes('radha') || title.includes('radhika') || title.includes('radhe') || 
        title.includes('vrindavan') || title.includes('gopi') || title.includes('lalita')) {
      return 'radharani';
    }
    
    // Krishna-focused songs
    if (title.includes('krishna') || title.includes('krsna') || title.includes('govind') || 
        title.includes('gopal') || title.includes('madhav') || title.includes('hari') ||
        title.includes('vasudeva') || title.includes('mukund') || title.includes('gokul')) {
      return 'krishna';
    }
    
    // Caitanya Mahaprabhu-focused songs
    if (title.includes('caitanya') || title.includes('gaura') || title.includes('gauranga') || 
        title.includes('mahaprabhu') || title.includes('nitai') || title.includes('nityananda') ||
        title.includes('navadwip') || title.includes('sankirtan')) {
      return 'caitanya';
    }
    
    // Guru-focused songs
    if (title.includes('guru') || title.includes('gurudev') || title.includes('prabhupada') ||
        title.includes('spiritual master') || title.includes('acharya') || 
        author.includes('gurudev') || song.category === 'prayer' && title.includes('pada')) {
      return 'guru';
    }
    
    return 'general';
  }
  
  private filterSongsBySpiritualFocus(songs: DevotionalSong[], focus?: string): DevotionalSong[] {
    if (!focus || focus === 'any') {
      return songs;
    }
    
    return songs.filter(song => this.categorizeSongBySpiritualFocus(song) === focus);
  }
  
  private getSpiritualFocusDescription(focus: string): string {
    const descriptions: Record<string, string> = {
      'radharani': 'Songs glorifying Srimati Radharani, the divine feminine energy and eternal consort of Krishna',
      'krishna': 'Songs praising Lord Krishna in His various forms and pastimes',
      'caitanya': 'Songs about Lord Caitanya Mahaprabhu, the golden avatar who spread the holy name',
      'guru': 'Songs offering prayers and gratitude to the spiritual master and parampara',
      'general': 'General devotional songs covering various aspects of bhakti practice'
    };
    return descriptions[focus] || 'Devotional songs for spiritual upliftment';
  }

  private getSpiritualContext(context: RecommendationContext): string {
    const { recentSadhanaProgress, recentJournalEntries, favoriteSongs, timeOfDay, currentMood } = context;
    
    let contextDescription = "Based on the devotee's spiritual practice:\n";
    
    if (recentSadhanaProgress) {
      contextDescription += `- Daily sadhana: ${recentSadhanaProgress.chantingRounds} rounds of chanting, ${recentSadhanaProgress.readingPages} pages of reading, ${recentSadhanaProgress.hearingMinutes} minutes of hearing\n`;
    }
    
    if (recentJournalEntries && recentJournalEntries.length > 0) {
      const recentMoods = recentJournalEntries.map(entry => entry.mood).join(', ');
      contextDescription += `- Recent spiritual moods: ${recentMoods}\n`;
    }
    
    if (favoriteSongs && favoriteSongs.length > 0) {
      const favoriteAuthors = [...new Set(favoriteSongs.map(song => song.author))].join(', ');
      const favoriteCategories = [...new Set(favoriteSongs.map(song => song.category))].join(', ');
      contextDescription += `- Preferred song authors: ${favoriteAuthors}\n`;
      contextDescription += `- Preferred song types: ${favoriteCategories}\n`;
    }
    
    if (timeOfDay) {
      contextDescription += `- Current time: ${timeOfDay}\n`;
    }
    
    if (currentMood) {
      contextDescription += `- Current mood: ${currentMood}\n`;
    }
    
    if (context.spiritualFocus && context.spiritualFocus !== 'any') {
      contextDescription += `- Spiritual focus: ${context.spiritualFocus} (${this.getSpiritualFocusDescription(context.spiritualFocus)})\n`;
    }
    
    return contextDescription;
  }

  async generateRecommendations(
    availableSongs: DevotionalSong[],
    context: RecommendationContext,
    count: number = 5
  ): Promise<SongRecommendation[]> {
    if (!openai || !process.env.OPENAI_API_KEY) {
      // Fallback to basic recommendations without AI
      return this.getFallbackRecommendations(availableSongs, context, count);
    }

    try {
      // Filter songs by spiritual focus if specified
      const filteredSongs = context.spiritualFocus ? 
        this.filterSongsBySpiritualFocus(availableSongs, context.spiritualFocus) : 
        availableSongs;
      
      const spiritualContext = this.getSpiritualContext(context);
      
      const songList = filteredSongs.map(song => {
        const focus = this.categorizeSongBySpiritualFocus(song);
        return `${song.title} by ${song.author} (${song.category}, ${song.mood}) [Focus: ${focus}]`;
      }).join('\n');

      const prompt = `As a spiritual guide knowledgeable in Vaishnava traditions and bhakti-yoga, recommend ${count} devotional songs from the following list that would best support this devotee's spiritual practice:

${spiritualContext}

Available Songs:
${songList}

For each recommendation, provide:
1. Song title and author
2. A brief spiritual reason why this song matches their current needs
3. Confidence level (0.1-1.0)
4. The spiritual benefit this song provides

Consider:
- Time-appropriate songs (morning prayers, evening meditations)
- Mood-matching selections (contemplative bhajans for reflection, joyful kirtans for celebration)
- Spiritual focus categories: Radharani (divine feminine energy), Krishna (Supreme Lord), Caitanya (golden avatar), Guru (spiritual master), General (comprehensive devotional practice)
- Spiritual progression (beginner-friendly or advanced philosophical content)
- Authentic Vaishnava tradition and teachings
- Balance between different authors and styles
- Match the devotee's current spiritual focus and level of practice

Respond in JSON format:
{
  "recommendations": [
    {
      "songTitle": "string",
      "author": "string",
      "reason": "string",
      "confidence": number,
      "spiritualBenefit": "string"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable spiritual guide in the Vaishnava tradition, expert in devotional music and bhakti practices. Provide thoughtful, authentic recommendations that support spiritual growth."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      
      return result.recommendations.map((rec: any) => {
        const song = availableSongs.find(s => 
          s.title.toLowerCase().includes(rec.songTitle.toLowerCase()) ||
          rec.songTitle.toLowerCase().includes(s.title.toLowerCase())
        );
        
        if (!song) return null;
        
        return {
          song,
          reason: rec.reason,
          confidence: Math.max(0.1, Math.min(1.0, rec.confidence)),
          spiritualBenefit: rec.spiritualBenefit
        };
      }).filter(Boolean).slice(0, count);

    } catch (error) {
      console.error("AI recommendation error:", error);
      return this.getFallbackRecommendations(availableSongs, context, count);
    }
  }

  private getFallbackRecommendations(
    availableSongs: DevotionalSong[],
    context: RecommendationContext,
    count: number
  ): SongRecommendation[] {
    // Filter by spiritual focus first if specified
    let filteredSongs = context.spiritualFocus ? 
      this.filterSongsBySpiritualFocus(availableSongs, context.spiritualFocus) : 
      availableSongs;
    
    // Smart fallback based on context without AI
    let recommendations: SongRecommendation[] = [];
    
    // Spiritual focus-based recommendations
    if (context.spiritualFocus && context.spiritualFocus !== 'any') {
      const focusedSongs = this.filterSongsBySpiritualFocus(availableSongs, context.spiritualFocus);
      const focusDescription = this.getSpiritualFocusDescription(context.spiritualFocus);
      recommendations.push(...this.createBasicRecommendations(focusedSongs, `Perfect for ${context.spiritualFocus} meditation - ${focusDescription}`, 0.9));
    }
    
    // Time-based recommendations
    if (context.timeOfDay === 'morning') {
      const morningSongs = filteredSongs.filter(song => 
        song.title.toLowerCase().includes('mangala') ||
        song.title.toLowerCase().includes('arati') ||
        song.mood === 'devotional'
      );
      recommendations.push(...this.createBasicRecommendations(morningSongs, "Perfect for morning devotional practice", 0.8));
    }
    
    // Mood-based recommendations
    if (context.currentMood) {
      const moodMatched = filteredSongs.filter(song => song.mood === context.currentMood);
      recommendations.push(...this.createBasicRecommendations(moodMatched, `Matches your ${context.currentMood} mood`, 0.7));
    }
    
    // Favorite author recommendations
    if (context.favoriteSongs && context.favoriteSongs.length > 0) {
      const favoriteAuthors = [...new Set(context.favoriteSongs.map(s => s.author))];
      const authorSongs = filteredSongs.filter(song => favoriteAuthors.includes(song.author));
      recommendations.push(...this.createBasicRecommendations(authorSongs, "By your favorite authors", 0.6));
    }
    
    // Fill remaining with popular/classic songs from the filtered set
    const classics = filteredSongs.filter(song => 
      song.author === "Bhaktivinoda Thakura" || 
      song.author === "Narottama Das Thakura" ||
      song.category === "kirtan"
    );
    recommendations.push(...this.createBasicRecommendations(classics, "Classic devotional songs", 0.5));
    
    // If we don't have enough recommendations, add general ones
    if (recommendations.length < count) {
      const remaining = filteredSongs.filter(song => 
        !recommendations.some(rec => rec.song.id === song.id)
      );
      recommendations.push(...this.createBasicRecommendations(remaining, "Recommended for your spiritual practice", 0.4));
    }
    
    // Remove duplicates and return top recommendations
    const uniqueRecommendations = recommendations.filter((rec, index, self) => 
      index === self.findIndex(r => r.song.id === rec.song.id)
    );
    
    return uniqueRecommendations.slice(0, count);
  }

  private createBasicRecommendations(songs: DevotionalSong[], reason: string, confidence: number): SongRecommendation[] {
    return songs.slice(0, 3).map(song => ({
      song,
      reason,
      confidence,
      spiritualBenefit: this.getBasicSpiritualBenefit(song)
    }));
  }

  private filterSongsBySpiritualFocus(
    songs: DevotionalSong[], 
    focus: string
  ): DevotionalSong[] {
    if (focus === 'any') return songs;
    
    return songs.filter(song => {
      const title = song.title.toLowerCase();
      
      switch (focus) {
        case 'radharani':
          return title.includes('radha') || title.includes('radhika') || title.includes('radhe') || 
                 title.includes('vrindavan') || title.includes('gopi') || title.includes('lalita');
        
        case 'krishna':
          return title.includes('krishna') || title.includes('krsna') || title.includes('govind') || 
                 title.includes('gopal') || title.includes('madhav') || title.includes('hari') ||
                 title.includes('vasudeva') || title.includes('mukund') || title.includes('gokul');
        
        case 'caitanya':
          return title.includes('caitanya') || title.includes('gaura') || title.includes('gauranga') || 
                 title.includes('mahaprabhu') || title.includes('nitai') || title.includes('nityananda') ||
                 title.includes('navadwip') || title.includes('sankirtan');
        
        case 'guru':
          return title.includes('guru') || title.includes('gurudev') || title.includes('prabhupada') ||
                 title.includes('spiritual master') || title.includes('acharya');
        
        case 'general':
        default:
          return true;
      }
    });
  }

  private getSpiritualFocusDescription(focus: string): string {
    const descriptions: Record<string, string> = {
      'radharani': 'divine love and devotional service to Srimati Radharani',
      'krishna': 'pure love and surrender to Lord Krishna',
      'caitanya': 'congregational chanting and mercy of Sri Caitanya Mahaprabhu',
      'guru': 'gratitude and devotion to the spiritual master',
      'general': 'overall spiritual advancement and devotional mood'
    };
    return descriptions[focus] || descriptions['general'];
  }

  private getBasicSpiritualBenefit(song: DevotionalSong): string {
    const benefits: Record<string, string> = {
      'devotional': 'Cultivates pure devotion and surrender to Krishna',
      'meditative': 'Supports deep contemplation and inner peace',
      'joyful': 'Awakens spiritual happiness and enthusiasm',
      'reflective': 'Encourages introspection and spiritual growth',
      'contemplative': 'Deepens philosophical understanding'
    };
    
    return benefits[song.mood] || 'Strengthens connection with the divine through sacred sound';
  }

  async analyzeUserPreferences(
    favoriteSongs: DevotionalSong[],
    journalEntries: Array<{ mood: string; content: string }>
  ): Promise<{
    preferredAuthors: string[];
    preferredMoods: string[];
    spiritualFocus: string;
    practiceLevel: 'beginner' | 'intermediate' | 'advanced';
  }> {
    if (!process.env.OPENAI_API_KEY) {
      // Basic analysis without AI
      const preferredAuthors = [...new Set(favoriteSongs.map(s => s.author))];
      const preferredMoods = [...new Set(favoriteSongs.map(s => s.mood))];
      
      return {
        preferredAuthors,
        preferredMoods,
        spiritualFocus: 'General bhakti practice',
        practiceLevel: favoriteSongs.length > 10 ? 'intermediate' : 'beginner'
      };
    }

    try {
      const favoritesText = favoriteSongs.map(s => `${s.title} by ${s.author} (${s.mood})`).join(', ');
      const journalMoods = journalEntries.map(e => e.mood).join(', ');
      
      const prompt = `Analyze this devotee's spiritual preferences based on their favorite songs and journal entries:

Favorite Songs: ${favoritesText}
Recent Journal Moods: ${journalMoods}

Provide analysis in JSON format:
{
  "preferredAuthors": ["array of top 3 preferred authors"],
  "preferredMoods": ["array of top 3 preferred moods"],
  "spiritualFocus": "brief description of their spiritual focus area",
  "practiceLevel": "beginner|intermediate|advanced"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Preference analysis error:", error);
      return {
        preferredAuthors: [],
        preferredMoods: [],
        spiritualFocus: 'General practice',
        practiceLevel: 'beginner'
      };
    }
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();