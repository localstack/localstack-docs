import React from 'react';
import data from '@/data/replicator/coverage.json';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, ColumnSizingState } from '@tanstack/react-table';
import { useTableColumnSizing } from '@/hooks/useTableColumnSizing';
import { useState } from 'react';

const coverage = Object.values(data);

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'resource_type',
    header: () => 'Resource Type',
    cell: ({ row }) => row.original.resource_type,
    size: 150,
    minSize: 120,
    maxSize: 200,
  },
  {
    accessorKey: 'service',
    header: () => 'Service',
    cell: ({ row }) => row.original.service,
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  {
    accessorKey: 'identifier',
    header: () => 'Identifier',
    cell: ({ row }) => row.original.identifier,
    size: 150,
    minSize: 120,
    maxSize: 200,
  },
  {
    accessorKey: 'policy_statements',
    header: () => 'Required Actions',
    cell: ({ row }) => (
      <>
        {row.original.policy_statements.map((s: string, i: number) => (
          <div key={i}>{s}</div>
        ))}
      </>
    ),
    size: 300,
    minSize: 200,
    maxSize: 500,
  },
  {
    id: 'arn_support',
    header: () => 'Arn Support',
    cell: () => '✔️',
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
];

export default function ReplicatorCoverage() {
  // Use the reusable hook for column sizing
  const { columnSizing, setColumnSizing } = useTableColumnSizing(columns);

  const table = useReactTable({
    data: coverage,
    columns,
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  // For testing purposes, we can log the column sizing state
  // console.log('Column sizing state:', columnSizing);

  // Add CSS for resizer
  const resizerStyle = `
    .resizer {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 5px;
      background: rgba(0, 0, 0, 0.1);
      cursor: col-resize;
      user-select: none;
      touch-action: none;
    }
    .resizer.isResizing {
      background: rgba(0, 0, 0, 0.2);
      opacity: 1;
    }
    @media (hover: hover) {
      .resizer {
        opacity: 0;
      }
      *:hover > .resizer {
        opacity: 1;
      }
    }
  `;

  return (
    <div className="w-full">
      <style>{resizerStyle}</style>
      <div className="p-2 block max-w-full overflow-x-scroll overflow-y-hidden">
        <Table 
          className="w-full" 
          style={{
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { className?: string }
                    | undefined;
                  
                  const getColumnWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'resource_type':
                        return '20%';
                      case 'service':
                        return '15%';
                      case 'identifier':
                        return '20%';
                      case 'policy_statements':
                        return '35%';
                      case 'arn_support':
                        return '10%';
                      default:
                        return 'auto';
                    }
                  };
                  
                  return (
                    <TableHead
                      key={header.id}
                      className={meta?.className || ''}
                      style={{ 
                        width: getColumnWidth(header.id),
                        position: 'relative',
                        textAlign: 'center',
                        border: '1px solid #999CAD',
                        background: '#AFB2C2',
                        color: '#101114',
                        fontFamily: 'AeonikFono',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        lineHeight: '16px',
                        letterSpacing: '-0.15px',
                        padding: '12px 8px',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${
                            header.column.getIsResizing() ? 'isResizing' : ''
                          }`}
                        ></div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody style={{
            color: '#212229',
            fontFamily: 'AeonikFono',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '16px',
            letterSpacing: '-0.15px',
          }}>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    | { className?: string }
                    | undefined;
                  
                  const getColumnWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'resource_type':
                        return '20%';
                      case 'service':
                        return '15%';
                      case 'identifier':
                        return '20%';
                      case 'policy_statements':
                        return '35%';
                      case 'arn_support':
                        return '10%';
                      default:
                        return 'auto';
                    }
                  };
                  
                  return (
                    <TableCell
                      key={cell.id}
                      className={meta?.className || undefined}
                      style={{ 
                        width: getColumnWidth(cell.column.id),
                        textAlign: 'center',
                        border: '1px solid #999CAD',
                        padding: '12px 8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: cell.column.id === 'policy_statements' ? 'normal' : 'nowrap',
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Testing instructions:
// 1. Verify that the table expands to 100% width of its container
// 2. Check that columns maintain their widths during pagination
// 3. Test with different viewport sizes to ensure responsive behavior
// 4. Try resizing columns to ensure the resize functionality works
// 5. Verify that content in cells is properly displayed with ellipsis for overflow
