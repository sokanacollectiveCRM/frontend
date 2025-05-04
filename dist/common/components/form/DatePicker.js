import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/common/components/ui/button";
import { Calendar } from "@/common/components/ui/calendar";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/common/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
export function DatePicker(_a) {
    var field = _a.field, label = _a.label, description = _a.description, _b = _a.placeholder, placeholder = _b === void 0 ? "Pick a date" : _b, className = _a.className, buttonClassName = _a.buttonClassName, calendarClassName = _a.calendarClassName, _c = _a.dateFormat, dateFormat = _c === void 0 ? "PPP" : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, onBlur = _a.onBlur;
    var handleSelect = function (date) {
        field.onChange(date);
        if (onBlur)
            onBlur();
    };
    return (_jsxs(FormItem, { className: className, children: [_jsx(FormLabel, { children: label }), _jsx(FormControl, { children: _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { type: "button", variant: "outline", disabled: disabled, "aria-label": "Select ".concat(label, ": ").concat(field.value ? format(field.value, dateFormat) : 'No date selected'), className: cn("w-50 justify-start text-left font-normal", !field.value && "text-muted-foreground", buttonClassName), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), format(field.value, dateFormat)] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: _jsx(Calendar, { mode: "single", selected: field.value, onSelect: handleSelect, initialFocus: true, disabled: disabled, className: calendarClassName }) })] }) }), description && _jsx(FormDescription, { children: description }), _jsx(FormMessage, {})] }));
}
