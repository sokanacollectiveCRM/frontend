import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useUsers } from '../context/clients-context';
import { UsersActionDialog } from './users-action-dialog';
import { UsersDeleteDialog } from './users-delete-dialog';
import { UsersInviteDialog } from './users-invite-dialog';
export function UsersDialogs() {
    var _a = useUsers(), open = _a.open, setOpen = _a.setOpen, currentRow = _a.currentRow, setCurrentRow = _a.setCurrentRow;
    return (_jsxs(_Fragment, { children: [_jsx(UsersActionDialog, { open: open === 'add', onOpenChange: function () { return setOpen('add'); } }, 'user-add'), _jsx(UsersInviteDialog, { open: open === 'invite', onOpenChange: function () { return setOpen('invite'); } }, 'user-invite'), currentRow && (_jsxs(_Fragment, { children: [_jsx(UsersActionDialog, { open: open === 'edit', onOpenChange: function () {
                            setOpen('edit');
                            setTimeout(function () {
                                setCurrentRow(null);
                            }, 500);
                        }, currentRow: currentRow }, "user-edit-".concat(currentRow.id)), _jsx(UsersDeleteDialog, { open: open === 'delete', onOpenChange: function () {
                            setOpen('delete');
                            setTimeout(function () {
                                setCurrentRow(null);
                            }, 500);
                        }, currentRow: currentRow }, "user-delete-".concat(currentRow.id))] }))] }));
}
