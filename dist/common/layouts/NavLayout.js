var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from '@/common/components/navigation/navbar/NavBar';
var Nav = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n"], ["\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n"])));
export default function NavLayout() {
    return (_jsxs(Nav, { children: [_jsx(NavBar, {}), _jsx(Outlet, {})] }));
}
var templateObject_1;
