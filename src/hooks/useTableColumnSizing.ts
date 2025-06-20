import { useState, useEffect } from 'react';
import type { ColumnDef, ColumnSizingState } from '@tanstack/react-table';

/**
 * A hook to manage column sizing for tables
 * @param columns The column definitions with size information
 * @returns An object with column sizing state and setter
 */
export function useTableColumnSizing<T>(columns: ColumnDef<T>[]) {
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Initialize column sizing with default values from column definitions
  useEffect(() => {
    const initialSizing: ColumnSizingState = {};
    columns.forEach(col => {
      const columnId = typeof col.accessorKey === 'string' ? col.accessorKey : col.id as string;
      if (columnId) {
        initialSizing[columnId] = col.size || 150;
      }
    });
    setColumnSizing(initialSizing);
  }, [columns]);

  return {
    columnSizing,
    setColumnSizing,
  };
}