import { readFileSync } from 'fs';
import { join } from 'path';
import type { InsertFestival } from '@shared/schema';

interface AuthenticEvent {
  date: string;
  title: string;
  type: 'festival' | 'appearance' | 'disappearance' | 'ekadasi' | 'celebration' | 'observance';
  isFasting: boolean;
  description?: string;
  significance?: string;
  observances?: string[];
}

export function parseAuthenticCalendar(filePath: string): AuthenticEvent[] {
  const events: AuthenticEvent[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines, month headers, and other non-event lines
      if (!trimmedLine || 
          trimmedLine.startsWith('»') || 
          trimmedLine.startsWith('The following files') ||
          trimmedLine.startsWith('<file') ||
          !trimmedLine.includes(' - ')) {
        continue;
      }
      
      // Parse event line format: "DD MMM YYYY - Event Name"
      const match = trimmedLine.match(/^(\d{2} \w{3} \d{4}) - (.+)$/);
      if (match) {
        const [, dateStr, eventName] = match;
        const formattedDate = formatDate(dateStr);
        
        if (formattedDate) {
          const event = categorizeEvent(eventName, formattedDate);
          events.push(event);
        }
      }
    }
    
  } catch (error) {
    console.error('Error parsing authentic calendar:', error);
  }
  
  return events;
}

function formatDate(dateStr: string): string {
  try {
    // Convert "DD MMM YYYY" to "YYYY-MM-DD"
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

function categorizeEvent(eventName: string, date: string): AuthenticEvent {
  const lowerName = eventName.toLowerCase();
  
  // Determine event type
  let type: AuthenticEvent['type'] = 'festival';
  let isFasting = false;
  let significance = '';
  let observances: string[] = [];
  
  if (lowerName.includes('disappearance day') || lowerName.includes('disappearance of')) {
    type = 'disappearance';
    significance = 'Remembrance of divine departure';
    observances = ['Fasting until noon', 'Memorial prayers'];
    isFasting = true;
  } else if (lowerName.includes('appearance day') || lowerName.includes('appearance of')) {
    type = 'appearance';
    significance = 'Divine appearance day celebration';
    observances = ['Fasting until noon', 'Special prayers', 'Feasting'];
  } else if (lowerName.includes('ekadasi') || lowerName.includes('ekadashi')) {
    type = 'ekadasi';
    significance = 'Sacred fasting day for purification';
    observances = ['Complete fasting or eating only fruits/milk', 'Extra chanting', 'Reading scriptures'];
    isFasting = true;
  } else if (lowerName.includes('dvadasi') || lowerName.includes('dwadashi')) {
    type = 'festival';
    significance = 'Sacred festival day';
    observances = ['Special prayers', 'Feasting'];
  } else if (lowerName.includes('purnima') || lowerName.includes('amavasya')) {
    type = 'festival';
    significance = 'Lunar calendar celebration';
    observances = ['Special ceremonies', 'Community gathering'];
  } else if (lowerName.includes('yatra') || lowerName.includes('utsava')) {
    type = 'celebration';
    significance = 'Festive celebration';
    observances = ['Processions', 'Cultural programs', 'Community feasting'];
  } else {
    type = 'observance';
    significance = 'Sacred observance day';
    observances = ['Special prayers', 'Devotional activities'];
  }
  
  return {
    date,
    title: eventName,
    type,
    isFasting,
    description: `Sacred ${type} observed in the Vaishnava tradition`,
    significance,
    observances
  };
}

export function convertToAuthenticFestivals(events: AuthenticEvent[]): InsertFestival[] {
  return events.map(event => ({
    name: event.title,
    date: event.date,
    description: event.description || '',
    significance: event.significance || '',
    observances: event.observances || []
  }));
}