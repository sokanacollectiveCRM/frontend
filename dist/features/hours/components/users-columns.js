import { jsx as _jsx } from "react/jsx-runtime";
import { Checkbox } from '@/common/components/ui/checkbox';
import LongText from '@/common/components/ui/long-text';
import { cn } from '@/lib/utils';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
export var columns = [
    {
        id: 'select',
        header: function (_a) {
            var table = _a.table;
            return (_jsx(Checkbox, { checked: table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate'), onCheckedChange: function (value) { return table.toggleAllPageRowsSelected(!!value); }, "aria-label": 'Select all', className: 'translate-y-[2px]' }));
        },
        meta: {
            className: cn('sticky md:table-cell left-0 z-10 rounded-tl'),
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
            var row = _a.row;
            var _b = row.original.client, firstName = _b.firstName, lastName = _b.lastName;
            var fullName = "".concat(firstName, " ").concat(lastName);
            return _jsx(LongText, { className: 'max-w-36', children: fullName });
        },
        meta: { className: 'w-36' },
    },
    {
        id: 'doula',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Doula' }));
        },
        cell: function (_a) {
            var row = _a.row;
            var _b = row.original.doula, firstName = _b.firstName, lastName = _b.lastName;
            var fullName = "".concat(firstName, " ").concat(lastName);
            return _jsx(LongText, { className: 'max-w-36', children: fullName });
        },
        meta: { className: 'w-36' },
    },
    {
        accessorKey: 'start_time',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Start' }));
        },
        cell: function (_a) {
            var row = _a.row;
            return (_jsx(LongText, { className: 'max-w-36', children: row.getValue('start_time') }));
        },
        meta: {
            className: cn('drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none', 'sticky left-6 md:table-cell'),
        },
        enableHiding: false,
    },
    {
        accessorKey: 'end_time',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'End' }));
        },
        cell: function (_a) {
            var row = _a.row;
            return (_jsx("div", { className: 'w-fit text-nowrap', children: row.getValue('end_time') }));
        },
    },
    {
        accessorKey: 'duration',
        header: function (_a) {
            var column = _a.column;
            return (_jsx(DataTableColumnHeader, { column: column, title: 'Duration' }));
        },
        cell: function (_a) {
            var row = _a.row;
            var start_time = row.getValue('start_time');
            var end_time = row.getValue('end_time');
            if (!start_time || !end_time) {
                return _jsx("div", { children: "N/A" });
            }
            var startDate = new Date(start_time);
            var endDate = new Date(end_time);
            // Calculate duration in milliseconds
            var durationMs = endDate.getTime() - startDate.getTime();
            var hours = Math.floor(durationMs / (1000 * 60 * 60));
            var minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            // Format the duration string
            var durationStr = "".concat(hours, "h ").concat(minutes, "m");
            return _jsx("div", { children: durationStr });
        },
        enableSorting: true,
    },
    {
        id: 'actions',
        cell: DataTableRowActions,
    },
];
