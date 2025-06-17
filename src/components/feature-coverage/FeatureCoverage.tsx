import React from "react";
const jsonData = import.meta.glob('/src/data/coverage/*.json');
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import type { SortingState, ColumnDef, ColumnFiltersState } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    id: "operation",
    accessorFn: (row) => (
        Object.keys(row)[0]
    ),
    header: () => "Operation",
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      let operation = Object.keys(row.original)[0];
      return operation
        .toLowerCase()
        .includes((filterValue ?? "").toLowerCase());
    },
    meta: { className: "w-1/3" },
  },
  {
    id: "implemented",
    accessorFn: row => row[Object.keys(row)[0]].implemented,
    header: () => "Implemented",
    cell: ({ getValue }) => (getValue() ? "✔️" : ""),
    meta: { className: "w-1/6" },
    enableSorting: true,
  },
  {
    id: "image",
    accessorFn: row => row[Object.keys(row)[0]].availability,
    header: () => "Image",
    cell: ({ getValue }) => (getValue() ? "✔️" : ""),
    meta: { className: "w-1/6" },
    enableSorting: false,
  },
  {
    id: "internal_test_suite",
    accessorFn: row => row[Object.keys(row)[0]].internal_test_suite,
    header: () => "Internal Test Suite",
    cell: ({ getValue }) => (getValue() ? "✔️" : ""),
    enableSorting: false,
    meta: { className: "whitespace-normal" },
  },
  {
    id: "external_test_suite",
    accessorFn: row => row[Object.keys(row)[0]].external_test_suite,
    header: () => "External Test Suite",
    cell: ({ getValue }) => (getValue() ? "✔️" : ""),
    enableSorting: false,
    meta: { className: "whitespace-normal" },
  },
  {
    id: "terraform_test_suite",
    accessorFn: row => row[Object.keys(row)[0]].terraform_test_suite,
    header: () => "Terraform Validated",
    cell: ({ getValue }) => (getValue() ? "✔️" : ""),
    enableSorting: false,
    meta: { className: "whitespace-normal" },
  },
  {
    id: "aws_validated",
    accessorFn: row => row[Object.keys(row)[0]].aws_validated,
    header: () => "AWS Validated",
    cell: ({ getValue }) => (getValue() ? "✔️" : ""),
    enableSorting: false,
    meta: { className: "whitespace-normal" },
  },
  {
    id: "snapshot_tested",
    accessorFn: row => row[Object.keys(row)[0]].snapshot_tested,
    header: () => "Snapshot Tested",
    cell: ({ getValue }) => (getValue() ? "✔️" : ""),
    enableSorting: false,
    meta: { className: "whitespace-normal" },
  },
];

export default function PersistenceCoverage({service}: {service: string}) {
  const [coverage, setCoverage] = React.useState<any[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "operation", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const moduleData = await jsonData[`/src/data/coverage/${service}.json`]() as { default: Record<string, any> };
      setCoverage(moduleData.default.operations);
    };
    loadData();
  }, [service]);

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
        <h2 id="api-coverage">API Coverage</h2>
      <div style={{ marginBottom: 12, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Filter by operation name..."
          value={
            table.getColumn("operation")?.getFilterValue() as string || ""
          }
          onChange={e =>
            table.getColumn("operation")?.setFilterValue(e.target.value)
          }
          className="border rounded px-2 py-1 w-full max-w-xs"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const meta = header.column.columnDef.meta as { className?: string } | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={
                        (meta?.className || "") +
                        (canSort ? " cursor-pointer select-none" : "")
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span>
                          {header.column.getIsSorted() === "asc"
                            ? " ▲"
                            : header.column.getIsSorted() === "desc"
                            ? " ▼"
                            : ""}
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
                  const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                  return (
                    <TableCell
                      key={cell.id}
                      className={meta?.className || undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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