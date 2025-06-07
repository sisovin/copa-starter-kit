"use client";

import { Table } from "@tanstack/react-table";
import { SlidersHorizontal, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterableColumns?: {
    id: string;
    title: string;
    options: {
      value: string;
      label: string;
    }[];
  }[];
  searchableColumns?: {
    id: string;
    title: string;
  }[];
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const [activeFilter, setActiveFilter] = React.useState<string | null>(
    searchableColumns.length ? searchableColumns[0]?.id : null
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchableColumns.length > 0 && activeFilter && (
          <Input
            placeholder={`Search ${searchableColumns.find((column) => column.id === activeFilter)?.title}...`}
            value={
              (table.getColumn(activeFilter)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(activeFilter)?.setFilterValue(event.target.value)
            }
            className="h-9 w-full md:w-[250px]"
          />
        )}
        {searchableColumns.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 flex gap-1">
                Search
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {searchableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={activeFilter === column.id}
                  onCheckedChange={() => setActiveFilter(column.id)}
                >
                  {column.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {filterableColumns.length > 0 &&
          filterableColumns.map((column) => {
            const columnFilter = table.getColumn(column.id);
            if (!columnFilter) return null;

            return (
              <DataTableFacetedFilter
                key={column.id}
                column={columnFilter}
                title={column.title}
                options={column.options}
              />
            );
          })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-9">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
