import { ParsedData, ParsedEvent } from "../types/schedule";

// Date patterns
const datePatterns = [
  // January 15, 2024 or Jan 15, 2024
  /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi,
  // 01/15/2024 or 1/15/24
  /\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2})/g,
  // 2024-01-15
  /\d{4}-\d{2}-\d{2}/g,
];

// Time patterns
const timePatterns = [
  // 2:00 PM, 2:00PM, 2 PM
  /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/gi,
  /\d{1,2}\s*(?:AM|PM|am|pm)/gi,
  // 14:00 (24-hour)
  /\d{2}:\d{2}/g,
];

function normalizeDate(dateStr: string): string {
  const months: { [key: string]: string } = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12',
  };

  let match;
  
  // Month Day, Year format
  if ((match = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i))) {
    const month = months[match[1].toLowerCase()];
    const day = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  
  // MM/DD/YYYY format
  if ((match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})/))) {
    const month = match[1].padStart(2, '0');
    const day = match[2].padStart(2, '0');
    let year = match[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  
  // YYYY-MM-DD format
  if ((match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/))) {
    return dateStr;
  }

  // Default to today if can't parse
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function normalizeTime(timeStr: string): string {
  let match;
  if ((match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i))) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  if ((match = timeStr.match(/(\d{1,2})\s*(AM|PM|am|pm)/i))) {
    let hours = parseInt(match[1]);
    const period = match[2].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:00`;
  }
  
  if ((match = timeStr.match(/(\d{2}):(\d{2})/))) {
    return timeStr;
  }
  
  return '09:00';
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('exam') || lower.includes('midterm') || lower.includes('final') || lower.includes('test')) {
    return 'exam';
  }
  if (lower.includes('class') || lower.includes('lecture') || lower.includes('cs ') || lower.includes('math') || lower.includes('eng')) {
    return 'class';
  }
  if (lower.includes('meeting') || lower.includes('standup') || lower.includes('sync') || lower.includes('team')) {
    return 'meeting';
  }
  if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('dentist')) {
    return 'appointment';
  }
  if (lower.includes('deadline') || lower.includes('due') || lower.includes('submit') || lower.includes('homework') || lower.includes('assignment')) {
    return 'deadline';
  }
  if (lower.includes('work') || lower.includes('shift')) {
    return 'work';
  }
  
  return 'personal';
}

function extractLocation(text: string): string | undefined {
  const locationPatterns = [
    /(?:room|rm\.?|building|bldg|hall|center|centre)\s+([A-Za-z0-9\s]+?)(?:\s|$|,)/i,
    /(?:location|where|at):\s*([A-Za-z0-9\s,]+?)(?:\s|$)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  
  return undefined;
}

// Check if a line looks like a valid event title
function isValidEventTitle(title: string): boolean {
  if (!title || title.length < 2) return false;
  
  const lower = title.toLowerCase();
  
  // Filter out common non-event text patterns
  const invalidPatterns = [
    /^(there (will|is|are)|in general|please|note|important|reminder|the following)/i,
    /^(exam name|date|time|location|description|name)$/i,  // Table headers
    /^\d+$/,  // Just numbers
    /^(at the following|via|taken|will be)/i,
    /^(exams?)$/i,  // Just the word "exam" or "exams"
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(title)) return false;
  }
  
  // Must have some alphanumeric content
  if (!/[a-zA-Z]/.test(title)) return false;
  
  // Skip if it looks like a table header (contains multiple column names)
  if (/^(exam name|date|time)/i.test(title)) return false;
  
  return true;
}

// Check if this line is likely a table header
function isTableHeader(line: string): boolean {
  const lower = line.toLowerCase();
  // Check for common table header patterns
  const headerPatterns = [
    /^(exam name|course|assignment|date|time|location|description|name)\s+(date|time|location|description)/i,
    /^(date|time|location)\s+(date|time|location)/i,
  ];
  
  for (const pattern of headerPatterns) {
    if (pattern.test(lower)) return true;
  }
  
  // Also check if line contains multiple header words without actual content
  const headerWords = ['exam name', 'date', 'time', 'location', 'description', 'course', 'assignment'];
  let headerCount = 0;
  for (const word of headerWords) {
    if (lower.includes(word)) headerCount++;
  }
  
  // If it has 2+ header words and no actual date/time content, it's likely a header
  if (headerCount >= 2) {
    const hasActualDate = datePatterns.some(p => {
      p.lastIndex = 0;
      return p.test(line);
    });
    const hasActualTime = timePatterns.some(p => {
      p.lastIndex = 0;
      return p.test(line);
    });
    
    if (!hasActualDate && !hasActualTime) return true;
  }
  
  return false;
}

// Detect table-like structures - each line is a complete event
function detectTableEvents(text: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Skip table headers
    if (isTableHeader(trimmedLine)) continue;
    
    // Try to find date in the line
    let foundDate: string | null = null;
    let dateMatch: string | null = null;
    for (const pattern of datePatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(trimmedLine);
      if (match) {
        foundDate = normalizeDate(match[0]);
        dateMatch = match[0];
        break;
      }
    }
    
    if (!foundDate) continue;
    
    // Try to find times in the line
    const foundTimes: string[] = [];
    for (const pattern of timePatterns) {
      pattern.lastIndex = 0;
      const matches = trimmedLine.match(pattern);
      if (matches) {
        foundTimes.push(...matches.map(normalizeTime));
      }
    }
    
    if (foundTimes.length === 0) continue;
    
    // Extract title - everything before the date
    let title = trimmedLine;
    if (dateMatch) {
      title = trimmedLine.split(dateMatch)[0].trim();
    }
    
    // Clean up title
    title = title.replace(/[|–—-]+\s*$/, '').trim();
    title = title.replace(/\s+/g, ' ').trim();
    
    // Skip invalid titles
    if (!isValidEventTitle(title)) continue;
    
    // Skip if title is just a number or too short
    if (title.length < 3) continue;
    
    events.push({
      title,
      date: foundDate,
      startTime: foundTimes[0] || '09:00',
      endTime: foundTimes[1] || undefined,
      category: detectCategory(title),
      location: extractLocation(trimmedLine),
    });
  }
  
  return events;
}

// Detect multi-line event blocks
function detectBlockEvents(text: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = text.split('\n');
  
  let currentEvent: Partial<ParsedEvent> & { rawLines: string[] } = { rawLines: [] };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      // Empty line might indicate end of event block
      if (currentEvent.title && currentEvent.date && isValidEventTitle(currentEvent.title)) {
        events.push({
          title: currentEvent.title,
          date: currentEvent.date,
          startTime: currentEvent.startTime || '09:00',
          endTime: currentEvent.endTime,
          category: currentEvent.category || detectCategory(currentEvent.rawLines.join(' ')),
          location: currentEvent.location,
        });
      }
      currentEvent = { rawLines: [] };
      continue;
    }
    
    // Skip table headers
    if (isTableHeader(line)) {
      currentEvent = { rawLines: [] };
      continue;
    }
    
    currentEvent.rawLines.push(line);
    
    // Check for date
    for (const pattern of datePatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(line);
      if (match) {
        currentEvent.date = normalizeDate(match[0]);
        break;
      }
    }
    
    // Check for times
    for (const pattern of timePatterns) {
      pattern.lastIndex = 0;
      const matches = line.match(pattern);
      if (matches && matches.length > 0) {
        if (!currentEvent.startTime) {
          currentEvent.startTime = normalizeTime(matches[0]);
        }
        if (matches.length > 1 && !currentEvent.endTime) {
          currentEvent.endTime = normalizeTime(matches[1]);
        } else if (currentEvent.startTime && !currentEvent.endTime) {
          if (matches.length > 1) {
            currentEvent.endTime = normalizeTime(matches[1]);
          } else if (line !== currentEvent.rawLines[0]) {
            const potentialEnd = normalizeTime(matches[0]);
            if (potentialEnd !== currentEvent.startTime) {
              currentEvent.endTime = potentialEnd;
            }
          }
        }
      }
    }
    
    // Check if line looks like a title (short, no date at start)
    const hasDate = datePatterns.some(p => {
      p.lastIndex = 0;
      return p.test(line);
    });
    const hasTime = timePatterns.some(p => {
      p.lastIndex = 0;
      return p.test(line);
    });
    
    if (!currentEvent.title && line.length < 100 && !hasDate && !hasTime) {
      if (isValidEventTitle(line)) {
        currentEvent.title = line;
        currentEvent.category = detectCategory(line);
      }
    }
    
    // Check for location
    const location = extractLocation(line);
    if (location && !currentEvent.location) {
      currentEvent.location = location;
    }
  }
  
  // Don't forget the last event
  if (currentEvent.title && currentEvent.date && isValidEventTitle(currentEvent.title)) {
    events.push({
      title: currentEvent.title,
      date: currentEvent.date,
      startTime: currentEvent.startTime || '09:00',
      endTime: currentEvent.endTime,
      category: currentEvent.category || detectCategory(currentEvent.rawLines.join(' ')),
      location: currentEvent.location,
    });
  }
  
  return events;
}

// Remove duplicate and suspicious events
function deduplicateEvents(events: ParsedEvent[]): ParsedEvent[] {
  const validEvents: ParsedEvent[] = [];
  const seen = new Map<string, ParsedEvent>();
  
  for (const event of events) {
    // Create a unique key based on title and date
    const key = `${event.title.toLowerCase()}-${event.date}`;
    
    // Check if we've seen this event before
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      
      // If the new event has different times, check if it's a duplicate
      // Same title + same date but different times = likely a parsing error
      if (existing.startTime !== event.startTime) {
        // Keep the one with more complete info (has end time)
        if (event.endTime && !existing.endTime) {
          seen.set(key, event);
        }
        // Otherwise keep the first one
        continue;
      }
      continue;
    }
    
    // Check for suspicious events (same date but title looks like header text)
    const lowerTitle = event.title.toLowerCase();
    if (lowerTitle.includes('exam name') || 
        lowerTitle.includes('date time') ||
        lowerTitle.match(/^(date|time|name|exam)$/i)) {
      continue;
    }
    
    seen.set(key, event);
    validEvents.push(event);
  }
  
  return validEvents;
}

export function parseScheduleText(text: string): ParsedData {
  // Try table detection first (single-line events with all info)
  const tableEvents = detectTableEvents(text);
  
  // Also try block detection (multi-line event descriptions)
  const blockEvents = detectBlockEvents(text);
  
  // Merge events
  const allEvents: ParsedEvent[] = [...tableEvents];
  
  // Add block events that weren't captured by table detection
  const seenKeys = new Set(allEvents.map(e => `${e.title.toLowerCase()}-${e.date}`));
  for (const event of blockEvents) {
    const key = `${event.title.toLowerCase()}-${event.date}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      allEvents.push(event);
    }
  }
  
  // Deduplicate
  const dedupedEvents = deduplicateEvents(allEvents);
  
  // Sort by date
  dedupedEvents.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return {
    events: dedupedEvents,
    source: text,
  };
}