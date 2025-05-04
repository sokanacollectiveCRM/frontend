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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UserCard } from '@/features/pipeline/components/UserCard';
import { UserColumn } from '@/features/pipeline/components/UserColumn';
import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import { USER_STATUSES } from '../data/schema';
var dropAnimationConfig = {
    keyframes: function (_a) {
        var transform = _a.transform;
        var scale = 0.91;
        return [
            { transform: CSS.Transform.toString(transform.initial) },
            {
                transform: CSS.Transform.toString(__assign(__assign({}, transform.final), { scaleX: scale, scaleY: scale })),
            },
        ];
    },
    sideEffects: function (_a) {
        var active = _a.active, dragOverlay = _a.dragOverlay;
        active.node.style.opacity = '0';
        var shadowTarget = dragOverlay.node.querySelector('[data-shadow-target]');
        if (shadowTarget) {
            shadowTarget.animate([
                {
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)', // lifted shadow
                },
                {
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // resting shadow
                },
            ], {
                duration: 250,
                easing: 'ease-in-out',
                fill: 'forwards',
            });
        }
        return function () {
            active.node.style.opacity = '';
        };
    },
};
export function UsersBoard(_a) {
    var usersByStatus = _a.usersByStatus, onStatusChange = _a.onStatusChange;
    var _b = useState(null), activeId = _b[0], setActiveId = _b[1];
    var _c = useState(false), showOverlay = _c[0], setShowOverlay = _c[1];
    var activeUser = useMemo(function () {
        var _a;
        return (_a = Object.values(usersByStatus).flat().find(function (u) { return u.id === activeId; })) !== null && _a !== void 0 ? _a : null;
    }, [activeId, usersByStatus]);
    var sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            delay: 250,
            distance: 3,
            tolerance: 8,
        },
    }));
    return (_jsxs(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragStart: function (event) {
            setActiveId(event.active.id.toString());
            setShowOverlay(true);
        }, onDragEnd: function (event) {
            var active = event.active, over = event.over;
            if (active && over) {
                var userId = active.id.toString();
                var newStatus = over.id.toString();
                onStatusChange(userId, newStatus);
            }
            setActiveId(null);
            setShowOverlay(false);
        }, onDragCancel: function () {
            setActiveId(null);
            setShowOverlay(false);
        }, children: [_jsx("div", { className: "flex gap-4 overflow-x-auto min-h-[800px]", children: USER_STATUSES.map(function (status) { return (_jsx(UserColumn, { id: status, users: usersByStatus[status] }, status)); }) }), _jsx(DragOverlay, { dropAnimation: dropAnimationConfig, style: { transformOrigin: 'center' }, children: showOverlay && activeUser ? (_jsx(UserCard, { user: activeUser, isOverlay: true, className: "transition-transform duration-200 ease-out opacity-90" })) : null })] }));
}
