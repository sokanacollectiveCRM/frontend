import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger, } from '@/common/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Settings2, Trash2 } from 'lucide-react';
import { useUsers } from '../context/users-context';
export function DataTableRowActions(_a) {
    var row = _a.row;
    var _b = useUsers(), setOpen = _b.setOpen, setCurrentRow = _b.setCurrentRow;
    return (_jsx(_Fragment, { children: _jsxs(DropdownMenu, { modal: false, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: 'ghost', className: 'flex h-8 w-8 p-0 data-[state=open]:bg-muted', children: [_jsx(DotsHorizontalIcon, { className: 'h-4 w-4' }), _jsx("span", { className: 'sr-only', children: "Open menu" })] }) }), _jsxs(DropdownMenuContent, { align: 'end', className: 'w-[160px]', children: [_jsxs(DropdownMenuItem, { onClick: function () {
                                setCurrentRow(row.original);
                                setOpen('edit');
                            }, children: ["Edit", _jsx(DropdownMenuShortcut, { children: _jsx(Settings2, { size: 16 }) })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: function () {
                                setCurrentRow(row.original);
                                setOpen('delete');
                            }, className: '!text-red-500', children: ["Delete", _jsx(DropdownMenuShortcut, { children: _jsx(Trash2, { size: 16 }) })] })] })] }) }));
}
