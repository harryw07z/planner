import { useState, useEffect } from "react";
import { cn, generateCalendarDays, isDateBetween, isSameDay } from "@/lib/utils";
import { CalendarDay, Feature, RoadmapEvent, RoadmapEventWithFeature } from "@/lib/types";
import FeatureCard from "./FeatureCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarGridProps {
  features: Feature[];
  events: RoadmapEvent[];
  onAddEvent: (featureId: number, startDate: Date, endDate: Date, projectId: number) => void;
}

const CalendarGrid = ({ features, events, onAddEvent }: CalendarGridProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Create events with features
  const eventsWithFeatures: RoadmapEventWithFeature[] = events.map(event => {
    const feature = features.find(f => f.id === event.featureId);
    return {
      ...event,
      feature: feature!
    };
  });

  // Generate calendar days
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = generateCalendarDays(year, month);

    // Add events to days
    for (const event of eventsWithFeatures) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      days.forEach(day => {
        if (isDateBetween(day.date, startDate, endDate)) {
          day.events.push(event);
        }
      });
    }

    setCalendarDays(days);
  }, [currentDate, events, features, eventsWithFeatures]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, day: CalendarDay) => {
    e.preventDefault();
    try {
      const featureData = e.dataTransfer.getData("application/json");
      if (featureData) {
        const feature = JSON.parse(featureData) as Feature;
        
        // Calculate end date based on feature duration
        const startDate = new Date(day.date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + feature.duration - 1);
        
        // Create event
        onAddEvent(feature.id, startDate, endDate, feature.projectId);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Calendar Header with Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="text-lg font-medium">
          {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="py-2 px-3 text-center text-sm font-medium text-text">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              "calendar-day p-1 border-r border-b border-neutral-200 min-h-[100px]",
              day.isCurrentMonth ? "current-month" : "other-month bg-neutral-50",
              day.isToday && "bg-blue-50"
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, day)}
          >
            <div 
              className={cn(
                "text-xs p-1", 
                !day.isCurrentMonth && "text-neutral-400",
                day.isToday && "font-medium rounded-full bg-primary w-5 h-5 flex items-center justify-center text-white"
              )}
            >
              {day.date.getDate()}
            </div>
            
            {/* Feature cards */}
            <div className="overflow-auto max-h-[80px]">
              {day.events.map((event, eventIndex) => (
                <FeatureCard
                  key={`${event.id}-${eventIndex}`}
                  feature={event.feature}
                  isBacklog={false}
                  isDraggable={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
