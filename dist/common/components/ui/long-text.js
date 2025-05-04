import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Popover, PopoverContent, PopoverTrigger, } from '@/common/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/common/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
export default function LongText(_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.contentClassName, contentClassName = _c === void 0 ? '' : _c;
    var ref = useRef(null);
    var _d = useState(false), isOverflown = _d[0], setIsOverflown = _d[1];
    useEffect(function () {
        if (checkOverflow(ref.current)) {
            setIsOverflown(true);
            return;
        }
        setIsOverflown(false);
    }, []);
    if (!isOverflown)
        return (_jsx("div", { ref: ref, className: cn('truncate', className), children: children }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: 'hidden sm:block', children: _jsx(TooltipProvider, { delayDuration: 0, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("div", { ref: ref, className: cn('truncate', className), children: children }) }), _jsx(TooltipContent, { children: _jsx("p", { className: contentClassName, children: children }) })] }) }) }), _jsx("div", { className: 'sm:hidden', children: _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx("div", { ref: ref, className: cn('truncate', className), children: children }) }), _jsx(PopoverContent, { className: cn('w-fit', contentClassName), children: _jsx("p", { children: children }) })] }) })] }));
}
var checkOverflow = function (textContainer) {
    if (textContainer) {
        return (textContainer.offsetHeight < textContainer.scrollHeight ||
            textContainer.offsetWidth < textContainer.scrollWidth);
    }
    return false;
};
