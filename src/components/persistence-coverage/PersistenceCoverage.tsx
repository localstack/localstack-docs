import React from 'react';
import data from '@/data/persistence/coverage.json';
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
  getSortedRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import type {
  SortingState,
  ColumnDef,
  ColumnFiltersState,
} from '@tanstack/react-table';

const coverage = Object.values(data);

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'full_name',
    header: () => 'Service',
    cell: ({ row }) => (
      <a href={`/aws/${row.original.service}`}>{row.original.full_name}</a>
    ),
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      return row.original.full_name
        .toLowerCase()
        .includes((filterValue ?? '').toLowerCase());
    },
    meta: { className: 'w-[30%]' },
  },
  {
    accessorKey: 'support',
    header: () => 'Supported',
    cell: ({ row }) =>
      row.original.support === 'supported' ||
      row.original.support === 'supported with limitations'
        ? '✔️'
        : '',
    meta: { className: 'w-[15%] text-center' },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      // Sort supported to the top
      const a = rowA.original.support;
      const b = rowB.original.support;
      if (a === b) return 0;
      if (a === 'supported') return -1;
      if (b === 'supported') return 1;
      if (a === 'supported with limitations') return -1;
      if (b === 'supported with limitations') return 1;
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: 'test_suite',
    header: () => 'Persistence Test Suite',
    cell: ({ row }) => (row.original.test_suite ? '✔️' : ''),
    meta: { className: 'w-[20%] text-center' },
    enableSorting: true,
  },
  {
    accessorKey: 'limitations',
    header: () => 'Limitations',
    cell: ({ row }) => row.original.limitations,
    enableSorting: false,
    meta: { className: 'w-[35%] whitespace-normal' },
  },
];

export default function PersistenceCoverage() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'full_name', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data: coverage,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="w-full">
      <div style={{ marginBottom: 12, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Filter by service name..."
          value={
            (table.getColumn('full_name')?.getFilterValue() as string) || ''
          }
          onChange={(e) =>
            table.getColumn('full_name')?.setFilterValue(e.target.value)
          }
          className="border rounded px-2 py-1 w-full max-w-xs"
        />
      </div>
      <div className="rounded-md border w-full">
        <Table className="w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const meta = header.column.columnDef.meta as
                    | { className?: string }
                    | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={
                        (meta?.className || '') +
                        (canSort ? ' cursor-pointer select-none' : '')
                      }
                      style={{
                        width: meta?.className?.includes('w-[')
                          ? meta.className.match(/w-\[(\d+)%\]/)?.[1] + '%'
                          : 'auto',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {canSort && (
                        <span>
                          {header.column.getIsSorted() === 'asc'
                            ? ' ▲'
                            : header.column.getIsSorted() === 'desc'
                            ? ' ▼'
                            : ''}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    | { className?: string }
                    | undefined;
                  return (
                    <TableCell
                      key={cell.id}
                      className={meta?.className || undefined}
                      style={{
                        width: meta?.className?.includes('w-[')
                          ? meta.className.match(/w-\[(\d+)%\]/)?.[1] + '%'
                          : 'auto',
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
      <div className="flex items-center justify-between mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
}
