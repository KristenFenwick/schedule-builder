import { useState, useEffect } from "react";
import { Calendar, FileText, Upload, Download, Trash2, Plus, Clock, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { parseScheduleText } from "./utils/parseUtils";
import { generateICS } from "./utils/exportUtils";
import { ScheduleEvent, ParsedEvent } from "./types/schedule";

const categoryColors: Record<string, string> = {
  exam: "bg-red-100 text-red-800 border-red-200",
  class: "bg-blue-100 text-blue-800 border-blue-200",
  meeting: "bg-green-100 text-green-800 border-green-200",
  appointment: "bg-purple-100 text-purple-800 border-purple-200",
  deadline: "bg-orange-100 text-orange-800 border-orange-200",
  work: "bg-cyan-100 text-cyan-800 border-cyan-200",
  personal: "bg-gray-100 text-gray-800 border-gray-200",
};

const categoryDotColors: Record<string, string> = {
  exam: "bg-red-500",
  class: "bg-blue-500",
  meeting: "bg-green-500",
  appointment: "bg-purple-500",
  deadline: "bg-orange-500",
  work: "bg-cyan-500",
  personal: "bg-gray-500",
};

// Load PDF.js dynamically
function loadPdfJs(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if ((window as any).pdfjsLib) {
      resolve(true);
      return;
    }
    
    // Check if script tag already exists
    const existingScript = document.getElementById('pdfjs-script');
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = () => {
        if ((window as any).pdfjsLib) {
          resolve(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }
    
    // Create and load script
    const script = document.createElement('script');
    script.id = 'pdfjs-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load PDF.js');
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
}

function App() {
  const [inputText, setInputText] = useState("");
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [showParsed, setShowParsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  // Load PDF.js on mount
  useEffect(() => {
    loadPdfJs().then((loaded) => {
      setPdfJsLoaded(loaded);
    });
  }, []);

  const handleExtract = () => {
    setParseError(null);
    const result = parseScheduleText(inputText);
    setParsedEvents(result.events);
    setShowParsed(true);
  };

  const handleAddAll = () => {
    const newEvents: ScheduleEvent[] = parsedEvents.map((e, i) => ({
      id: Date.now() + i,
      ...e,
    }));
    setSchedule((prev) => [...prev, ...newEvents]);
    setParsedEvents([]);
    setShowParsed(false);
    setInputText("");
    setFileName(null);
  };

  const handleRemoveEvent = (id: number) => {
    setSchedule((prev) => prev.filter((e) => e.id !== id));
  };

  const handleExport = () => {
    const icsContent = generateICS(schedule);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Extract text from PDF using pdf.js
  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdfjsLib = (window as any).pdfjsLib;
    
    if (!pdfjsLib) {
      throw new Error("PDF.js library not loaded");
    }

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: { str: string }) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const handleFileUpload = async (file: File) => {
    setParseError(null);
    setFileName(file.name);
    setIsLoading(true);
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      if (!pdfJsLoaded) {
        setIsLoading(false);
        setParseError("PDF support is still loading. Please wait a moment and try again.");
        return;
      }
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);
        
        if (text.trim()) {
          setInputText(text);
        } else {
          setParseError("Could not extract text from PDF. The PDF might be image-based. Try copying text directly from your PDF viewer.");
        }
      } catch (err) {
        console.error("PDF extraction error:", err);
        setParseError(`Failed to read PDF: ${err instanceof Error ? err.message : 'Unknown error'}. Please try copying text directly from your PDF viewer and pasting it here.`);
      } finally {
        setIsLoading(false);
      }
    } else if (extension === 'txt' || extension === 'md') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text || "");
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else {
      setIsLoading(false);
      setParseError("Unsupported file type. Please upload a PDF, TXT, or MD file, or paste text directly.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSample = () => {
    setInputText(`Course Schedule - CS 301

Lectures: Monday/Wednesday 2:00 PM - 3:15 PM, Room 205
Office Hours: Friday 10:00 AM - 12:00 PM

Important Dates:
Midterm Exam - March 15, 2024 at 9:00 AM
Project Due - April 20, 2024 at 11:59 PM
Final Exam - May 10, 2024 at 2:00 PM - 4:00 PM`);
  };

  const groupedByDate = schedule.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, ScheduleEvent[]>);

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ScheduleFlow</h1>
              <p className="text-sm text-slate-500">Smart schedule import</p>
            </div>
          </div>
          {schedule.length > 0 && (
            <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-2" />
              Export .ics
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Import Schedule
                </CardTitle>
                <CardDescription>
                  Upload a PDF, text file, or paste your schedule content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                    ${isDragging 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'}
                    ${isLoading ? 'pointer-events-none opacity-60' : ''}
                  `}
                  onClick={() => !isLoading && document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.txt,.md"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={isLoading}
                  />
                  {isLoading ? (
                    <>
                      <Loader2 className="w-10 h-10 mx-auto mb-3 text-indigo-600 animate-spin" />
                      <p className="font-medium text-slate-700">Reading PDF...</p>
                      <p className="text-sm text-slate-500 mt-1">Extracting text from document</p>
                    </>
                  ) : (
                    <>
                      <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {fileName ? (
                        <div className="text-sm">
                          <p className="font-medium text-indigo-600">{fileName}</p>
                          <p className="text-slate-500 mt-1">Click or drag to replace</p>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <p className="font-medium text-slate-700">Drop your PDF here</p>
                          <p className="text-slate-500 mt-1">PDF, TXT, or MD files supported</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">or paste text</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste your schedule text (syllabus, email, document)..."
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      setFileName(null);
                    }}
                    className="min-h-48 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                </div>

                {parseError && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{parseError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleExtract} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={!inputText.trim() || isLoading}
                  >
                    Extract Events
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSample}
                    className="border-slate-200"
                    disabled={isLoading}
                  >
                    Try Sample
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Parsed Events Preview */}
            {showParsed && parsedEvents.length > 0 && (
              <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-emerald-800">
                      Found {parsedEvents.length} events
                    </CardTitle>
                    <Button 
                      size="sm" 
                      onClick={handleAddAll}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add All to Schedule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                  {parsedEvents.map((event, i) => (
                    <div 
                      key={i} 
                      className="bg-white p-3 rounded-lg border border-emerald-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900">{event.title}</h4>
                          <p className="text-sm text-slate-600">
                            {event.date} • {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </p>
                          {event.location && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[event.category]}`}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {showParsed && parsedEvents.length === 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="py-6 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-amber-800 font-medium">No events found</p>
                  <p className="text-sm text-amber-600 mt-1">
                    Try adding more structured text with dates and times
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Schedule Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Your Schedule
              </h2>
              {schedule.length > 0 && (
                <span className="text-sm text-slate-500">
                  {schedule.length} event{schedule.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {schedule.length === 0 ? (
              <Card className="border-slate-200 border-dashed bg-white">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No events yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Import or add events to see them here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-slate-500 mb-2 px-1">
                      {formatDate(date)}
                    </h3>
                    <div className="space-y-2">
                      {groupedByDate[date].map((event) => (
                        <Card key={event.id} className="border-slate-200 bg-white shadow-sm hover:shadow transition-shadow">
                          <CardContent className="py-3 px-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${categoryDotColors[event.category]}`} />
                                <div>
                                  <p className="font-medium text-slate-900">{event.title}</p>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {event.startTime}
                                      {event.endTime && ` - ${event.endTime}`}
                                    </span>
                                    {event.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {event.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[event.category]}`}>
                                  {event.category}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveEvent(event.id)}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default App;