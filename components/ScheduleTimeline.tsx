import { Clock, MapPin, Trash2, Calendar } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ScheduleItem } from "../types/schedule";
import { groupByDate, formatDate, getCategoryColor, formatTime } from "../utils/scheduleUtils";

interface Props {
  items: ScheduleItem[];
  onDelete: (id: string) => void;
}

export default function ScheduleTimeline({ items, onDelete }: Props) {
  const grouped = groupByDate(items);
  const sortedDates = Object.keys(grouped).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (items.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-300 bg-white">
        <CardContent className="py-16 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            No events yet
          </h3>
          <p className="text-sm text-slate-500">
            Import a schedule or add events manually to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Your Schedule ({items.length} event{items.length !== 1 ? 's' : ''})
        </h2>
      </div>

      {sortedDates.map(date => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(date)}
          </h3>
          <div className="space-y-2">
            {grouped[date]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(item => (
                <Card 
                  key={item.id} 
                  className="border-l-4 bg-white hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: getCategoryColor(item.category) }}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${getCategoryColor(item.category)}20`,
                              color: getCategoryColor(item.category)
                            }}
                          >
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(item.startTime)}
                            {item.endTime && ` - ${formatTime(item.endTime)}`}
                          </span>
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.location}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-2 italic">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}