import { ReactNode } from "react";

type SheetColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
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
  if (data.length === 0 && emptyContent) {
    return <>{emptyContent}</>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={[
                  "border-b border-neutral-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600",
                  index < columns.length - 1 ? "border-r border-neutral-200" : "",
                  column.headerClassName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {column.header}
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
            data.map((row, rowIndex) => (
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