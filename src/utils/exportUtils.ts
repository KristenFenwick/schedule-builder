import { ScheduleItem } from "../types/schedule";

export function exportToICS(items: ScheduleItem[]): void {
  const formatDateForICS = (date: string, time: string): string => {
    const d = new Date(`${date}T${time}`);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const events = items.map(item => {
    const start = formatDateForICS(item.date, item.startTime);
    const end = item.endTime 
      ? formatDateForICS(item.date, item.endTime)
      : formatDateForICS(item.date, '23:59');
    
    return [
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${item.title}`,
      item.location ? `LOCATION:${item.location}` : '',
      item.notes ? `DESCRIPTION:${item.notes}` : '',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScheduleFlow//EN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'schedule.ics';
  link.click();
  URL.revokeObjectURL(url);
}