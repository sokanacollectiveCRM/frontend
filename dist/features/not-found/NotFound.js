var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
var Container = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100vh;\n  text-align: center;\n  background-color: #f9fafb;\n  padding: 2rem;\n"], ["\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100vh;\n  text-align: center;\n  background-color: #f9fafb;\n  padding: 2rem;\n"])));
var Heading = styled.h1(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  font-size: 4rem;\n  font-weight: bold;\n  color: #111827;\n  margin-bottom: 1rem;\n"], ["\n  font-size: 4rem;\n  font-weight: bold;\n  color: #111827;\n  margin-bottom: 1rem;\n"])));
var Description = styled.p(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  font-size: 1.25rem;\n  color: #6b7280;\n  margin-bottom: 2rem;\n"], ["\n  font-size: 1.25rem;\n  color: #6b7280;\n  margin-bottom: 2rem;\n"])));
var HomeButton = styled.button(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  background-color: #3b82f6;\n  color: white;\n  padding: 0.75rem 1.5rem;\n  font-size: 1rem;\n  border: none;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n\n  &:hover {\n    background-color: #2563eb;\n  }\n"], ["\n  background-color: #3b82f6;\n  color: white;\n  padding: 0.75rem 1.5rem;\n  font-size: 1rem;\n  border: none;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  transition: background-color 0.3s ease;\n\n  &:hover {\n    background-color: #2563eb;\n  }\n"])));
export default function NotFound() {
    var navigate = useNavigate();
    return (_jsxs(Container, { children: [_jsx(Heading, { children: "404 - Page Not Found" }), _jsx(Description, { children: "Oops! The page you\u2019re looking for doesn\u2019t exist or has been moved." }), _jsx(HomeButton, { onClick: function () { return navigate('/'); }, children: "Go Home" })] }));
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
