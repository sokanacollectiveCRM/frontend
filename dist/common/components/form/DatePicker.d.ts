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
export declare function DatePicker<TFieldValues extends FieldValues = FieldValues>({ field, label, description, placeholder, className, buttonClassName, calendarClassName, dateFormat, disabled, onBlur, }: DatePickerProps<TFieldValues>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=DatePicker.d.ts.map