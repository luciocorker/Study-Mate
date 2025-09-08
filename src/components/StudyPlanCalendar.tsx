import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Clock, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface StudyEvent {
  id: string;
  date: string;
  subject: string;
  tasks: string[];
  timeSlot: string;
  duration: number;
}

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface UserPreferences {
  unavailableDates: string[];
  availabilitySlots: AvailabilitySlot[];
  studyDuration: number; // hours per day
  subjects: string[];
}

const StudyPlanCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  
  // Setup form state
  const [preferences, setPreferences] = useState<UserPreferences>({
    unavailableDates: [],
    availabilitySlots: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00' },
    ],
    studyDuration: 2,
    subjects: ['English Paper 1', 'Maths Paper 1']
  });

  const [newUnavailableDate, setNewUnavailableDate] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addUnavailableDate = () => {
    if (newUnavailableDate && !preferences.unavailableDates.includes(newUnavailableDate)) {
      setPreferences(prev => ({
        ...prev,
        unavailableDates: [...prev.unavailableDates, newUnavailableDate]
      }));
      setNewUnavailableDate('');
    }
  };

  const removeUnavailableDate = (date: string) => {
    setPreferences(prev => ({
      ...prev,
      unavailableDates: prev.unavailableDates.filter(d => d !== date)
    }));
  };

  const updateAvailabilitySlot = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setPreferences(prev => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.map(slot =>
        slot.day === day ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleDayAvailability = (day: string, checked: boolean) => {
    if (checked) {
      if (!preferences.availabilitySlots.find(slot => slot.day === day)) {
        setPreferences(prev => ({
          ...prev,
          availabilitySlots: [...prev.availabilitySlots, { day, startTime: '09:00', endTime: '17:00' }]
        }));
      }
    } else {
      setPreferences(prev => ({
        ...prev,
        availabilitySlots: prev.availabilitySlots.filter(slot => slot.day !== day)
      }));
    }
  };

  const addSubject = () => {
    if (newSubject && !preferences.subjects.includes(newSubject)) {
      setPreferences(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setPreferences(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const generateStudyPlan = () => {
    const events: StudyEvent[] = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Generate 3 months ahead

    let currentDay = new Date(startDate);
    let subjectIndex = 0;

    while (currentDay <= endDate) {
      const dateString = currentDay.toISOString().split('T')[0];
      const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if this date is available
      const isUnavailable = preferences.unavailableDates.includes(dateString);
      const daySlot = preferences.availabilitySlots.find(slot => slot.day === dayName);
      
      if (!isUnavailable && daySlot) {
        const subject = preferences.subjects[subjectIndex % preferences.subjects.length];
        
        // Generate study tasks based on subject
        let tasks = [];
        if (subject.includes('English')) {
          tasks = ['Reading comprehension practice', 'Essay writing', 'Grammar review'];
        } else if (subject.includes('Maths')) {
          tasks = ['Problem solving practice', 'Formula review', 'Past paper questions'];
        } else {
          tasks = ['Review notes', 'Practice questions', 'Summary writing'];
        }

        events.push({
          id: `study-${dateString}-${subjectIndex}`,
          date: dateString,
          subject,
          tasks: tasks.slice(0, 2), // Limit to 2 tasks per session
          timeSlot: `${daySlot.startTime} - ${daySlot.endTime}`,
          duration: preferences.studyDuration
        });

        subjectIndex++;
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    setStudyEvents(events);
    setShowSetup(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForDate = (dateString: string) => {
    return studyEvents.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const events = getEventsForDate(dateString);
      const isSelected = selectedDate === dateString;
      const isSpecificDateUnavailable = preferences.unavailableDates.includes(dateString);
      
      // Check if the day of the week is available
      const dayOfWeek = new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      const isDayOfWeekAvailable = preferences.availabilitySlots.some(slot => slot.day === dayOfWeek);
      
      const isUnavailable = isSpecificDateUnavailable || !isDayOfWeekAvailable;

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-100 p-1 cursor-pointer hover:bg-gray-50 ${
            isSelected ? 'bg-blue-50 border-blue-300' : ''
          } ${isUnavailable ? 'bg-red-50' : ''}`}
          onClick={() => setSelectedDate(dateString)}
        >
          <div className="font-medium text-sm">{day}</div>
          <div className="space-y-1">
            {isUnavailable ? (
              <div className="text-xs p-1 rounded bg-red-100 text-red-800">
                {isSpecificDateUnavailable ? 'Unavailable' : 'Day Off'}
              </div>
            ) : (
              events.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="text-xs p-1 rounded bg-green-100 text-green-800"
                >
                  {event.subject.split(' ')[0]} Study
                </div>
              ))
            )}
            {events.length > 2 && (
              <div className="text-xs text-gray-500">+{events.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (showSetup) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Setup Your Study Plan</CardTitle>
            <p className="text-gray-600">Tell us your availability so we can create a personalized study schedule</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subjects */}
            <div>
              <Label className="text-lg font-semibold">Subjects to Study</Label>
              <div className="flex gap-2 mt-2 mb-3">
                <Input
                  placeholder="Add a subject..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                />
                <Button onClick={addSubject} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.subjects.map(subject => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSubject(subject)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Study Duration */}
            <div>
              <Label htmlFor="duration" className="text-lg font-semibold">Daily Study Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                value={preferences.studyDuration}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  studyDuration: parseInt(e.target.value) || 1 
                }))}
                className="w-32 mt-2"
              />
            </div>

            {/* Weekly Availability */}
            <div>
              <Label className="text-lg font-semibold">Weekly Availability</Label>
              <div className="space-y-3 mt-3">
                {weekDays.map(day => {
                  const slot = preferences.availabilitySlots.find(s => s.day === day);
                  const isAvailable = !!slot;
                  
                  return (
                    <div key={day} className="flex items-center gap-4 p-3 border rounded">
                      <div className="flex items-center space-x-2 w-24">
                        <Checkbox
                          id={day}
                          checked={isAvailable}
                          onCheckedChange={(checked) => toggleDayAvailability(day, checked as boolean)}
                        />
                        <Label htmlFor={day} className="font-medium">{day}</Label>
                      </div>
                      {isAvailable && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateAvailabilitySlot(day, 'startTime', e.target.value)}
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateAvailabilitySlot(day, 'endTime', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unavailable Dates */}
            <div>
              <Label className="text-lg font-semibold">Unavailable Dates</Label>
              <p className="text-sm text-gray-600 mb-3">Add specific dates when you won't be available to study</p>
              <div className="flex gap-2 mb-3">
                <Input
                  type="date"
                  value={newUnavailableDate}
                  onChange={(e) => setNewUnavailableDate(e.target.value)}
                />
                <Button onClick={addUnavailableDate} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.unavailableDates.map(date => (
                  <Badge key={date} variant="destructive" className="flex items-center gap-1">
                    {new Date(date + 'T00:00:00').toLocaleDateString()}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeUnavailableDate(date)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              onClick={generateStudyPlan} 
              className="w-full"
              disabled={preferences.subjects.length === 0 || preferences.availabilitySlots.length === 0}
            >
              Generate My Study Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized Study Calendar</h1>
          <p className="text-gray-600">Follow your customized study schedule</p>
        </div>
        <Button onClick={() => setShowSetup(true)} variant="outline">
          Modify Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {formatDate(currentDate)}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center font-medium text-sm text-gray-600 border-b">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-sm">Study Session</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-sm">Unavailable / Day Off</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvents.map((event) => (
                      <div key={event.id} className="border-l-4 border-l-green-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <h3 className="font-semibold">{event.subject}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{event.timeSlot}</span>
                          <span>({event.duration}h)</span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {event.tasks.map((task, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : selectedDate && (preferences.unavailableDates.includes(selectedDate) || 
                  !preferences.availabilitySlots.some(slot => 
                    slot.day === new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
                  )) ? (
                  <p className="text-red-600 text-sm">
                    {preferences.unavailableDates.includes(selectedDate) 
                      ? "You marked this day as unavailable." 
                      : "This day of the week is not in your available schedule."}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">No study sessions scheduled for this date.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanCalendar;