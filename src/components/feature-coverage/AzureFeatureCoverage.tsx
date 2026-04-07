import React from 'react';
const jsonData = import.meta.glob('/src/data/azure-coverage/*.json');
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

type CoverageValue = {
  implemented?: boolean;
};

type CoverageRow = Record<string, CoverageValue>;

type AzureCoverageFile = {
  service: string;
  operations?: CoverageRow[];
  details?: Record<string, Record<string, CoverageValue>>;
};

const columns: ColumnDef<CoverageRow>[] = [
  {
    id: 'operation',
    accessorFn: (row) => Object.keys(row)[0],
    header: () => 'Operation',
    enableColumnFilter: true,
    filterFn: (row, _, filterValue) => {
      const operation = Object.keys(row.original)[0];
      return operation
        .toLowerCase()
        .includes((filterValue ?? '').toLowerCase());
    },
    enableResizing: false,
  },
  {
    id: 'implemented',
    accessorFn: (row) => row[Object.keys(row)[0]]?.implemented,
    header: () => 'Implemented',
    cell: ({ getValue }) => (getValue() ? '✔️' : ''),
    enableSorting: true,
    enableResizing: false,
  },
];

function flattenDetails(
  details: Record<string, Record<string, CoverageValue>> = {}
): CoverageRow[] {
  const rows: CoverageRow[] = [];

  for (const groupName of Object.keys(details).sort()) {
    const group = details[groupName] ?? {};
    for (const operationName of Object.keys(group).sort()) {
      rows.push({
        [`${groupName}.${operationName}`]: group[operationName],
      });
    }
  }

  return rows;
}

export default function AzureFeatureCoverage({ service }: { service: string }) {
  const [coverage, setCoverage] = React.useState<CoverageRow[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'implemented', desc: true },
    { id: 'operation', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  React.useEffect(() => {
    const loadData = async () => {
      const loader = jsonData[`/src/data/azure-coverage/${service}.json`];
      if (!loader) {
        setCoverage([]);
        return;
      }

      const moduleData = (await loader()) as { default: AzureCoverageFile };
      const operations = moduleData.default.operations ?? [];
      const rows =
        operations.length > 0
          ? operations
          : flattenDetails(moduleData.default.details);
      setCoverage(rows);
    };
    loadData();
  }, [service]);

  const table = useReactTable({
    data: coverage,
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
    initialState: { pagination: { pageSize: 12 } },
  });

  return (
    <div className="w-full">
      <div style={{ marginBottom: 12, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Filter by operation name..."
          value={
            (table.getColumn('operation')?.getFilterValue() as string) || ''
          }
          onChange={(e) =>
            table.getColumn('operation')?.setFilterValue(e.target.value)
          }
          className="border rounded px-2 py-1 w-full max-w-xs"
          style={{
            color: '#707385',
            fontFamily: 'var(--font-aeonik-fono)',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '-0.2px',
          }}
        />
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-full">
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

                    const getColumnWidth = (columnId: string) => {
                      switch (columnId) {
                        case 'operation':
                          return '85%';
                        case 'implemented':
                          return '15%';
                        default:
                          return '15%';
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
                          textAlign: header.id === 'operation' ? 'left' : 'center',
                          border: '1px solid #999CAD',
                          background: '#AFB2C2',
                          color: 'var(--sl-color-gray-1)',
                          fontFamily: 'var(--font-aeonik-fono)',
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
            <TableBody
              style={{
                color: 'var(--sl-color-gray-1)',
                fontFamily: 'var(--font-aeonik-fono)',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '16px',
                letterSpacing: '-0.15px',
              }}
            >
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        textAlign: cell.column.id === 'operation' ? 'left' : 'center',
                        border: '1px solid #999CAD',
                        padding: '12px 8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:
                          cell.column.id === 'operation' ? 'normal' : 'nowrap',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              style={{
                color: 'var(--sl-color-gray-1)',
                fontFamily: 'var(--font-aeonik-fono)',
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
                color: 'var(--sl-color-gray-1)',
                fontFamily: 'var(--font-aeonik-fono)',
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
      </div>
    </div>
  );
}
