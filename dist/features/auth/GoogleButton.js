var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import PropTypes from 'prop-types';
import styled from 'styled-components';
var StyledButton = styled.button(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 8px;\n  background-color: white;\n  border: 1px solid #e2e2e2;\n  border-radius: 4px;\n  padding: 8px 16px;\n  color: #5f6368;\n  font-size: 14px;\n  cursor: pointer;\n  transition: background-color 0.2s;\n\n  &:hover {\n    background-color: #f8f9fa;\n  }\n\n  &:focus {\n    outline: none;\n    box-shadow: 0 0 0 2px #e8e8e8;\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n"], ["\n  width: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 8px;\n  background-color: white;\n  border: 1px solid #e2e2e2;\n  border-radius: 4px;\n  padding: 8px 16px;\n  color: #5f6368;\n  font-size: 14px;\n  cursor: pointer;\n  transition: background-color 0.2s;\n\n  &:hover {\n    background-color: #f8f9fa;\n  }\n\n  &:focus {\n    outline: none;\n    box-shadow: 0 0 0 2px #e8e8e8;\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n"])));
var Divider = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  position: relative;\n  margin: 24px 0;\n  text-align: center;\n\n  &::before {\n    content: '';\n    position: absolute;\n    top: 50%;\n    left: 0;\n    right: 0;\n    height: 1px;\n    background-color: #e2e2e2;\n  }\n\n  span {\n    position: relative;\n    background-color: white;\n    padding: 0 12px;\n    color: #666;\n    font-size: 14px;\n  }\n"], ["\n  position: relative;\n  margin: 24px 0;\n  text-align: center;\n\n  &::before {\n    content: '';\n    position: absolute;\n    top: 50%;\n    left: 0;\n    right: 0;\n    height: 1px;\n    background-color: #e2e2e2;\n  }\n\n  span {\n    position: relative;\n    background-color: white;\n    padding: 0 12px;\n    color: #666;\n    font-size: 14px;\n  }\n"])));
export default function GoogleButton(_a) {
    var isLoading = _a.isLoading, onClick = _a.onClick, _b = _a.text, text = _b === void 0 ? 'Sign in with Google' : _b;
    return (_jsxs(_Fragment, { children: [_jsx(Divider, { children: _jsx("span", { children: "Or continue with" }) }), _jsxs(StyledButton, { type: 'button', onClick: onClick, disabled: isLoading, children: [_jsxs("svg", { width: '18', height: '18', viewBox: '0 0 24 24', children: [_jsx("path", { d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z', fill: '#4285F4' }), _jsx("path", { d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z', fill: '#34A853' }), _jsx("path", { d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z', fill: '#FBBC05' }), _jsx("path", { d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z', fill: '#EA4335' })] }), text] })] }));
}
GoogleButton.propTypes = {
    isLoading: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    text: PropTypes.string,
};
var templateObject_1, templateObject_2;
