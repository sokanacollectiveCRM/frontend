var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@/common/components/ui/button';
var StyledNav = styled.nav(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  gap: 10px;\n  padding: 10px 20px;\n  font-size: 20px;\n"], ["\n  display: flex;\n  gap: 10px;\n  padding: 10px 20px;\n  font-size: 20px;\n"])));
var LeftAligned = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  flex: 1;\n  display: flex;\n  gap: 10px;\n"], ["\n  flex: 1;\n  display: flex;\n  gap: 10px;\n"])));
var LogoPlaceholder = styled(Button)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  padding: 0;\n  font-size: 1.7rem;\n  font-weight: bold;\n  font-family: monospace;\n"], ["\n  padding: 0;\n  font-size: 1.7rem;\n  font-weight: bold;\n  font-family: monospace;\n"])));
export default function NavBar() {
    var navigate = useNavigate();
    return (_jsxs(StyledNav, { children: [_jsx(LeftAligned, { children: _jsx(LogoPlaceholder, { onClick: function () { return navigate('/'); }, children: "[LOGO]" }) }), _jsxs(_Fragment, { children: [_jsx(Button, { onClick: function () { return navigate('/signup'); }, children: "Sign Up" }), _jsx(Button, { onClick: function () { return navigate('/login'); }, children: "Login" })] })] }));
}
var templateObject_1, templateObject_2, templateObject_3;
