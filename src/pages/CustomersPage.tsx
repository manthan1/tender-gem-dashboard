
import { useState } from "react";
import { Users, MoreHorizontal, ListFilter, Edit, Trash2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDialog } from "@/components/CustomerDialog";

export default function CustomersPage() {
  const {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleAddCustomer = async (data: { name: string }) => {
    await addCustomer(data.name);
  };

  const handleEditCustomer = (id: string, name: string) => {
    setCurrentCustomer({ id, name });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = async (data: { name: string }) => {
    if (currentCustomer) {
      await updateCustomer(currentCustomer.id, data.name);
    }
  };

  const handleManageKeywords = (id: string) => {
    // Placeholder for now - will be implemented in the next step
    console.log("Manage keywords clicked", id);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer? This will also delete all associated keywords.")) {
      await deleteCustomer(id);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users /> Customers
            </CardTitle>
            <CardDescription>
              Manage your customers and their keywords
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>Add Customer</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-y-4 mb-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </>
          ) : error ? (
            <div className="text-center p-4 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          ) : customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleManageKeywords(customer.id)}
                          >
                            <ListFilter className="mr-2 h-4 w-4" />
                            Manage Keywords
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCustomer(customer.id, customer.name)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Name
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No customers found. Click "Add Customer" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <CustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddCustomer}
      />

      {/* Edit Customer Dialog */}
      <CustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateCustomer}
        customer={currentCustomer}
      />
    </div>
  );
}
