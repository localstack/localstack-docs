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
      <a href={`/aws/services/${row.original.service}`}>{row.original.full_name}</a>
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
          style={{
            color: '#707385',
            fontFamily: 'AeonikFono',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
        />
      </div>
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
                  const canSort = header.column.getCanSort();
                  const meta = header.column.columnDef.meta as
                    | { className?: string }
                    | undefined;
                  
                  const getColumnWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'full_name':
                        return '40%';
                      case 'support':
                        return '15%';
                      case 'test_suite':
                        return '20%';
                      case 'limitations':
                        return '25%';
                      default:
                        return 'auto';
                    }
                  };
                  
                  const getMinWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'full_name':
                        return '200px';
                      case 'support':
                        return '80px';
                      case 'test_suite':
                        return '80px';
                      case 'limitations':
                        return '450px';
                      default:
                        return '50px';
                    }
                  };
                  
                  return (
                    <TableHead
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={canSort ? 'cursor-pointer select-none' : ''}
                      style={{
                        width: getColumnWidth(header.id),
                        minWidth: getMinWidth(header.id),
                        textAlign: header.id === 'full_name' ? 'left' : 'center',
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
                      case 'full_name':
                        return '40%';
                      case 'support':
                        return '15%';
                      case 'test_suite':
                        return '20%';
                      case 'limitations':
                        return '25%';
                      default:
                        return 'auto';
                    }
                  };
                  
                  const getMinWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'full_name':
                        return '200px';
                      case 'support':
                        return '80px';
                      case 'test_suite':
                        return '120px';
                      case 'limitations':
                        return '150px';
                      default:
                        return '50px';
                    }
                  };
                  
                  return (
                    <TableCell
                      key={cell.id}
                      className={meta?.className || undefined}
                      style={{
                        width: getColumnWidth(cell.column.id),
                        minWidth: getMinWidth(cell.column.id),
                        textAlign: cell.column.id === 'full_name' ? 'left' : 'center',
                        border: '1px solid #999CAD',
                        padding: '12px 8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: cell.column.id === 'limitations' ? 'normal' : 'nowrap',
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      ) || '\u00A0'}
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
          style={{
            color: '#707385',
            fontFamily: 'AeonikFono',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
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
          style={{
            color: '#707385',
            fontFamily: 'AeonikFono',
            fontSize: '14px',
            fontStyle: 'normal',
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
