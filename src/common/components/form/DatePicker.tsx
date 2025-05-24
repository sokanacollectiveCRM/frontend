import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/common/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
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
              aria-label={`Select ${label}: ${(field.value as unknown) instanceof Date &&
                  !isNaN((field.value as Date).getTime())
                  ? format(field.value as Date, dateFormat)
                  : placeholder
                }`}
              className={cn(
                "w-50 justify-start text-left font-normal",
                !field.value && "text-muted-foreground",
                buttonClassName
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {(field.value as unknown) instanceof Date &&
                !isNaN((field.value as Date).getTime())
                ? format(field.value as Date, dateFormat)
                : placeholder}
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