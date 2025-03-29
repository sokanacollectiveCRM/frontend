import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

export interface DatePickerProps<TFieldValues extends FieldValues = FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  description?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  calendarClassName?: string;
  dateFormat?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

export function DatePicker<TFieldValues extends FieldValues = FieldValues>({
  field,
  label,
  description,
  placeholder = "Pick a date",
  className,
  buttonClassName,
  calendarClassName,
  dateFormat = "PPP",
  disabled = false,
  onBlur,
}: DatePickerProps<TFieldValues>) {
  const handleSelect = (date: Date | undefined) => {
    field.onChange(date);
    if (onBlur) onBlur();
  };

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={`Select ${label}: ${field.value ? format(field.value, dateFormat) : 'No date selected'}`}
              className={cn(
                "w-50 justify-start text-left font-normal",
                !field.value && "text-muted-foreground",
                buttonClassName
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value instanceof Date ? format(field.value, dateFormat) : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={handleSelect}
              initialFocus
              disabled={disabled}
              className={calendarClassName}
            />
          </PopoverContent>
        </Popover>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}