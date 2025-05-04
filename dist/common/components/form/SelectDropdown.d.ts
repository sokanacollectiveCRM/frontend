interface SelectDropdownProps {
    onValueChange?: (value: string) => void;
    defaultValue: string | undefined;
    placeholder?: string;
    isPending?: boolean;
    items: {
        label: string;
        value: string;
    }[] | undefined;
    disabled?: boolean;
    className?: string;
    isControlled?: boolean;
}
export declare function SelectDropdown({ defaultValue, onValueChange, isPending, items, placeholder, disabled, className, isControlled, }: SelectDropdownProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SelectDropdown.d.ts.map