import { ReactNode, useMemo, useState } from "react";

type SortDirection = "asc" | "desc";
type SortableValue = string | number | null | undefined;

type SheetColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => SortableValue;
  headerClassName?: string;
  cellClassName?: string;
};

type SheetTableProps<T> = {
  columns: SheetColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  emptyContent?: ReactNode;
};

export function SheetTable<T>({ columns, data, rowKey, emptyContent }: SheetTableProps<T>) {
  // const sortableColumns = useMemo(() => columns.filter((column) => column.sortable), [columns]);
  const [sortState, setSortState] = useState<{ key: string; direction: SortDirection } | null>(
    null,
  );

  const activeSortColumn = useMemo(
    () => columns.find((column) => column.key === sortState?.key),
    [columns, sortState?.key],
  );

  const sortedData = useMemo(() => {
    if (!sortState || !activeSortColumn?.sortable) {
      return data;
    }

    const getValue = activeSortColumn.sortValue;
    if (!getValue) {
      return data;
    }

    const normalizeValue = (value: SortableValue) => {
      if (value === null || value === undefined) {
        return "";
      }

      if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
      }

      return value.toString().toLowerCase();
    };

    return [...data].sort((left, right) => {
      const leftValue = normalizeValue(getValue(left));
      const rightValue = normalizeValue(getValue(right));

      if (leftValue < rightValue) {
        return sortState.direction === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortState.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [activeSortColumn, data, sortState]);

  const toggleSort = (columnKey: string) => {
    setSortState((previous) => {
      if (!previous || previous.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }

      return {
        key: columnKey,
        direction: previous.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  if (data.length === 0 && emptyContent) {
    return <>{emptyContent}</>;
  }

  return (
    <div className="w-full max-w-full overflow-auto rounded-lg border border-neutral-200 bg-white max-h-[calc(100vh-14rem)]">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={[
                  "border-b border-neutral-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600",
                  index < columns.length - 1 ? "border-r border-neutral-200" : "",
                  column.sortable ? "cursor-pointer select-none" : "",
                  column.headerClassName,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={column.sortable ? () => toggleSort(column.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {column.header}
                  {sortState?.key === column.key ? (
                    <span>{sortState.direction === "asc" ? "↑" : "↓"}</span>
                  ) : column.sortable ? (
                    <span className="text-neutral-400">↕</span>
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-neutral-500"
              >
                No data available.
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr key={rowKey(row, rowIndex)} className="hover:bg-neutral-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={`${column.key}-${rowKey(row, rowIndex)}`}
                    className={[
                      "border-b border-neutral-200 px-3 py-2 align-top text-sm text-neutral-700",
                      colIndex < columns.length - 1 ? "border-r border-neutral-200" : "",
                      column.cellClassName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}