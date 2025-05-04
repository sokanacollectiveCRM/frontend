import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { useSearch } from '@/common/contexts/search-context';
import { cn } from '@/lib/utils';
import { Search as SearchIcon } from 'lucide-react';
export function Search(_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.placeholder, placeholder = _c === void 0 ? 'Search' : _c;
    var setOpen = useSearch().setOpen;
    return (_jsxs(Button, { variant: 'outline', className: cn('relative h-8 w-32 sm:w-48 md:w-64 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted/50', className), onClick: function () { return setOpen(true); }, children: [_jsx(SearchIcon, { "aria-hidden": 'true', className: 'absolute left-1.5 top-1/2 -translate-y-1/2' }), _jsx("span", { className: 'ml-3', children: placeholder }), _jsxs("kbd", { className: 'pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex', children: [_jsx("span", { className: 'text-xs', children: "\u2318" }), "K"] })] }));
}
