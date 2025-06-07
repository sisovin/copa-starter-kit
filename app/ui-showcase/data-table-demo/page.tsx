"use client";

import { UsersDataTableExample } from "@/components/examples/data-table-example";

export default function DataTableDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Table</h1>
          <p className="text-muted-foreground">
            A powerful data table component with features like pagination,
            sorting, filtering, column customization, and row actions.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <UsersDataTableExample />
        </div>
      </div>
    </div>
  );
}
