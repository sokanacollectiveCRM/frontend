import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/common/components/ui/table';
import { useUsers } from '@/features/clients/context/users-context';
import { flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from '@tanstack/react-table';
import { useState } from 'react';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
export function UsersTable(_a) {
    var _b;
    var columns = _a.columns, data = _a.data;
    var _c = useState({}), rowSelection = _c[0], setRowSelection = _c[1];
    var _d = useState({}), columnVisibility = _d[0], setColumnVisibility = _d[1];
    var _e = useState([]), columnFilters = _e[0], setColumnFilters = _e[1];
    var _f = useState([]), sorting = _f[0], setSorting = _f[1];
    var setOpen = useUsers().setOpen;
    var table = useReactTable({
        data: data,
        columns: columns,
        state: {
            sorting: sorting,
            columnVisibility: columnVisibility,
            rowSelection: rowSelection,
            columnFilters: columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });
    return (_jsxs("div", { className: 'space-y-4', children: [_jsx(DataTableToolbar, { table: table }), _jsx("div", { className: 'rounded-md border', children: _jsxs(Table, { className: 'table-fixed w-full', children: [_jsx(TableHeader, { children: table.getHeaderGroups().map(function (headerGroup) { return (_jsx(TableRow, { className: 'group/row', children: headerGroup.headers.map(function (header) {
                                    var _a, _b;
                                    return (_jsx(TableHead, { colSpan: header.colSpan, className: (_b = (_a = header.column.columnDef.meta) === null || _a === void 0 ? void 0 : _a.className) !== null && _b !== void 0 ? _b : '', children: header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext()) }, header.id));
                                }) }, headerGroup.id)); }) }), _jsx(TableBody, { children: ((_b = table.getRowModel().rows) === null || _b === void 0 ? void 0 : _b.length) ? (table.getRowModel().rows.map(function (row) { return (_jsx(TableRow, { "data-state": row.getIsSelected() && 'selected', className: 'group/row cursor-pointer transition', onClick: function () { return setOpen('invite'); }, children: row.getVisibleCells().map(function (cell) {
                                    var _a, _b;
                                    return (_jsx(TableCell, { className: (_b = (_a = cell.column.columnDef.meta) === null || _a === void 0 ? void 0 : _a.className) !== null && _b !== void 0 ? _b : '', children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id));
                                }) }, row.id)); })) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: 'h-24 text-center', children: "No results." }) })) })] }) }), _jsx(DataTablePagination, { table: table })] }));
}
