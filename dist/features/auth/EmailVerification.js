var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
var VerificationPage = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  flex: 1 0 0;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  text-align: center;\n  padding-top: 100px;\n"], ["\n  flex: 1 0 0;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  text-align: center;\n  padding-top: 100px;\n"])));
export default function EmailVerification() {
    var searchParams = useSearchParams()[0];
    var navigate = useNavigate();
    var _a = useState('checking'), status = _a[0], setStatus = _a[1];
    useEffect(function () {
        var error = searchParams.get('error');
        var success = searchParams.get('success');
        if (success) {
            setStatus('success');
            setTimeout(function () { return navigate('/login'); }, 3000);
        }
        else if (error) {
            setStatus('error');
        }
    }, [searchParams, navigate]);
    return (_jsxs(VerificationPage, { children: [status === 'checking' && _jsx("h1", { children: "Checking verification status..." }), status === 'success' && (_jsxs(_Fragment, { children: [_jsx("h1", { children: "Email Verified!" }), _jsx("h2", { children: "You'll be redirected to login in 3 seconds..." })] })), status === 'error' && (_jsxs(_Fragment, { children: [_jsx("h1", { children: "Verification Failed" }), _jsx("h2", { children: "Please try signing up again or contact support." })] }))] }));
}
var templateObject_1;
