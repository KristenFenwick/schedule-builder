export interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  category: string;
  location?: string;
  notes?: string;
}

export interface ParsedEvent {
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  category?: string;
  location?: string;
  notes?: string;
}

export interface ParsedData {
  events: ParsedEvent[];
  source: string;
}