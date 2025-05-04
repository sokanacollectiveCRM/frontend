'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, AlertDescription, AlertTitle } from '@/common/components/ui/alert';
import { ConfirmDialog } from '@/common/components/ui/confirm-dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { toast } from '@/common/hooks/toast/use-toast';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
export function UsersDeleteDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, currentRow = _a.currentRow;
    var _b = useState(''), value = _b[0], setValue = _b[1];
    var handleDelete = function () {
        var firstname = currentRow.firstname, lastname = currentRow.lastname;
        var fullName = "".concat(firstname, " ").concat(lastname);
        if (value.trim() !== fullName)
            return;
        onOpenChange(false);
        toast({
            title: 'The following user has been deleted:',
            description: (_jsx("pre", { className: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4', children: _jsx("code", { className: 'text-white', children: JSON.stringify(currentRow, null, 2) }) })),
        });
    };
    return (_jsx(ConfirmDialog, { open: open, onOpenChange: onOpenChange, handleConfirm: handleDelete, title: _jsxs("span", { className: 'text-destructive', children: [_jsx(TriangleAlert, { className: 'mr-1 inline-block stroke-destructive', size: 18 }), ' ', "Delete User"] }), desc: _jsxs("div", { className: 'space-y-4', children: [_jsxs("p", { className: 'mb-2', children: ["Are you sure you want to delete", ' ', _jsx("br", {}), "This action will permanently remove the user with the role of", ' ', "from the system. This cannot be undone."] }), _jsxs(Label, { className: 'my-2', children: ["Username:", _jsx(Input, { value: value, onChange: function (e) { return setValue(e.target.value); }, placeholder: 'Enter username to confirm deletion.' })] }), _jsxs(Alert, { variant: 'destructive', children: [_jsx(AlertTitle, { children: "Warning!" }), _jsx(AlertDescription, { children: "Please be carefull, this operation can not be rolled back." })] })] }), confirmText: 'Delete', destructive: true }));
}
