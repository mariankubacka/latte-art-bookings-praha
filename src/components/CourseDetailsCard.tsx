import { Calendar, Clock } from "lucide-react";

interface CourseDetailsCardProps {
  selectedDate: Date;
}

export function CourseDetailsCard({ selectedDate }: CourseDetailsCardProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h4 className="font-semibold mb-2">Detaily kurzu</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            {selectedDate.toLocaleDateString('sk-SK', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>9:00 - 17:00</span>
        </div>
      </div>
    </div>
  );
}