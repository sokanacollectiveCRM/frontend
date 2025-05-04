/**
 * Custom hook for confirm dialog
 * @param initialState string | null
 * @returns A stateful value, and a function to update it.
 * @example const [open, setOpen] = useDialogState<"approve" | "reject">()
 */
export default function useDialogState<T extends string | boolean>(initialState?: T | null): readonly [T | null, (str: T | null) => void];
//# sourceMappingURL=use-dialog-state.d.ts.map