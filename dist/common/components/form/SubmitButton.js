import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
export default function SubmitButton(_a) {
    var children = _a.children, onClick = _a.onClick;
    return (_jsx(Button, { type: 'submit', onClick: onClick, children: children }));
}
