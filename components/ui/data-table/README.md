# Data Table Component

A powerful and customizable data table component built with React, Tailwind CSS, and @tanstack/react-table.

## Features

- **Pagination** - Navigate through large datasets with ease
- **Sorting** - Sort data by clicking on column headers
- **Filtering** - Filter data by column values
- **Column Customization** - Show/hide columns as needed
- **Row Actions** - Perform actions on individual rows
- **Row Selection** - Select multiple rows for batch actions
- **Search** - Search through specific columns

## Usage

### Basic Example

```tsx
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns"; // Define your columns
import { data } from "./data"; // Your data

export function MyDataTable() {
  return <DataTable columns={columns} data={data} />;
}
```

### Advanced Example

```tsx
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns"; // Define your columns
import { data } from "./data"; // Your data

export function MyAdvancedDataTable() {
  const filterableColumns = [
    {
      id: "status",
      title: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
    },
  ];

  const searchableColumns = [
    {
      id: "name",
      title: "Name",
    },
    {
      id: "email",
      title: "Email",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      filterableColumns={filterableColumns}
      searchableColumns={searchableColumns}
      defaultSort={{ id: "createdAt", desc: true }}
    />
  );
}
```

## Components

The data table is composed of the following components:

- `DataTable` - Main component
- `DataTablePagination` - For pagination controls
- `DataTableToolbar` - For search, filtering, and column visibility
- `DataTableFacetedFilter` - For faceted filtering
- `DataTableColumnHeader` - For sortable column headers
- `DataTableRowActions` - For row action buttons

## Props

### DataTable Props

| Name              | Type                                                                            | Description                            |
| ----------------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| columns           | `ColumnDef<TData, TValue>[]`                                                    | Column definitions                     |
| data              | `TData[]`                                                                       | Data to display                        |
| filterableColumns | `{ id: string; title: string; options: { value: string; label: string; }[] }[]` | Optional. Columns that can be filtered |
| searchableColumns | `{ id: string; title: string; }[]`                                              | Optional. Columns that can be searched |
| defaultSort       | `{ id: string; desc: boolean; }`                                                | Optional. Default sorting              |

## Column Definition Example

```tsx
export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: "Edit",
              onClick: (row) => {
                console.log("Edit", row.original);
              },
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              label: "Delete",
              onClick: (row) => {
                console.log("Delete", row.original);
              },
              icon: <Trash className="h-4 w-4" />,
            },
          ]}
        />
      );
    },
  },
];
```
