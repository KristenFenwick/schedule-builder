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

// Normalize date to YYYY-MM-DD
function normalizeDate(dateStr: string | undefined | null): string | null {
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

// Detect category from text
function detectCategory(text: string): string {
  const categoryKeywords: Record<string, string[]> = {
    exam: ["exam", "midterm", "final", "test", "quiz", "assessment"],
    class: ["lecture", "class", "lab", "section", "seminar", "workshop"],
    meeting: ["meeting", "conference", "call", "sync", "standup"],
    appointment: ["appointment", "consultation", "office hours", "tutorial"],
    deadline: ["deadline", "due", "submission", "homework", "assignment", "project"],
    work: ["shift", "work", "job"],
  };
  
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  return "personal";
}

// Parse time from text
function parseTime(text: string): { startTime: string; endTime: string } {
  let startTime = "";
  let endTime = "";
  
  // Time range: 7:00 PM - 9:00 PM or 7:00-9:00 PM or 19:00 - 21:00
  const rangeMatch = text.match(/(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?\s*[–—-]\s*(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?/i);
  if (rangeMatch) {
    startTime = rangeMatch[1];
    const startPeriod = rangeMatch[2];
    endTime = rangeMatch[3];
    const endPeriod = rangeMatch[4];
    
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
    
    return { startTime: to12HourTime(startTime), endTime: to12HourTime(endTime) };
  }
  
  // Single time: 7:00 PM or 19:00
  const singleMatch = text.match(/(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?/i);
  if (singleMatch) {
    startTime = singleMatch[1];
    if (singleMatch[2]) {
      startTime = `${startTime} ${singleMatch[2].toUpperCase()}`;
    } else {
      const hour = parseInt(startTime.split(":")[0]);
      if (hour >= 7 && hour < 12) {
        startTime = `${startTime} AM`;
      } else {
        startTime = `${startTime} PM`;
      }
    }
    return { startTime: to12HourTime(startTime), endTime: "" };
  }
  
  return { startTime: "", endTime: "" };
}

export function parseScheduleText(text: string): { events: ParsedEvent[] } {
  const events: RawEvent[] = [];
  const seenEvents = new Set<string>();
  
  // Split into lines and clean
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // Join all text for context-aware parsing
  const fullText = lines.join(" ");
  
  // ========== STRATEGY 1: Table/Row-based parsing ==========
  // Look for lines that contain both a date and an event title
  
  // Date patterns
  const datePatterns = [
    // Month DD, YYYY
    /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/gi,
    // Mon DD, YYYY (abbreviated)
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s*\d{4})/gi,
    // MM/DD/YYYY or MM/DD/YY
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
    // YYYY-MM-DD
    /(\d{4}-\d{2}-\d{2})/g,
  ];
  
  // ========== STRATEGY 2: Multi-line context parsing ==========
  // When we find a date, look around it for event info
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find date in this line
    let foundDate: string | null = null;
    
    for (const pattern of datePatterns) {
      pattern.lastIndex = 0; // Reset regex
      const match = pattern.exec(line);
      if (match && match[1]) {
        const normalized = normalizeDate(match[1]);
        if (normalized) {
          foundDate = normalized;
          break;
        }
      }
    }
    
    if (!foundDate) continue;
    
    // Look for time in this line or nearby lines
    const contextWindow = [
      lines[i - 1] || "",
      line,
      lines[i + 1] || "",
    ].join(" ");
    
    const { startTime, endTime } = parseTime(contextWindow);
    
    // Extract title - look at lines before and after
    let title = "";
    
    // Check previous line for title (common in tables)
    if (i > 0) {
      const prevLine = lines[i - 1];
      // If previous line doesn't have a date, it might be the title
      const prevHasDate = datePatterns.some(p => {
        p.lastIndex = 0;
        return p.test(prevLine);
      });
      if (!prevHasDate && prevLine.length > 2 && prevLine.length < 100) {
        title = prevLine;
      }
    }
    
    // Extract title from same line (remove date and time)
    if (!title) {
      title = line
        .replace(/\d{4}-\d{2}-\d{2}/g, "")
        .replace(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4}/gi, "")
        .replace(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s*\d{4}/gi, "")
        .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, "")
        .replace(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*[–—-]\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?/gi, "")
        .replace(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?/gi, "")
        .replace(/^[–—•\s]+|[–—•\s]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    
    // Check next line for title if we still don't have one
    if (!title && i < lines.length - 1) {
      const nextLine = lines[i + 1];
      const nextHasDate = datePatterns.some(p => {
        p.lastIndex = 0;
        return p.test(nextLine);
      });
      if (!nextHasDate && nextLine.length > 2 && nextLine.length < 100) {
        title = nextLine;
      }
    }
    
    // Clean up title
    title = title
      .replace(/^(exam|test|quiz|midterm|final)\s*(\d+)?\s*[:–—-]\s*/i, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*/i, "")
      .trim();
    
    // Skip if no meaningful title
    if (!title || title.length < 2) continue;
    
    // Extract location
    const location = extractLocation(contextWindow);
    
    // Detect category
    const category = detectCategory(title + " " + contextWindow);
    
    // Dedupe
    const eventKey = `${title.toLowerCase()}|${foundDate}`;
    if (seenEvents.has(eventKey)) continue;
    seenEvents.add(eventKey);
    
    events.push({
      title,
      date: foundDate,
      startTime,
      endTime: endTime || undefined,
      location,
      category,
    });
  }
  
  // ========== STRATEGY 3: Keyword-based parsing for exams/deadlines ==========
  // Look for keywords like "Midterm", "Final", "Due", etc. and find nearby dates
  
  const keywordPatterns = [
    { pattern: /(Midterm\s*(?:Exam\s*)?[\dIV]*)/gi, category: "exam" },
    { pattern: /(Final\s*Exam)/gi, category: "exam" },
    { pattern: /(Quiz\s*[\dIV]*)/gi, category: "exam" },
    { pattern: /(Test\s*[\dIV]*)/gi, category: "exam" },
    { pattern: /(Project\s*[\dIV]*)/gi, category: "deadline" },
    { pattern: /(Homework\s*[\dIV]*)/gi, category: "deadline" },
    { pattern: /(Assignment\s*[\dIV]*)/gi, category: "deadline" },
    { pattern: /(Office\s*Hours)/gi, category: "appointment" },
    { pattern: /(Lecture)/gi, category: "class" },
    { pattern: /(Lab)/gi, category: "class" },
  ];
  
  for (const { pattern, category } of keywordPatterns) {
    pattern.lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(fullText)) !== null) {
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;
      
      // Get context around the match (500 chars before and after)
      const contextStart = Math.max(0, matchStart - 200);
      const contextEnd = Math.min(fullText.length, matchEnd + 200);
      const context = fullText.slice(contextStart, contextEnd);
      
      // Find date in context
      let foundDate: string | null = null;
      for (const datePattern of datePatterns) {
        datePattern.lastIndex = 0;
        const dateMatch = datePattern.exec(context);
        if (dateMatch && dateMatch[1]) {
          const normalized = normalizeDate(dateMatch[1]);
          if (normalized) {
            foundDate = normalized;
            break;
          }
        }
      }
      
      if (!foundDate) continue;
      
      // Find time in context
      const { startTime, endTime } = parseTime(context);
      
      // Title is the matched keyword
      const title = match[0].trim();
      
      // Dedupe
      const eventKey = `${title.toLowerCase()}|${foundDate}`;
      if (seenEvents.has(eventKey)) continue;
      seenEvents.add(eventKey);
      
      events.push({
        title,
        date: foundDate,
        startTime,
        endTime: endTime || undefined,
        location: extractLocation(context),
        category,
      });
    }
  }
  
  // Sort by date
  events.sort((a, b) => a.date.localeCompare(b.date));
  
  return { events };
}