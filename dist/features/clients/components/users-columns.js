var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox } from '@/common/components/ui/checkbox';
import LongText from '@/common/components/ui/long-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import updateClientStatus from '@/common/utils/updateClientStatus';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { userStatusSchema } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
var statusOptions = userStatusSchema.options;
export var columns = [
    {
        id: 'select',
        header: function (_a) {
            var table = _a.table;
            return (_jsx(Checkbox, { checked: table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate'), onCheckedChange: function (value) { return table.toggleAllPageRowsSelected(!!value); }, "aria-label": 'Select all', className: 'translate-y-[2px]' }));
        },
        meta: {
            className: cn('sticky md:table-cell left-0 w-12 z-10 rounded-tl'),
        },
        cell: function (_a) {
            var row = _a.row;
            return (_jsx(Checkbox, { checked: row.getIsSelected(), onCheckedChange: function (value) { return row.toggleSelected(!!value); }, "aria-label": 'Select row', className: 'translate-y-[2px]' }));
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'client',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Client' }));
        },
        cell: function (_a) {
            var _b, _c;
            var row = _a.row;
            var _d = row.original, firstname = _d.firstname, lastname = _d.lastname;
            var fullName = "".concat(firstname, " ").concat(lastname);
            var initials = "".concat((_b = firstname[0]) !== null && _b !== void 0 ? _b : '').concat((_c = lastname[0]) !== null && _c !== void 0 ? _c : '').toUpperCase();
            return (_jsx(Link, { to: "/specified", state: { user: row.original }, children: _jsxs("div", { className: "flex items-center gap-2 max-w-36 h-10", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700", children: initials }), _jsx(LongText, { className: 'max-w-36', children: fullName })] }) }));
        },
        filterFn: function (row, _columnId, filterValue) {
            var _a = row.original, firstname = _a.firstname, lastname = _a.lastname;
            var fullName = "".concat(firstname, " ").concat(lastname).toLowerCase();
            return fullName.includes(filterValue.toLowerCase());
        },
        meta: { className: 'w-50' },
    },
    {
        accessorKey: 'serviceNeeded',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Contract' }));
        },
        cell: function (_a) {
            var row = _a.row;
            return (_jsx(LongText, { className: 'max-w-36', children: row.getValue('serviceNeeded') }));
        },
        meta: {
            className: cn('drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none'),
        },
        enableHiding: false,
    },
    {
        accessorKey: 'requestedAt',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Requested' }));
        },
        cell: function (_a) {
            var row = _a.row;
            var requested = row.getValue('requestedAt');
            return _jsx("div", { className: 'w-fit text-nowrap', children: requested.toLocaleDateString() });
        },
    },
    {
        accessorKey: 'updatedAt',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Updated' }));
        },
        cell: function (_a) {
            var row = _a.row;
            var updated = row.getValue('updatedAt');
            return _jsx("div", { children: updated.toLocaleDateString() });
        },
        enableSorting: true,
    },
    {
        accessorKey: 'status',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Status' }));
        },
        cell: function (_a) {
            var row = _a.row;
            var _b = row.original, id = _b.id, status = _b.status;
            var handleStatusChange = function (newStatus) { return __awaiter(void 0, void 0, void 0, function () {
                var err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, updateClientStatus(id, newStatus)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _a.sent();
                            console.error('Failed to update status:', err_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            return (_jsxs(Select, { defaultValue: status, onValueChange: handleStatusChange, children: [_jsx(SelectTrigger, { className: cn('w-[160px]'), children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: statusOptions.map(function (option) { return (_jsx(SelectItem, { value: option, children: option }, option)); }) })] }));
        },
        filterFn: function (row, id, value) {
            return value.includes(row.getValue(id));
        },
        enableHiding: false,
        enableSorting: true,
    },
    {
        id: 'actions',
        cell: DataTableRowActions,
        meta: { className: 'sticky right-0 z-10 w-16' }
    },
];
