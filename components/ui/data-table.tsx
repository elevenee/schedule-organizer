import React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Button } from "./button";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

/* eslint-disable */
interface ReusableTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    totalRows: number;
    pageSize: number;
    loading: boolean;
    pagination: any;
    sorting: any;
    onPaginationChange: any;
    onSortingChange: any;
    rowSelection?: any;
    search: string;
    pageSizes?: number[],
    onSearchChange: (q: string) => void;
    onPerPageChange: (p: string | number) => void;
    setRowSelection?: (updater: {}) => void;
    renderSubRow?: (row: Row<T>) => React.ReactNode | null;
}

export function DataTable<T>({ data, columns, totalRows, pageSize, loading, pagination, sorting, onPaginationChange, onSortingChange, rowSelection = {}, search, pageSizes, onSearchChange, onPerPageChange, setRowSelection, renderSubRow }: ReusableTableProps<T>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        onPaginationChange,
        onSortingChange,
        state: { pagination, sorting, rowSelection },
        rowCount: totalRows,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
    });

    return (
        <React.Fragment>
            <BaseFilter perPage={pageSize} pageSizes={pageSizes} search={search} onPerPageChange={onPerPageChange} onSearchChange={onSearchChange} />
            <div className="w-full">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? "cursor-pointer select-none flex items-center gap-1"
                                                            : ""
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: " ↑",
                                                        desc: " ↓",
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {
                                loading ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Loading..
                                        </TableCell>
                                    </TableRow>
                                )
                                    : table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <React.Fragment key={row.id}>
                                                <TableRow
                                                    key={row.id}
                                                    data-state={row.getIsSelected() && "selected"}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                                {renderSubRow && (
                                                    (() => {
                                                        const subRowContent = renderSubRow(row);
                                                        return subRowContent ? (
                                                            <TableRow>
                                                                <TableCell colSpan={row.getVisibleCells().length}>
                                                                    {subRowContent}
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : null;
                                                    })()
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of {" "}
                        {totalRows} row(s) selected.
                    </div>
                    <div className="space-x-2 flex items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={table.previousPage}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        {/* Show page numbers on medium screens and up, limit to 10 */}
                        <div className="hidden md:flex items-center space-x-1">
                            {(() => {
                                const pageCount = table.getPageCount();
                                const current = table.getState().pagination.pageIndex;
                                let start = Math.max(0, current - 4);
                                let end = Math.min(pageCount, start + 10);
                                if (end - start < 10) {
                                    start = Math.max(0, end - 10);
                                }
                                return Array.from({ length: end - start }, (_, idx) => {
                                    const i = start + idx;
                                    return (
                                        <Button
                                            key={i}
                                            variant={current === i ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => table.setPageIndex(i)}
                                            disabled={current === i}
                                        >
                                            {i + 1}
                                        </Button>
                                    );
                                });
                            })()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={table.nextPage}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

function BaseFilter({
    search = "",
    searchPlaceholder = "Type to search..",
    onSearchChange,
    perPage = 10,
    pageSizes = [10, 20, 50, 100],
    onPerPageChange
}: {
    search?: string,
    searchPlaceholder?: string;
    onSearchChange: (field: string) => void;
    perPage: number;
    pageSizes?: number[],
    onPerPageChange: (p: string | number) => void;
}) {
    return (
        <div
            className="flex flex-wrap justify-center md:justify-between gap-4 items-end mb-4 w-full border-y py-4 border-gray-200 dark:border-gray-400"
        >
            <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-sm"
            />

            <div className="flex flex-row gap-2 items-center">
                <span>Show</span>
                <Select value={perPage.toString()} onValueChange={onPerPageChange}>
                    <SelectTrigger className="w-auto">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            pageSizes.map((p) => (
                                <SelectItem value={p.toString()} key={p}>{p}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                <span>Items</span>
            </div>
        </div>
    )
}
