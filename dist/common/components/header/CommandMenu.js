import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/common/components/ui/command';
import { ScrollArea } from '@/common/components/ui/scroll-area';
import { useSearch } from '@/common/contexts/search-context';
import { sidebarSections } from '@/common/data/sidebar-data';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
export function CommandMenu() {
    var navigate = useNavigate();
    var _a = useSearch(), open = _a.open, setOpen = _a.setOpen;
    var runCommand = React.useCallback(function (command) {
        setOpen(false);
        command();
    }, [setOpen]);
    return (_jsxs(CommandDialog, { modal: true, open: open, onOpenChange: setOpen, children: [_jsx(CommandInput, { placeholder: "Type a command or search..." }), _jsx(CommandList, { children: _jsxs(ScrollArea, { type: "hover", className: "h-72 pr-1", children: [_jsx(CommandEmpty, { children: "No results found." }), sidebarSections.map(function (section) { return (_jsx(CommandGroup, { heading: section.label, children: section.items.map(function (item) { return (_jsxs(CommandItem, { value: item.title, onSelect: function () { return runCommand(function () { return navigate(item.url); }); }, children: [_jsx("div", { className: "mr-2 flex h-4 w-4 items-center justify-center", children: _jsx(ArrowRight, { className: "size-2 text-muted-foreground/80" }) }), item.title] }, item.url)); }) }, section.label)); })] }) })] }));
}
