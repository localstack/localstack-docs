import React from 'react';
const jsonData = import.meta.glob('/src/data/coverage/*.json');
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


const columns: ColumnDef<any>[] = [
  {
    id: 'operation',
    accessorFn: (row) => Object.keys(row)[0],
    header: () => 'Operation',
    enableColumnFilter: true,
    filterFn: (row, _, filterValue) => {
      let operation = Object.keys(row.original)[0];
      return operation
        .toLowerCase()
        .includes((filterValue ?? '').toLowerCase());
    },
    enableResizing: false,
  },
  {
    id: 'implemented',
    accessorFn: (row) => row[Object.keys(row)[0]].implemented,
    header: () => 'Implemented',
    cell: ({ getValue }) => (getValue() ? '✔️' : ''),
    enableSorting: true,
    enableResizing: false,
  },
  {
    id: 'image',
    accessorFn: (row) => row[Object.keys(row)[0]].availability,
    header: () => 'Image',
    enableSorting: false,
    enableResizing: false,
  },
];

export default function PersistenceCoverage({ service }: { service: string }) {
  const [coverage, setCoverage] = React.useState<any[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'operation', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  React.useEffect(() => {
    const loadData = async () => {
      const moduleData = (await jsonData[
        `/src/data/coverage/${service}.json`
      ]()) as { default: Record<string, any> };
      setCoverage(moduleData.default.operations);
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
    initialState: { pagination: { pageSize: 10 } },
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
        />
      </div>
      <div className="rounded-md border w-full overflow-hidden">
        <Table 
          className="w-full" 
          style={{ 
            width: '100%',
            tableLayout: 'fixed',
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  // Calculate percentage-based widths: Operation 60%, others 20% each
                  const getColumnWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'operation':
                        return '75%';
                      case 'implemented':
                      case 'image':
                        return '15%';
                      default:
                        return 'auto';
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
                  // Same width calculation for cells
                  const getColumnWidth = (columnId: string) => {
                    switch (columnId) {
                      case 'operation':
                        return '60%';
                      case 'implemented':
                      case 'image':
                        return '20%';
                      default:
                        return 'auto';
                    }
                  };
                  
                  return (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: getColumnWidth(cell.column.id),
                        textAlign: cell.column.id === 'operation' ? 'left' : 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: cell.column.id === 'operation' ? 'normal' : 'nowrap',
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
