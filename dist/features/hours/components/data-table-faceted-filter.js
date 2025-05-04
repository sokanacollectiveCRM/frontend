import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, } from '@/common/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger, } from '@/common/components/ui/popover';
import { Separator } from '@/common/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
export function DataTableFacetedFilter(_a) {
    var column = _a.column, title = _a.title, options = _a.options;
    var facets = column === null || column === void 0 ? void 0 : column.getFacetedUniqueValues();
    var selectedValues = new Set(column === null || column === void 0 ? void 0 : column.getFilterValue());
    return (_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', size: 'sm', className: 'h-8 border-dashed', children: [_jsx(PlusCircledIcon, { className: 'h-4 w-4' }), title, (selectedValues === null || selectedValues === void 0 ? void 0 : selectedValues.size) > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, { orientation: 'vertical', className: 'mx-2 h-4' }), _jsx(Badge, { variant: 'secondary', className: 'rounded-sm px-1 font-normal lg:hidden', children: selectedValues.size }), _jsx("div", { className: 'hidden space-x-1 lg:flex', children: selectedValues.size > 2 ? (_jsxs(Badge, { variant: 'secondary', className: 'rounded-sm px-1 font-normal', children: [selectedValues.size, " selected"] })) : (options
                                        .filter(function (option) { return selectedValues.has(option.value); })
                                        .map(function (option) { return (_jsx(Badge, { variant: 'secondary', className: 'rounded-sm px-1 font-normal', children: option.label }, option.value)); })) })] }))] }) }), _jsx(PopoverContent, { className: 'w-[200px] p-0', align: 'start', children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: title }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: "No results found." }), _jsx(CommandGroup, { children: options.map(function (option) {
                                        var isSelected = selectedValues.has(option.value);
                                        return (_jsxs(CommandItem, { onSelect: function () {
                                                if (isSelected) {
                                                    selectedValues.delete(option.value);
                                                }
                                                else {
                                                    selectedValues.add(option.value);
                                                }
                                                var filterValues = Array.from(selectedValues);
                                                column === null || column === void 0 ? void 0 : column.setFilterValue(filterValues.length ? filterValues : undefined);
                                            }, children: [_jsx("div", { className: cn('flex h-4 w-4 items-center justify-center rounded-sm border border-primary', isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'opacity-50 [&_svg]:invisible'), children: _jsx(CheckIcon, { className: cn('h-4 w-4') }) }), option.icon && (_jsx(option.icon, { className: 'h-4 w-4 text-muted-foreground' })), _jsx("span", { children: option.label }), (facets === null || facets === void 0 ? void 0 : facets.get(option.value)) && (_jsx("span", { className: 'ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs', children: facets.get(option.value) }))] }, option.value));
                                    }) }), selectedValues.size > 0 && (_jsxs(_Fragment, { children: [_jsx(CommandSeparator, {}), _jsx(CommandGroup, { children: _jsx(CommandItem, { onSelect: function () { return column === null || column === void 0 ? void 0 : column.setFilterValue(undefined); }, className: 'justify-center text-center', children: "Clear filters" }) })] }))] })] }) })] }));
}
