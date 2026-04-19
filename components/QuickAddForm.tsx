import { useState } from "react";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScheduleItem } from "../types/schedule";

interface Props {
  onAdd: (item: Omit<ScheduleItem, 'id'>) => void;
}

export default function QuickAddForm({ onAdd }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('personal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime) return;

    onAdd({
      title,
      date,
      startTime,
      endTime: endTime || undefined,
      location: location || undefined,
      category,
    });

    // Reset form
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setCategory('personal');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        Quick Add Event
      </Button>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-200 py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Event Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?"
              required
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="class">Class</option>
                <option value="meeting">Meeting</option>
                <option value="appointment">Appointment</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Start Time *
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                End Time
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where?"
              className="bg-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Add Event
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}