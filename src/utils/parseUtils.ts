import { ParsedEvent } from "../types/schedule";

interface RawEvent {
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  category: string;
}

// Convert 24-hour time to 12-hour AM/PM format
function to12HourTime(time: string | undefined): string {
  if (!time) return "";
  
  // Already has AM/PM
  if (time.match(/AM|PM/i)) {
    return time.toUpperCase();
  }
  
  const match = time.match(/^(\d{1,2}):?(\d{2})?$/);
  if (!match) return time;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] || "00";
  
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  return `${hours}:${minutes} ${period}`;
}

export function parseScheduleText(text: string): { events: ParsedEvent[] } {
  const events: RawEvent[] = [];
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  
  // Track what we've seen to avoid duplicates
  const seenEvents = new Set<string>();
  
  // Table header patterns to skip
  const headerPatterns = /^(exam\s*name|date|time|location|course|day|schedule|syllabus|week|session|topic|assignment|due|notes?)$/i;
  
  // Date patterns
  const datePatterns = [
    // January 15, 2024 or January 15,2024
    /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/gi,
    // Jan 15, 2024
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s*\d{4})/gi,
    // 1/15/2024 or 1/15/24
    /(\d{1,2}\/\d{1,2}\/(?:\d{4}|\d{2}))/g,
    // 2024-01-15
    /(\d{4}-\d{2}-\d{2})/g,
  ];
  
  // Category keywords
  const categoryKeywords: Record<string, string[]> = {
    exam: ["exam", "midterm", "final", "test", "quiz", "assessment"],
    class: ["lecture", "class", "lab", "section", "seminar", "workshop"],
    meeting: ["meeting", "conference", "call", "sync", "standup"],
    appointment: ["appointment", "consultation", "office hours", "tutorial"],
    deadline: ["deadline", "due", "submission", "homework", "assignment", "project due"],
    work: ["shift", "work", "job"],
  };
  
  // Detect category from text
  function detectCategory(text: string): string {
    const lower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return category;
      }
    }
    return "personal";
  }
  
  // Normalize date to YYYY-MM-DD
  function normalizeDate(dateStr: string | undefined | null): string | null {
    // Guard against undefined/null/non-string
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }
    
    const months: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
      jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    };
    
    // Try Month DD, YYYY format
    const monthMatch = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2}),?\s+(\d{4})/i);
    if (monthMatch) {
      const month = months[monthMatch[1].toLowerCase()];
      const day = monthMatch[2].padStart(2, '0');
      const year = monthMatch[3];
      return `${year}-${String(month).padStart(2, '0')}-${day}`;
    }
    
    // Try MM/DD/YYYY or MM/DD/YY
    const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (slashMatch) {
      const month = slashMatch[1].padStart(2, '0');
      const day = slashMatch[2].padStart(2, '0');
      const year = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
      return `${year}-${month}-${day}`;
    }
    
    // Try YYYY-MM-DD
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return dateStr;
    }
    
    return null;
  }
  
  // Extract location from text
  function extractLocation(text: string): string | undefined {
    const patterns = [
      /(?:room|rm\.?|building|bldg|hall|location|loc)\s*[:#]?\s*([A-Za-z0-9\s-]+)/i,
      /(?:room|rm\.?)\s*(\d+[A-Za-z]?)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }
  
  // Parse each line looking for events
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines or very short lines
    if (line.length < 3) continue;
    
    // Skip table headers
    if (headerPatterns.test(line)) continue;
    
    // Look for date in line
    let date: string | null = null;
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const normalized = normalizeDate(match[1]);
        if (normalized) {
          date = normalized;
          break;
        }
      }
    }
    
    if (!date) continue;
    
    // Look for time in line
    let startTime = "";
    let endTime = "";
    
    // Try time range pattern first (e.g., 7:00 PM - 9:00 PM)
    const rangeMatch = line.match(/(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?\s*[–—-]\s*(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?/i);
    if (rangeMatch) {
      startTime = rangeMatch[1];
      const startPeriod = rangeMatch[2];
      endTime = rangeMatch[3];
      const endPeriod = rangeMatch[4];
      
      // Determine AM/PM
      const hour1 = parseInt(startTime.split(":")[0]);
      const hour2 = parseInt(endTime.split(":")[0]);
      
      if (startPeriod) {
        startTime = `${startTime} ${startPeriod.toUpperCase()}`;
      } else if (hour1 >= 7 && hour1 < 12) {
        startTime = `${startTime} AM`;
      } else {
        startTime = `${startTime} PM`;
      }
      
      if (endPeriod) {
        endTime = `${endTime} ${endPeriod.toUpperCase()}`;
      } else if (hour2 >= 1 && hour2 <= 12) {
        endTime = `${endTime} PM`;
      } else {
        endTime = `${endTime} PM`;
      }
    } else {
      // Single time
      const timeMatch = line.match(/(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?/i);
      if (timeMatch) {
        startTime = timeMatch[1];
        if (timeMatch[2]) {
          startTime = `${startTime} ${timeMatch[2].toUpperCase()}`;
        } else {
          // Guess AM/PM based on hour
          const hour = parseInt(startTime.split(":")[0]);
          if (hour >= 7 && hour < 12) {
            startTime = `${startTime} AM`;
          } else {
            startTime = `${startTime} PM`;
          }
        }
      }
    }
    
    // Extract title - everything before the date/time
    let title = line
      .replace(/\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s*\d{4}.*/i, "")
      .replace(/\s*\d{1,2}\/\d{1,2}\/\d{2,4}.*/i, "")
      .replace(/\s*\d{4}-\d{2}-\d{2}.*/i, "")
      .replace(/\s*\d{1,2}:\d{2}.*/i, "")
      .replace(/^\s*[–—-]\s*/, "")
      .trim();
    
    // Clean up title
    title = title
      .replace(/^(exam|test|quiz|midterm|final)\s*(\d+)?\s*[:–—-]\s*/i, "")
      .replace(/^\d+\.\s*/, "")
      .trim();
    
    // Skip if title looks like a header or is too short
    if (title.length < 2 || headerPatterns.test(title)) continue;
    
    // Extract location
    const location = extractLocation(line);
    
    // Detect category
    const category = detectCategory(line);
    
    // Create event key for deduplication
    const eventKey = `${title}|${date}`;
    
    // Skip duplicates
    if (seenEvents.has(eventKey)) continue;
    seenEvents.add(eventKey);
    
    // Convert times to 12-hour format
    startTime = to12HourTime(startTime);
    endTime = to12HourTime(endTime);
    
    events.push({
      title,
      date,
      startTime,
      endTime: endTime || undefined,
      location,
      category,
    });
  }
  
  // Sort events by date
  events.sort((a, b) => a.date.localeCompare(b.date));
  
  return { events };
}