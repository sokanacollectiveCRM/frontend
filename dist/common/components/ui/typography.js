import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var H1 = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("h1", { className: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ".concat(className), children: children }));
};
var H2 = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("h2", { className: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ".concat(className), children: children }));
};
var H3 = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("h3", { className: "scroll-m-20 text-2xl font-semibold tracking-tight ".concat(className), children: children }));
};
var H4 = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("h4", { className: "scroll-m-20 text-xl font-semibold tracking-tight ".concat(className), children: children }));
};
var P = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("p", { className: "leading-7 [&:not(:first-child)]:mt-6 ".concat(className), children: children }));
};
var Blockquote = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("blockquote", { className: "mt-6 border-l-2 pl-6 italic ".concat(className), children: children }));
};
var InlineCode = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("code", { className: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ".concat(className), children: children }));
};
var Lead = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsx("p", { className: "text-xl text-muted-foreground ".concat(className), children: children }));
};
var Large = function (_a) {
    var className = _a.className, children = _a.children;
    return _jsx("div", { className: "text-lg font-semibold ".concat(className), children: children });
};
var Muted = function (_a) {
    var className = _a.className, children = _a.children;
    return (_jsxs("p", { className: "text-sm text-muted-foreground ".concat(className), children: [children, "."] }));
};
export { Blockquote, H1, H2, H3, H4, InlineCode, Large, Lead, Muted, P };
