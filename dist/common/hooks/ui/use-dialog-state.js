import { useState } from 'react';
/**
 * Custom hook for confirm dialog
 * @param initialState string | null
 * @returns A stateful value, and a function to update it.
 * @example const [open, setOpen] = useDialogState<"approve" | "reject">()
 */
export default function useDialogState(initialState) {
    if (initialState === void 0) { initialState = null; }
    var _a = useState(initialState), open = _a[0], _setOpen = _a[1];
    var setOpen = function (str) {
        return _setOpen(function (prev) { return (prev === str ? null : str); });
    };
    return [open, setOpen];
}
