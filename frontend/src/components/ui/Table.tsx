import { ReactNode, useMemo, useState } from "react";

type SortDirection = "asc" | "desc";
type SortableValue = string | number | null | undefined;

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => SortableValue;
  className?: string;
  cellClassName?: string;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  emptyContent?: ReactNode;
};

export function Table<T>({ columns, data, rowKey, emptyContent }: TableProps<T>) {
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
    <div className="w-full max-w-full overflow-auto rounded-lg border border-neutral-200 max-h-[calc(100vh-14rem)]">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600",
                  column.sortable ? "cursor-pointer select-none" : "",
                  column.className,
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

        <tbody className="divide-y divide-neutral-200 bg-white">
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
            sortedData.map((row, index) => (
              <tr key={rowKey(row, index)} className="hover:bg-neutral-50">
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${rowKey(row, index)}`}
                    className={[
                      "whitespace-nowrap px-4 py-3 text-sm text-neutral-700",
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
