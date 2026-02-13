import React from 'react';
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

interface SqlFunction {
  name: string;
  supported: boolean;
}

interface SqlFunctionsData {
  generated_at: string;
  total_functions: number;
  supported_count: number;
  unsupported_count: number;
  functions: SqlFunction[];
}

const columns: ColumnDef<SqlFunction>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => 'Function',
    enableColumnFilter: true,
    filterFn: (row, _, filterValue) => {
      const name = row.original.name;
      return name.toLowerCase().includes((filterValue ?? '').toLowerCase());
    },
    enableResizing: false,
  },
  {
    id: 'supported',
    accessorKey: 'supported',
    header: () => 'Supported',
    cell: ({ getValue }) => (getValue() ? '✅' : '❌'),
    enableSorting: true,
    enableResizing: false,
    filterFn: (row, _, filterValue) => {
      if (filterValue === 'all') return true;
      if (filterValue === 'supported') return row.original.supported;
      if (filterValue === 'unsupported') return !row.original.supported;
      return true;
    },
  },
];

export default function SqlFunctionsCoverage() {
  const [data, setData] = React.useState<SqlFunctionsData | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'supported', desc: true },
    { id: 'name', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/snowflake/sql-functions.json');
        const jsonData: SqlFunctionsData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Failed to load SQL functions data:', error);
      }
    };
    loadData();
  }, []);

  const filteredFunctions = React.useMemo(() => {
    if (!data) return [];
    if (statusFilter === 'all') return data.functions;
    if (statusFilter === 'supported')
      return data.functions.filter((f) => f.supported);
    return data.functions.filter((f) => !f.supported);
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredFunctions,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
    initialState: { pagination: { pageSize: 20 } },
  });

  if (!data) {
    return <div className="p-4">Loading SQL functions coverage...</div>;
  }

  return (
    <div style={{ width: '100%', minWidth: '100%' }}>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by function name..."
          value={(table.getColumn('name')?.getFilterValue() as string) || ''}
          onChange={(e) =>
            table.getColumn('name')?.setFilterValue(e.target.value)
          }
          className="border rounded px-3 py-2 w-full max-w-xs"
          style={{
            color: '#707385',
            fontFamily: 'AeonikFono',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
          style={{
            fontFamily: 'AeonikFono',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
        >
          <option value="all">All Functions</option>
          <option value="supported">Supported Only</option>
          <option value="unsupported">Unsupported Only</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <table
          style={{
            display: 'table',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <colgroup>
            <col style={{ width: '80%' }} />
            <col style={{ width: '20%' }} />
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
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      style={{
                        textAlign: header.id === 'name' ? 'left' : 'center',
                        border: '1px solid #999CAD',
                        background: '#AFB2C2',
                        color: 'var(--sl-color-gray-1)',
                        fontFamily: 'AeonikFono',
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
                        header.getContext(),
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
              fontFamily: 'AeonikFono',
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
                      textAlign: cell.column.id === 'name' ? 'left' : 'center',
                      border: '1px solid #999CAD',
                      padding: '12px 8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:
                        cell.column.id === 'name' ? 'normal' : 'nowrap',
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

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          style={{
            color: 'var(--sl-color-gray-1)',
            fontFamily: 'AeonikFono',
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
            fontFamily: 'AeonikFono',
            fontSize: '14px',
          }}
        >
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          style={{
            color: 'var(--sl-color-gray-1)',
            fontFamily: 'AeonikFono',
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
