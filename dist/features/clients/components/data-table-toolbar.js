import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { X } from 'lucide-react';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
export function DataTableToolbar(_a) {
    var _b, _c;
    var table = _a.table;
    var isFiltered = table.getState().columnFilters.length > 0;
    return (_jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex flex-1 flex-row items-center gap-x-2', children: [_jsx(Input, { placeholder: 'Filter clients...', value: (_c = (_b = table.getColumn('client')) === null || _b === void 0 ? void 0 : _b.getFilterValue()) !== null && _c !== void 0 ? _c : '', onChange: function (event) { var _a; return (_a = table.getColumn('client')) === null || _a === void 0 ? void 0 : _a.setFilterValue(event.target.value); }, className: 'h-8 w-[150px] lg:w-[250px]' }), _jsx("div", { className: 'flex gap-x-2', children: table.getColumn('status') && (_jsx(DataTableFacetedFilter, { column: table.getColumn('status'), title: 'Status', options: [
                                { label: 'Active', value: 'Active' },
                                { label: 'In Progress', value: 'In Progress' },
                                { label: 'Complete', value: 'Complete' },
                            ] })) }), isFiltered && (_jsxs(Button, { variant: 'ghost', onClick: function () { return table.resetColumnFilters(); }, className: 'h-8 px-2 lg:px-3', children: ["Reset", _jsx(X, { className: 'ml-2 h-4 w-4' })] }))] }), _jsx(DataTableViewOptions, { table: table })] }));
}
