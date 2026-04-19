import { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ParsedData, ParsedEvent } from "../types/schedule";
import { parseScheduleText } from "../utils/parseUtils";
import { formatTime } from "../utils/scheduleUtils";

interface Props {
  onParsed: (data: ParsedData) => void;
}

export default function ScheduleImporter({ onParsed }: Props) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ParsedEvent[]>([]);

  const handleProcess = () => {
    setIsProcessing(true);
    
    // Simulate processing delay for UX
    setTimeout(() => {
      const parsed = parseScheduleText(inputText);
      setPreview(parsed.events);
      setIsProcessing(false);
    }, 800);
  };

  const handleConfirm = () => {
    const parsed = parseScheduleText(inputText);
    onParsed(parsed);
    setInputText('');
    setPreview([]);
  };

  const sampleText = `CS 301 - Algorithms
Mon/Wed 2:00 PM - 3:15 PM
Room 205, Engineering Building
Starts: January 15, 2024

Team Standup
Every Tuesday 9:00 AM - 9:30 AM
Conference Room B

Project Deadline
March 15, 2024 at 11:59 PM
Submit via Canvas

Doctor Appointment
February 20, 2024 at 3:00 PM
Health Center, Building A`;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Smart Import
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Paste your schedule text (syllabus, email, document)
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your schedule, syllabus, or event list here..."
              className="min-h-48 font-mono text-sm bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleProcess}
              disabled={!inputText.trim() || isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isProcessing ? 'Processing...' : 'Extract Events'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setInputText(sampleText)}
              className="text-slate-600"
            >
              Try Sample
            </Button>
          </div>

          {/* Preview Results */}
          {preview.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Found {preview.length} event{preview.length !== 1 ? 's' : ''}:
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {preview.map((event, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-600">
                        {event.date} {event.startTime && `• ${formatTime(event.startTime)}`}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </p>
                      {event.location && (
                        <p className="text-xs text-slate-500 mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleConfirm}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Add to Schedule
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}