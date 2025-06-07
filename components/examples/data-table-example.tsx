"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
} from "@/components/ui/data-table";

// Example data type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastActive: string;
}

// Sample data
const data: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "active",
    lastActive: "2023-06-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "User",
    status: "active",
    lastActive: "2023-06-21T10:15:00Z",
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    role: "Editor",
    status: "inactive",
    lastActive: "2023-06-18T09:45:00Z",
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "emily.brown@example.com",
    role: "Viewer",
    status: "pending",
    lastActive: "2023-06-22T16:20:00Z",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "Admin",
    status: "active",
    lastActive: "2023-06-21T08:30:00Z",
  },
  {
    id: "6",
    name: "Sarah Taylor",
    email: "sarah.taylor@example.com",
    role: "User",
    status: "active",
    lastActive: "2023-06-20T11:10:00Z",
  },
  {
    id: "7",
    name: "Robert Anderson",
    email: "robert.anderson@example.com",
    role: "Editor",
    status: "inactive",
    lastActive: "2023-06-19T15:45:00Z",
  },
  {
    id: "8",
    name: "Jennifer Martinez",
    email: "jennifer.martinez@example.com",
    role: "Viewer",
    status: "pending",
    lastActive: "2023-06-22T09:15:00Z",
  },
  {
    id: "9",
    name: "William Thomas",
    email: "william.thomas@example.com",
    role: "Admin",
    status: "active",
    lastActive: "2023-06-21T13:50:00Z",
  },
  {
    id: "10",
    name: "Lisa Garcia",
    email: "lisa.garcia@example.com",
    role: "User",
    status: "active",
    lastActive: "2023-06-20T16:30:00Z",
  },
  {
    id: "11",
    name: "James Rodriguez",
    email: "james.rodriguez@example.com",
    role: "Editor",
    status: "inactive",
    lastActive: "2023-06-18T14:20:00Z",
  },
  {
    id: "12",
    name: "Patricia Lee",
    email: "patricia.lee@example.com",
    role: "Viewer",
    status: "pending",
    lastActive: "2023-06-22T10:45:00Z",
  },
];

export function UsersDataTableExample() {
  // Define columns
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => <div>{row.getValue("role")}</div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const statusColorMap: Record<string, string> = {
          active: "bg-green-100 text-green-800 border-green-200",
          inactive: "bg-red-100 text-red-800 border-red-200",
          pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };

        return (
          <Badge
            variant="outline"
            className={`${statusColorMap[status]} capitalize`}
          >
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "lastActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Active" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastActive") as string);
        return <div>{date.toLocaleDateString()}</div>;
      },
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
                  // Handle edit logic
                },
                icon: <Pencil className="h-4 w-4" />,
              },
              {
                label: "Delete",
                onClick: (row) => {
                  console.log("Delete", row.original);
                  // Handle delete logic
                },
                icon: <Trash className="h-4 w-4" />,
                shortcut: "⌘⌫",
              },
            ]}
          />
        );
      },
    },
  ];

  const filterableColumns = [
    {
      id: "role",
      title: "Role",
      options: [
        { label: "Admin", value: "Admin" },
        { label: "User", value: "User" },
        { label: "Editor", value: "Editor" },
        { label: "Viewer", value: "Viewer" },
      ],
    },
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
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
        filterableColumns={filterableColumns}
        searchableColumns={searchableColumns}
      />
    </div>
  );
}
