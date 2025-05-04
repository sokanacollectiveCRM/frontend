import * as React from 'react';
interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    disabled?: boolean;
    desc: React.JSX.Element | string;
    cancelBtnText?: string;
    confirmText?: React.ReactNode;
    destructive?: boolean;
    handleConfirm: () => void;
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
}
export declare function ConfirmDialog(props: ConfirmDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=confirm-dialog.d.ts.map