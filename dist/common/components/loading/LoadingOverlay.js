import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function LoadingOverlay(_a) {
    var isLoading = _a.isLoading, _b = _a.delay, delay = _b === void 0 ? 500 : _b;
    var _c = useState(true), show = _c[0], setShow = _c[1];
    useEffect(function () {
        if (!isLoading) {
            var timeout_1 = setTimeout(function () { return setShow(false); }, delay);
            return function () { return clearTimeout(timeout_1); };
        }
        else {
            setShow(true);
        }
    }, [isLoading, delay]);
    if (!show)
        return null;
    return (_jsx("div", { className: "absolute inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ".concat(isLoading ? 'opacity-100' : 'opacity-0'), children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" }) }));
}
