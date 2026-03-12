import React from 'react';
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
import type { ColumnDef } from '@tanstack/react-table';
import permissionsData from '@/data/kubernetes/operator-permissions.json';

type PermissionRow = {
  kind?: string;
  name?: string;
  apiGroup?: string;
  resources?: string[];
  verbs: string[];
  nonResourceUrls?: string[];
};

const rows = permissionsData as PermissionRow[];

const headerCellStyle: React.CSSProperties = {
  textAlign: 'left',
  border: '1px solid #999CAD',
  background: '#AFB2C2',
  color: 'var(--sl-color-gray-1)',
  fontFamily: 'AeonikFono',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '16px',
  letterSpacing: '-0.15px',
  padding: '12px 8px',
};

const bodyCellStyle: React.CSSProperties = {
  verticalAlign: 'top',
  textAlign: 'left',
  border: '1px solid #999CAD',
  color: 'var(--sl-color-gray-1)',
  fontFamily: 'AeonikFono',
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '16px',
  letterSpacing: '-0.15px',
  padding: '12px 8px',
  whiteSpace: 'normal',
};

const renderCodeList = (values?: string[]) => {
  if (!values?.length) return null;
  return (
    <>
      {values.map((value, index) => (
        <React.Fragment key={`${value}-${index}`}>
          <code>{value}</code>
          {index < values.length - 1 ? ', ' : ''}
        </React.Fragment>
      ))}
    </>
  );
};

const columns: ColumnDef<PermissionRow>[] = [
  {
    accessorKey: 'kind',
    header: () => 'Kind',
    cell: ({ row }) => (row.original.kind ? <strong>{row.original.kind}</strong> : null),
  },
  {
    accessorKey: 'name',
    header: () => 'Name',
    cell: ({ row }) => (row.original.name ? <code>{row.original.name}</code> : null),
  },
  {
    accessorKey: 'apiGroup',
    header: () => 'API Groups',
    cell: ({ row }) => (row.original.apiGroup ? <code>{row.original.apiGroup}</code> : null),
  },
  {
    id: 'resources',
    header: () => 'Resources',
    cell: ({ row }) =>
      row.original.nonResourceUrls?.length ? (
        <> (nonResourceURLs: {renderCodeList(row.original.nonResourceUrls)})</>
      ) : (
        renderCodeList(row.original.resources)
      ),
  },
  {
    id: 'verbs',
    header: () => 'Verbs',
    cell: ({ row }) => row.original.verbs.join(', '),
  },
];

export default function OperatorPermissionsTable() {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    debugTable: false,
  });

  const getColumnWidth = (columnId: string) => {
    switch (columnId) {
      case 'kind':
        return '14%';
      case 'name':
        return '24%';
      case 'apiGroup':
        return '16%';
      case 'resources':
        return '23%';
      case 'verbs':
        return '23%';
      default:
        return 'auto';
    }
  };

  const getMinWidth = (columnId: string) => {
    switch (columnId) {
      case 'kind':
        return '110px';
      case 'name':
        return '220px';
      case 'apiGroup':
        return '170px';
      case 'resources':
        return '260px';
      case 'verbs':
        return '300px';
      default:
        return '80px';
    }
  };

  return (
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
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    ...headerCellStyle,
                    width: getColumnWidth(header.id),
                    minWidth: getMinWidth(header.id),
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{
                    ...bodyCellStyle,
                    width: getColumnWidth(cell.column.id),
                    minWidth: getMinWidth(cell.column.id),
                    whiteSpace:
                      cell.column.id === 'resources' || cell.column.id === 'verbs'
                        ? 'normal'
                        : 'nowrap',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
