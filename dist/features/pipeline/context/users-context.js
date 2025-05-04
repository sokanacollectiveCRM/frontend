import { jsx as _jsx } from "react/jsx-runtime";
import useDialogState from '@/common/hooks/ui/use-dialog-state';
import React, { useState } from 'react';
var UsersContext = React.createContext(null);
export default function UsersProvider(_a) {
    var children = _a.children;
    var _b = useDialogState(null), open = _b[0], setOpen = _b[1];
    var _c = useState(null), currentRow = _c[0], setCurrentRow = _c[1];
    return (_jsx(UsersContext.Provider, { value: { open: open, setOpen: setOpen, currentRow: currentRow, setCurrentRow: setCurrentRow }, children: children }));
}
// eslint-disable-next-line react-refresh/only-export-components
export var useUsers = function () {
    var usersContext = React.useContext(UsersContext);
    if (!usersContext) {
        throw new Error('useUsers has to be used within <UsersContext>');
    }
    return usersContext;
};
