var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Separator } from '@/common/components/ui/separator';
import { cn } from '@/lib/utils';
import React from 'react';
export var Header = function (_a) {
    var className = _a.className, fixed = _a.fixed, children = _a.children, props = __rest(_a, ["className", "fixed", "children"]);
    var _b = React.useState(0), offset = _b[0], setOffset = _b[1];
    React.useEffect(function () {
        var onScroll = function () {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };
        // Add scroll listener to the body
        document.addEventListener('scroll', onScroll, { passive: true });
        // Clean up the event listener on unmount
        return function () { return document.removeEventListener('scroll', onScroll); };
    }, []);
    return (_jsxs("header", __assign({ className: cn('flex h-16 items-center gap-3 bg-background p-4 sm:gap-4', fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md', offset > 10 && fixed ? 'shadow' : 'shadow-none', className) }, props, { children: [_jsx(Separator, { orientation: 'vertical', className: 'h-6' }), children] })));
};
Header.displayName = 'Header';
