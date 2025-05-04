import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/common/hooks/user/useUser';
import { LoadingOverlay } from '../loading/LoadingOverlay';
export function PrivateRoute() {
    var _a = useUser(), user = _a.user, isLoading = _a.isLoading;
    if (isLoading) {
        return _jsx(LoadingOverlay, { isLoading: isLoading });
    }
    return user ? _jsx(Outlet, {}) : _jsx(Navigate, { to: '/login', replace: true });
}
export function PublicOnlyRoute() {
    var _a = useUser(), user = _a.user, isLoading = _a.isLoading;
    if (isLoading) {
        return _jsx(LoadingOverlay, { isLoading: isLoading });
    }
    return !user ? _jsx(Outlet, {}) : _jsx(Navigate, { to: '/', replace: true });
}
