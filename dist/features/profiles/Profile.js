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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card } from "@/common/components/ui/card";
import { AlertCircle, Award, Baby, Book, Calendar, Check, Clock, Edit2, Heart, PlusCircle, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
// FIX TYPESCRIPT ERRORS
// CHANGE THE USE STATE SPAM WHEN REAL DATA IS USED-- Use objects
export default function Profile() {
    var _a;
    var location = useLocation();
    var user = (_a = location.state) === null || _a === void 0 ? void 0 : _a.user;
    var _b = useState([
        { id: 1, text: "Client requested lactation support resources and referrals", date: "Apr 22, 2025", category: "support" },
        { id: 2, text: "Discussed different baby formula options based on baby's sensitivity", date: "Apr 18, 2025", category: "nutrition" }
    ]), notes = _b[0], setNotes = _b[1];
    var _c = useState(""), newNote = _c[0], setNewNote = _c[1];
    var _d = useState("general"), noteCategory = _d[0], setNoteCategory = _d[1];
    var _e = useState(false), showAddNote = _e[0], setShowAddNote = _e[1];
    var _f = useState(null), editingNoteId = _f[0], setEditingNoteId = _f[1];
    var _g = useState(""), editText = _g[0], setEditText = _g[1];
    var _h = useState(""), editCategory = _h[0], setEditCategory = _h[1];
    var _j = useState({
        dueDate: "June 15, 2025",
        currentWeek: 28,
        lastAppointment: "April 18, 2025",
        nextAppointment: "May 2, 2025"
    }), pregnancyData = _j[0], setPregnancyData = _j[1];
    var _k = useState([
        { preference: "Natural birth with minimal interventions", type: "primary" },
        { preference: "Dim lighting and calming music", type: "environment" },
        { preference: "Delayed cord clamping", type: "medical" },
        { preference: "Immediate skin-to-skin contact", type: "postpartum" }
    ]), birthPreferences = _k[0], setBirthPreferences = _k[1];
    var _l = useState([
        { name: "Dr. Sarah Johnson", role: "OB/GYN", contact: "555-123-4567" },
        { name: "Midwife Center", role: "Backup Midwifery", contact: "555-987-6543" },
        { name: "John Smith", role: "Partner/Birth Support", contact: "555-345-6789" }
    ]), supportTeam = _l[0], setSupportTeam = _l[1];
    var addNote = function () {
        if (newNote.trim()) {
            var now = new Date();
            var dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            setNotes(__spreadArray(__spreadArray([], notes, true), [{ id: Date.now(), text: newNote, date: dateStr, category: noteCategory }], false));
            setNewNote("");
            setNoteCategory("general");
            setShowAddNote(false);
        }
    };
    var deleteNote = function (id) {
        setNotes(notes.filter(function (note) { return note.id !== id; }));
    };
    var startEdit = function (note) {
        setEditingNoteId(note.id);
        setEditText(note.text);
        setEditCategory(note.category);
    };
    var saveEdit = function () {
        if (editText.trim()) {
            setNotes(notes.map(function (note) {
                return note.id === editingNoteId ? __assign(__assign({}, note), { text: editText, category: editCategory }) : note;
            }));
        }
        setEditingNoteId(null);
    };
    var cancelEdit = function () {
        setEditingNoteId(null);
    };
    var getCategoryColor = function (category) {
        var colors = {
            general: "bg-gray-100 text-gray-800",
            support: "bg-blue-100 text-blue-800",
            nutrition: "bg-green-100 text-green-800",
            medical: "bg-red-100 text-red-800",
            birth: "bg-purple-100 text-purple-800",
            postpartum: "bg-pink-100 text-pink-800"
        };
        return colors[category] || colors.general;
    };
    var getCategoryIcon = function (category) {
        switch (category) {
            case "support": return _jsx(Heart, { size: 12, className: "mr-1" });
            case "nutrition": return _jsx(Award, { size: 12, className: "mr-1" });
            case "medical": return _jsx(AlertCircle, { size: 12, className: "mr-1" });
            case "birth": return _jsx(Baby, { size: 12, className: "mr-1" });
            case "postpartum": return _jsx(Book, { size: 12, className: "mr-1" });
            default: return null;
        }
    };
    if (!user) {
        return _jsx("div", { children: "No Data Here!" });
    }
    return (_jsxs("div", { className: "flex min-h-screen bg-gray-50 p-6", children: [_jsx("div", { className: "w-1/3 bg-white p-6 rounded-2xl shadow-md", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("img", { src: "https://via.placeholder.com/100", alt: "Profile", className: "rounded-full w-24 h-24 mb-4 object-cover border-4 border-indigo-100" }), _jsxs("h2", { className: "text-xl font-semibold", children: [user.firstName, " ", user.lastName] }), _jsxs("p", { className: "text-indigo-600 text-sm mb-4", children: ["Expecting mother \u2022 ", pregnancyData.currentWeek, " weeks"] }), _jsxs("div", { className: "text-left w-full space-y-3 text-sm", children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", user.firstName, user.lastName, "@gmail.com"] }), _jsxs("p", { children: [_jsx("strong", { children: "Phone:" }), " (630) 785-8457"] }), _jsxs("p", { children: [_jsx("strong", { children: "Date of Birth:" }), " 08/09/1992"] }), _jsxs("p", { children: [_jsx("strong", { children: "Address:" }), " 845 Lincoln, Evanston"] }), _jsxs("p", { children: [_jsx("strong", { children: "Due Date:" }), " ", pregnancyData.dueDate] }), _jsxs("p", { children: [_jsx("strong", { children: "Contract Type:" }), " ", user.contractType] }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", _jsx("span", { className: "text-green-600 font-medium", children: user.status })] })] }), _jsxs("div", { className: "mt-6 w-full", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("h3", { className: "text-sm font-semibold", children: "Client Notes" }), _jsxs("button", { onClick: function () { return setShowAddNote(!showAddNote); }, className: "text-indigo-600 hover:text-indigo-800 text-sm flex items-center", children: [_jsx(PlusCircle, { size: 16, className: "mr-1" }), "Add note"] })] }), showAddNote && (_jsxs("div", { className: "mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200", children: [_jsx("textarea", { value: newNote, onChange: function (e) { return setNewNote(e.target.value); }, className: "w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", rows: 3, placeholder: "Type your note here..." }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("select", { value: noteCategory, onChange: function (e) { return setNoteCategory(e.target.value); }, className: "text-xs border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500", children: [_jsx("option", { value: "general", children: "General" }), _jsx("option", { value: "support", children: "Support" }), _jsx("option", { value: "nutrition", children: "Nutrition" }), _jsx("option", { value: "medical", children: "Medical" }), _jsx("option", { value: "birth", children: "Birth" }), _jsx("option", { value: "postpartum", children: "Postpartum" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: function () { return setShowAddNote(false); }, className: "px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300", children: "Cancel" }), _jsx("button", { onClick: addNote, className: "px-3 py-1 text-xs text-white bg-indigo-600 rounded-md hover:bg-indigo-700", children: "Save" })] })] })] })), _jsxs("div", { className: "space-y-3 overflow-visible", children: [notes.map(function (note) { return (_jsx(Card, { className: "p-3 bg-white text-gray-700 text-xs border border-gray-200 hover:shadow-md transition-shadow", children: editingNoteId === note.id ? (_jsxs(_Fragment, { children: [_jsx("textarea", { value: editText, onChange: function (e) { return setEditText(e.target.value); }, className: "w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", rows: 3 }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("select", { value: editCategory, onChange: function (e) { return setEditCategory(e.target.value); }, className: "text-xs border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500", children: [_jsx("option", { value: "general", children: "General" }), _jsx("option", { value: "support", children: "Support" }), _jsx("option", { value: "nutrition", children: "Nutrition" }), _jsx("option", { value: "medical", children: "Medical" }), _jsx("option", { value: "birth", children: "Birth" }), _jsx("option", { value: "postpartum", children: "Postpartum" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: cancelEdit, className: "p-1 text-gray-500 hover:text-gray-700", children: _jsx(X, { size: 16 }) }), _jsx("button", { onClick: saveEdit, className: "p-1 text-green-500 hover:text-green-700", children: _jsx(Check, { size: 16 }) })] })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-indigo-600 font-medium", children: note.date }), _jsxs("span", { className: "ml-2 text-xs px-2 py-0.5 rounded-full flex items-center ".concat(getCategoryColor(note.category)), children: [getCategoryIcon(note.category), note.category.charAt(0).toUpperCase() + note.category.slice(1)] })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: function () { return startEdit(note); }, className: "p-1 text-gray-500 hover:text-indigo-600", children: _jsx(Edit2, { size: 14 }) }), _jsx("button", { onClick: function () { return deleteNote(note.id); }, className: "p-1 text-gray-500 hover:text-red-600", children: _jsx(Trash2, { size: 14 }) })] })] }), _jsx("p", { className: "text-gray-800 text-sm", children: note.text })] })) }, note.id)); }), notes.length === 0 && (_jsx("div", { className: "text-center py-6 text-gray-500 italic text-sm border border-dashed border-gray-300 rounded-lg", children: "No notes available. Click \"Add note\" to create one." }))] })] })] }) }), _jsxs("div", { className: "flex-1 p-6", children: [_jsx("div", { className: "flex gap-6 mb-6 border-b border-gray-200 pb-2", children: ["Overview", "Birth Plan", "Appointments", "Billing", "Notes", "Documents", "Resources"].map(function (tab, index) { return (_jsx("button", { className: "text-sm font-semibold pb-2 ".concat(index === 0 ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'), children: tab }, tab)); }) }), _jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-md mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-md font-semibold", children: "Pregnancy Timeline" }), _jsxs("span", { className: "text-sm text-indigo-600", children: ["Week ", pregnancyData.currentWeek, " of 40"] })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "h-2 bg-gray-200 rounded-full w-full mb-6", children: _jsx("div", { className: "h-2 bg-indigo-600 rounded-full", style: { width: "".concat((pregnancyData.currentWeek / 40) * 100, "%") } }) }), _jsxs("div", { className: "flex justify-between text-xs text-gray-500 px-1", children: [_jsx("span", { children: "First Trimester" }), _jsx("span", { children: "Second Trimester" }), _jsx("span", { children: "Third Trimester" }), _jsx("span", { children: "Due Date" })] })] }), _jsxs("div", { className: "mt-6 grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center p-3 bg-blue-50 rounded-lg", children: [_jsx(Calendar, { className: "text-blue-600 mr-2", size: 20 }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-blue-600 font-medium", children: "Due Date" }), _jsx("p", { className: "text-sm", children: pregnancyData.dueDate })] })] }), _jsxs("div", { className: "flex items-center p-3 bg-green-50 rounded-lg", children: [_jsx(Clock, { className: "text-green-600 mr-2", size: 20 }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-green-600 font-medium", children: "Next Appointment" }), _jsx("p", { className: "text-sm", children: pregnancyData.nextAppointment })] })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-md mb-6", children: [_jsx("h3", { className: "text-md font-semibold mb-4", children: "Birth Preferences" }), _jsxs("div", { className: "space-y-3", children: [birthPreferences.map(function (pref, index) { return (_jsxs("div", { className: "flex items-start", children: [_jsx("div", { className: "min-w-2 h-2 rounded-full mt-2 mr-3 ".concat(pref.type === 'primary' ? 'bg-indigo-600' :
                                                    pref.type === 'environment' ? 'bg-green-500' :
                                                        pref.type === 'medical' ? 'bg-red-500' : 'bg-purple-500') }), _jsxs("div", { children: [_jsx("p", { className: "text-sm", children: pref.preference }), _jsx("p", { className: "text-xs text-gray-500 capitalize", children: pref.type })] })] }, index)); }), _jsxs("button", { className: "text-indigo-600 text-sm hover:text-indigo-800 flex items-center mt-2", children: [_jsx(PlusCircle, { size: 14, className: "mr-1" }), "Add birth preference"] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-md mb-6", children: [_jsx("h3", { className: "text-md font-semibold mb-4", children: "Support Team" }), _jsxs("div", { className: "space-y-4", children: [supportTeam.map(function (member, index) { return (_jsxs("div", { className: "flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: member.name }), _jsx("p", { className: "text-xs text-gray-500", children: member.role })] }), _jsx("p", { className: "text-xs text-indigo-600", children: member.contact })] }, index)); }), _jsxs("button", { className: "text-indigo-600 text-sm hover:text-indigo-800 flex items-center", children: [_jsx(PlusCircle, { size: 14, className: "mr-1" }), "Add team member"] })] })] })] })] }));
}
