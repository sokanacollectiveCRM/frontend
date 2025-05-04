import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/common/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon, } from '@radix-ui/react-icons';
export function DataTableColumnHeader(_a) {
    var column = _a.column, title = _a.title, className = _a.className;
    if (!column.getCanSort()) {
        return _jsx("div", { className: cn(className), children: title });
    }
    return (_jsx("div", { className: cn('flex items-center space-x-2', className), children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: 'ghost', size: 'sm', className: '-ml-3 h-8 data-[state=open]:bg-accent', children: [_jsx("span", { children: title }), column.getIsSorted() === 'desc' ? (_jsx(ArrowDownIcon, { className: 'ml-2 h-4 w-4' })) : column.getIsSorted() === 'asc' ? (_jsx(ArrowUpIcon, { className: 'ml-2 h-4 w-4' })) : (_jsx(CaretSortIcon, { className: 'ml-2 h-4 w-4' }))] }) }), _jsxs(DropdownMenuContent, { align: 'start', children: [_jsxs(DropdownMenuItem, { onClick: function () { return column.toggleSorting(false); }, children: [_jsx(ArrowUpIcon, { className: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' }), "Asc"] }), _jsxs(DropdownMenuItem, { onClick: function () { return column.toggleSorting(true); }, children: [_jsx(ArrowDownIcon, { className: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' }), "Desc"] }), column.getCanHide() && (_jsxs(_Fragment, { children: [_jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: function () { return column.toggleVisibility(false); }, children: [_jsx(EyeNoneIcon, { className: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' }), "Hide"] })] }))] })] }) }));
}
