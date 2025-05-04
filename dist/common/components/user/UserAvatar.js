import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar";
export default function UserAvatar(_a) {
    var profile_picture = _a.profile_picture, fullName = _a.fullName, className = _a.className;
    var initials = fullName
        .split(' ')
        .map(function (word) { var _a; return (_a = word[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase(); })
        .join('');
    return (_jsx("div", { className: "flex items-center justify-center ".concat(className), children: _jsxs(Avatar, { className: "h-full w-full rounded-full overflow-hidden", children: [_jsx(AvatarImage, { src: profile_picture || '', alt: "".concat(fullName, "'s profile"), className: "object-cover" }), _jsx(AvatarFallback, { className: "text-lg", children: initials })] }) }));
}
