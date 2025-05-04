import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, } from '@/common/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
export function DataTableViewOptions(_a) {
    var table = _a.table;
    return (_jsxs(DropdownMenu, { modal: false, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', size: 'sm', className: 'ml-auto hidden h-8 lg:flex', children: [_jsx(MixerHorizontalIcon, { className: 'mr-2 h-4 w-4' }), "View"] }) }), _jsxs(DropdownMenuContent, { align: 'end', className: 'w-[150px]', children: [_jsx(DropdownMenuLabel, { children: "Toggle columns" }), _jsx(DropdownMenuSeparator, {}), table
                        .getAllColumns()
                        .filter(function (column) {
                        return typeof column.accessorFn !== 'undefined' && column.getCanHide();
                    })
                        .map(function (column) {
                        return (_jsx(DropdownMenuCheckboxItem, { className: 'capitalize', checked: column.getIsVisible(), onCheckedChange: function (value) { return column.toggleVisibility(!!value); }, children: column.id }, column.id));
                    })] })] }));
}
