import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/common/components/ui/sheet";
import { SquarePlus } from 'lucide-react';
import { useState } from 'react';
export function UsersPrimaryButtons() {
    var _a = useState(undefined), startDate = _a[0], setStartDate = _a[1];
    var _b = useState(undefined), startTime = _b[0], setStartTime = _b[1];
    var _c = useState(undefined), endDate = _c[0], setEndDate = _c[1];
    var _d = useState(undefined), endTime = _d[0], setEndTime = _d[1];
    // CURRENT STATE: CREATED AND IMPORTED ZODSCHEMA FOR THE 'ADD HOURS' FEATURE, CURRENTLY MODIFYING THE INSIDE OF SHEETCONTENT TO ACTUALLY CONTAIN THE FORMS (THE 4 USESTATES ABOVE)
    // USE Shadcn's Calendar, maybe Form? idk, so figure that out
    var printUserStuff = function () {
        console.log("ADD HOURS BUTTON CLICKED");
    };
    return (_jsx("div", { className: 'flex gap-2', children: _jsxs(Sheet, { children: [_jsx(SheetTrigger, { asChild: true, children: _jsxs(Button, { className: 'space-x-1', onClick: printUserStuff, children: [_jsx("span", { children: "Add Hours" }), " ", _jsx(SquarePlus, { size: 18 })] }) }), _jsxs(SheetContent, { children: [_jsxs(SheetHeader, { children: [_jsx(SheetTitle, { className: 'text-2xl font-bold', children: "Add Hours" }), _jsx(SheetDescription, { children: "Please enter your start and end time" })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsx("div", { className: "grid grid-cols-4 items-center gap-4" }), _jsx("div", { className: "grid grid-cols-4 items-center gap-4" })] }), _jsx(SheetFooter, { children: _jsx(SheetClose, { asChild: true, children: _jsx(Button, { type: "submit", children: "Save changes" }) }) })] })] }) }));
}
