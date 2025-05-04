var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import UsersList from '@/common/components/user/UsersList';
import { useUser } from '@/common/hooks/user/useUser';
import styled from 'styled-components';
var TextContainer = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n"], ["\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n"])));
var HomePage = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  flex: 1 0 0;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  text-align: center;\n  padding: 2rem;\n"], ["\n  flex: 1 0 0;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  text-align: center;\n  padding: 2rem;\n"])));
export default function Home() {
    var user = useUser().user;
    return (_jsxs(HomePage, { children: [_jsxs(TextContainer, { children: [_jsx("h1", { children: "Home Page" }), _jsxs("h2", { children: ["Welcome, ", (user === null || user === void 0 ? void 0 : user.firstname) || 'User', "!"] })] }), _jsx(UsersList, {})] }));
}
var templateObject_1, templateObject_2;
