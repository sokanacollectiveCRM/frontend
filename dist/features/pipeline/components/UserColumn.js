import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { STATUS_LABELS } from '@/features/pipeline/data/schema';
import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { UserCard } from './UserCard';
export function UserColumn(_a) {
    var id = _a.id, users = _a.users;
    var _b = useDroppable({ id: id }), setNodeRef = _b.setNodeRef, isOver = _b.isOver;
    return (_jsx("div", { ref: setNodeRef, className: "min-w-[300px] h-full h-min-[200px] rounded-lg border-2 border-double p-2 transition-colors \n        duration-300 ease-in-out ".concat(isOver ? 'bg-muted bg-accent/10 ring-2 ring-accent/40' : ''), children: _jsxs("div", { className: clsx('flex flex-col gap-2 transition-transform duration-300 ease-in-out'
            // isOver && 'scale-[.97]'
            ), children: [_jsx("h3", { className: 'mb-2 text-lg font-semibold', children: STATUS_LABELS[id] }), _jsx("div", { className: 'flex flex-col gap-2', children: users.map(function (user) { return (_jsx(UserCard, { user: user, isOverlay: false }, user.id)); }) })] }) }));
}
