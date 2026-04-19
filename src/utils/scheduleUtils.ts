import { ScheduleItem } from "../types/schedule";

export function groupByDate(items: ScheduleItem[]): Record<string, ScheduleItem[]> {
  return items.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  
  // Handle already formatted times (with AM/PM)
  if (timeStr.match(/AM|PM/i)) {
    return timeStr.toUpperCase();
  }
  
  // Convert 24-hour format to 12-hour
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    exam: '#dc2626',      // Red
    class: '#6366f1',      // Indigo
    meeting: '#8b5cf6',   // Violet
    appointment: '#ec4899', // Pink
    deadline: '#f59e0b',  // Amber
    work: '#f59e0b',      // Amber
    personal: '#10b981',  // Emerald
    imported: '#64748b',  // Slate
  };
  return colors[category] || colors.personal;
}