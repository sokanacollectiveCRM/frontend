import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CommandMenu } from '@/common/components/header/CommandMenu';
import React from 'react';
var SearchContext = React.createContext(null);
export function SearchProvider(_a) {
    var children = _a.children;
    var _b = React.useState(false), open = _b[0], setOpen = _b[1];
    React.useEffect(function () {
        var down = function (e) {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(function (open) { return !open; });
            }
        };
        document.addEventListener('keydown', down);
        return function () { return document.removeEventListener('keydown', down); };
    }, []);
    return (_jsxs(SearchContext.Provider, { value: { open: open, setOpen: setOpen }, children: [children, _jsx(CommandMenu, {})] }));
}
// eslint-disable-next-line react-refresh/only-export-components
export var useSearch = function () {
    var searchContext = React.useContext(SearchContext);
    if (!searchContext) {
        throw new Error('useSearch has to be used within <SearchContext.Provider>');
    }
    return searchContext;
};
