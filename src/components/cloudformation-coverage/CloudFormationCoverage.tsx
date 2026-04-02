import React from 'react';
import data from '@/data/cloudformation/coverage.json';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

type CloudFormationResource = {
  resource_type: string;
  service: string;
  create: boolean;
  delete: boolean;
  update: boolean;
};

type CloudFormationCoverageData = {
  generated_at: string;
  database_id: string;
  total_resources: number;
  resources: CloudFormationResource[];
};

const coverageData = data as CloudFormationCoverageData;

const getColumnWidth = (columnId: string): string => {
  switch (columnId) {
    case 'resource_type':
      return '50%';
    case 'service':
      return '20%';
    case 'create':
    case 'delete':
    case 'update':
      return '10%';
    default:
      return '10%';
  }
};

const columns: ColumnDef<CloudFormationResource>[] = [
  {
    accessorKey: 'resource_type',
    header: () => 'Resource Type',
    cell: ({ row }) => row.original.resource_type,
    enableColumnFilter: true,
    filterFn: (row, _, filterValue) =>
      row.original.resource_type
        .toLowerCase()
        .includes((filterValue ?? '').toLowerCase()),
  },
  {
    accessorKey: 'service',
    header: () => 'Service',
    cell: ({ row }) => row.original.service || '-',
  },
  {
    accessorKey: 'create',
    header: () => 'Create',
    cell: ({ row }) => (row.original.create ? '✅' : '-'),
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      Number(rowB.original.create) - Number(rowA.original.create),
  },
  {
    accessorKey: 'delete',
    header: () => 'Delete',
    cell: ({ row }) => (row.original.delete ? '✅' : '-'),
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      Number(rowB.original.delete) - Number(rowA.original.delete),
  },
  {
    accessorKey: 'update',
    header: () => 'Update',
    cell: ({ row }) => (row.original.update ? '✅' : '-'),
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      Number(rowB.original.update) - Number(rowA.original.update),
  },
];

export default function CloudFormationCoverage() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'service', desc: false },
    { id: 'resource_type', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: coverageData.resources,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 mb-4 mt-3">
        <input
          type="text"
          placeholder="Filter by resource type..."
          value={
            (table.getColumn('resource_type')?.getFilterValue() as string) || ''
          }
          onChange={(e) =>
            table.getColumn('resource_type')?.setFilterValue(e.target.value)
          }
          className="border rounded px-3 py-2 w-full max-w-sm"
          style={{
            color: '#707385',
            fontFamily: 'var(--font-aeonik-fono)',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
        />
      </div>

      <div className="p-2 block max-w-full overflow-x-auto overflow-y-hidden">
        <table
          style={{
            display: 'table',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            width: '100%',
            minWidth: '100%',
          }}
        >
          <colgroup>
            {table.getAllLeafColumns().map((column) => (
              <col
                key={column.id}
                style={{
                  width: getColumnWidth(column.id),
                }}
              />
            ))}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      onClick={
                        canSort ? header.column.getToggleSortingHandler() : undefined
                      }
                      className={canSort ? 'cursor-pointer select-none' : ''}
                      style={{
                        textAlign:
                          header.id === 'create' ||
                          header.id === 'delete' ||
                          header.id === 'update'
                            ? 'center'
                            : 'left',
                        border: '1px solid #999CAD',
                        background: '#AFB2C2',
                        color: 'var(--sl-color-gray-1)',
                        fontFamily: 'var(--font-aeonik-fono)',
                        fontSize: '14px',
                        fontWeight: '500',
                        lineHeight: '16px',
                        letterSpacing: '-0.15px',
                        padding: '12px 8px',
                        cursor: canSort ? 'pointer' : 'default',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {canSort && (
                        <span style={{ display: 'inline-block', width: '1em' }}>
                          {header.column.getIsSorted() === 'asc'
                            ? ' ▲'
                            : header.column.getIsSorted() === 'desc'
                              ? ' ▼'
                              : ''}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              color: 'var(--sl-color-gray-1)',
              fontFamily: 'var(--font-aeonik-fono)',
              fontSize: '14px',
              fontWeight: '400',
              lineHeight: '16px',
              letterSpacing: '-0.15px',
            }}
          >
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      textAlign:
                        cell.column.id === 'create' ||
                        cell.column.id === 'delete' ||
                        cell.column.id === 'update'
                          ? 'center'
                          : 'left',
                      border: '1px solid #999CAD',
                      padding: '12px 8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: cell.column.id === 'resource_type' ? 'normal' : 'nowrap',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          style={{
            color: 'var(--sl-color-gray-1)',
            fontFamily: 'var(--font-aeonik-fono)',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span
          style={{
            fontFamily: 'var(--font-aeonik-fono)',
            fontSize: '14px',
          }}
        >
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          style={{
            color: 'var(--sl-color-gray-1)',
            fontFamily: 'var(--font-aeonik-fono)',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
}
