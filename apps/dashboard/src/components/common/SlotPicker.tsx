import React from "react";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotPickerProps {
  slots: string[];
  selectedSlot?: string;
  onSelectSlot: (slot: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Slot Picker Component
 * Displays available appointment time slots
 */
const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <p className="text-sm text-muted-foreground">
          Loading available slots...
        </p>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">
          No available slots for this date
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Please choose another date or contact the clinic
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Available Time Slots</h3>
        <Badge variant="outline">{slots.length} slots available</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {slots.map((slot) => (
          <Button
            key={slot}
            type="button"
            variant={selectedSlot === slot ? "default" : "outline"}
            size="sm"
            className={cn(
              "justify-start px-2",
              selectedSlot === slot &&
                "ring-2 ring-offset-2 ring-clinic-primary",
            )}
            onClick={() => onSelectSlot(slot)}
          >
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="text-xs truncate">{slot}</span>
          </Button>
        ))}
      </div>
      {selectedSlot && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900">
            Selected: <span className="font-bold">{selectedSlot}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
