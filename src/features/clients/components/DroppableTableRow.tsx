'use client';

import {
  TableCell,
  TableRow,
} from '@/common/components/ui/table';
import { useDroppable } from '@dnd-kit/core';
import { flexRender, Row } from '@tanstack/react-table';
import { forwardRef } from 'react';
import { useClientsTable } from '../contexts/ClientsContext';
import { User } from '../data/schema';

interface Props {
  row: Row<User>;
}

export const DroppableTableRow = forwardRef<HTMLTableRowElement, Props>(
  ({ row }, ref) => {
    const { setOpenTemplates } = useClientsTable();

    const { setNodeRef, isOver } = useDroppable({
      id: `user-${row.original.id}`,
      data: {
        type: 'user',
        user: row.original,
      },
    });

    // Combine forwarded ref with setNodeRef
    const combinedRef = (node: HTMLTableRowElement) => {
      setNodeRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <TableRow
        ref={combinedRef}
        data-state={row.getIsSelected() && 'selected'}
        className={`group/row cursor-pointer transition transition-transform duration-300 ease-in-out ${isOver ? 'bg-accent scale-[.97]' : ''
          }`}
        onClick={() => setOpenTemplates(true)}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={cell.column.columnDef.meta?.className ?? ''}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  }
);

DroppableTableRow.displayName = 'DroppableTableRow';