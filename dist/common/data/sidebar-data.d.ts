export interface SidebarItem {
    title: string;
    url: string;
    icon: React.ElementType;
}
export interface SidebarSection {
    label: string;
    items: SidebarItem[];
}
export declare const sidebarSections: {
    label: string;
    items: {
        title: string;
        url: string;
        icon: import("react").ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
    }[];
}[];
//# sourceMappingURL=sidebar-data.d.ts.map