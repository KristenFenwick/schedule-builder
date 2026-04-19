import { useState } from "react";
import { Calendar, Clock, Upload, FileText, Trash2, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import ScheduleImporter from "../components/ScheduleImporter";
import ScheduleTimeline from "../components/ScheduleTimeline";
import QuickAddForm from "../components/QuickAddForm";
import { ScheduleItem, ParsedData } from "../types/schedule";
import { exportToICS } from "../utils/exportUtils";

export default function App() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [showImporter, setShowImporter] = useState(false);

  const handleParsedData = (data: ParsedData) => {
    const newItems: ScheduleItem[] = data.events.map((event, index) => ({
      id: `imported-${Date.now()}-${index}`,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category || 'imported',
      location: event.location,
      notes: event.notes,
    }));
    
    setScheduleItems(prev => [...prev, ...newItems]);
    setShowImporter(false);
  };

  const handleQuickAdd = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `quick-${Date.now()}`,
    };
    setScheduleItems(prev => [...prev, newItem]);
  };

  const handleDelete = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  const handleExport = () => {
    exportToICS(scheduleItems);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ScheduleFlow</h1>
              <p className="text-xs text-slate-500">Smart schedule builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {scheduleItems.length > 0 && (
              <Button 
                onClick={handleExport}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Import Section */}
        <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">
                    Import Your Schedule
                  </h2>
                  <p className="text-sm text-slate-600">
                    Paste your syllabus, work schedule, or event list. We'll extract dates, times, and events automatically.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowImporter(!showImporter)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <FileText className="w-4 h-4" />
                {showImporter ? 'Hide Import' : 'Import Schedule'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Panel */}
        {showImporter && (
          <div className="mb-8">
            <ScheduleImporter onParsed={handleParsedData} />
          </div>
        )}

        {/* Quick Add Form */}
        <div className="mb-8">
          <QuickAddForm onAdd={handleQuickAdd} />
        </div>

        {/* Schedule Timeline */}
        <ScheduleTimeline 
          items={scheduleItems} 
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}