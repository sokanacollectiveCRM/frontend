'use client';

import {
  TableCell,
  TableRow,
} from '@/common/components/ui/table';
import { useDroppable } from '@dnd-kit/core';
import { flexRender, Row } from '@tanstack/react-table';
import { forwardRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContext } from '../contexts/TableContext';
import { Client } from '../data/schema';

interface Props {
  row: Row<Client>;
}

export const DroppableTableRow = forwardRef<HTMLTableRowElement, Props>(
  ({ row }, ref) => {
    let navigate = useNavigate();
    const { openClientDetail } = useContext(TableContext);

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
        onClick={() => openClientDetail(row.original.id)}
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