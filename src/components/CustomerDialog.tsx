import { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react"; // Added Loader2

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { useCustomers, CustomerKeyword } from "@/hooks/useCustomers"; // Import hook functions & types
import { toast } from "@/components/ui/use-toast"; // Ensure toast is available


// Define the schema for customer form validation
const customerSchema = z.object({
  name: z.string().min(2, { message: "Customer name must be at least 2 characters" }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// Define Customer type based on props usage (adjust if needed)
interface SimpleCustomer {
    id: string;
    name: string;
}

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onSubmit now only needs to handle the customer name update/add
  onSubmit: (data: { name: string }, customerId?: string) => Promise<void>;
  customer?: SimpleCustomer | null; // Use SimpleCustomer type
}

export function CustomerDialog({
  open,
  onOpenChange,
  onSubmit,
  customer,
}: CustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!customer;
  const customerId = customer?.id; // Store customerId for easier access

  // --- Hooks and State for Keywords ---
  const { fetchKeywordsForCustomer, addKeyword, deleteKeyword } = useCustomers();
  const [keywords, setKeywords] = useState<CustomerKeyword[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [keywordsLoading, setKeywordsLoading] = useState<boolean>(false);
  const [isProcessingKeyword, setIsProcessingKeyword] = useState<boolean>(false);
  // --- End Keyword State ---

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    // Use defaultValues to reset form state when customer changes
    defaultValues: {
      name: "", // Start with empty, set in useEffect
    },
  });

  // Effect to update form values when customer prop changes or dialog opens
  useEffect(() => {
    if (open) {
        // Reset form with current customer name or empty string
        form.reset({
            name: customer?.name || ""
        });
        // Reset keyword input
        setNewKeyword('');
        setIsProcessingKeyword(false); // Reset keyword processing state

        // Fetch keywords if editing
        if (isEditing && customerId) {
            fetchCustomerKeywords(customerId);
        } else {
            setKeywords([]); // Clear keywords if adding new customer
            setKeywordsLoading(false);
        }
    } else {
        // Optional: Reset state completely when dialog closes if needed
        // form.reset({ name: "" });
        // setKeywords([]);
        // setNewKeyword('');
        // setKeywordsLoading(false);
        // setIsProcessingKeyword(false);
    }
  }, [customer, open, isEditing, customerId, form]); // Dependencies include form

  // Function to fetch keywords
  const fetchCustomerKeywords = useCallback(async (id: string) => {
     if (!id) return;
     setKeywordsLoading(true);
     try {
       const fetchedKeywords = await fetchKeywordsForCustomer(id);
       setKeywords(fetchedKeywords || []);
     } catch (error) {
       console.error("Failed to fetch keywords:", error);
       toast({ title: "Error", description: "Could not load keywords.", variant: "destructive" });
       setKeywords([]);
     } finally {
       setKeywordsLoading(false);
     }
   }, [fetchKeywordsForCustomer]); // Dependency on hook function

  // Handle MAIN form submission (Customer Name Add/Update)
  const handleCustomerSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      // Pass customerId if editing
      await onSubmit(data, isEditing ? customerId : undefined);
      // form.reset(); // Reset happens in useEffect on open change now
      onOpenChange(false); // Close dialog on success
      // Success toast should be handled in the parent component's onSubmit function
    } catch (error) {
      console.error("Error submitting customer form:", error);
      // Error toast should be handled in the parent component's onSubmit function
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Keyword Handlers ---
  const handleAddKeyword = async () => {
    if (!customerId || !newKeyword.trim() || isProcessingKeyword) return;

    setIsProcessingKeyword(true);
    try {
      const addedKeyword = await addKeyword(customerId, newKeyword.trim());
      if (addedKeyword) {
        setNewKeyword(''); // Clear input
        // Re-fetch keywords to update list immediately
        await fetchCustomerKeywords(customerId); // Use local fetch function
      }
      // Success/Error toasts are handled within the addKeyword hook
    } catch (error) {
       console.error("Unexpected error in handleAddKeyword:", error);
       toast({ title: "Error", description: "Could not add keyword.", variant: "destructive" });
    } finally {
        setIsProcessingKeyword(false);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    if (!customerId || isProcessingKeyword) return;

    setIsProcessingKeyword(true);
    try {
        const success = await deleteKeyword(keywordId);
        if (success) {
            // Re-fetch keywords to update list immediately
            await fetchCustomerKeywords(customerId); // Use local fetch function
        }
        // Success/Error toasts are handled within the deleteKeyword hook
    } catch(error) {
        console.error("Unexpected error in handleDeleteKeyword:", error);
        toast({ title: "Error", description: "Could not delete keyword.", variant: "destructive" });
    } finally {
        setIsProcessingKeyword(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Increased width */}
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update customer information and manage keywords." // Updated description
              : "Enter the details for your new customer."}
          </DialogDescription>
        </DialogHeader>

        {/* Customer Name Form */}
        <Form {...form}>
          {/* Use form element ID if needed, or wrap sections */}
          <div className="space-y-4 py-2"> {/* Wrap form fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>

        {/* --- Keyword Management Section (Only for Edit Mode) --- */}
        {isEditing && customerId && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <h4 className="font-medium text-lg mb-2">Keywords</h4>
            <div className="min-h-[60px]"> {/* Add min height to prevent layout jump */}
                {keywordsLoading && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading keywords...
                    </div>
                )}
                {!keywordsLoading && keywords.length === 0 && (
                     <p className="text-sm text-muted-foreground">No keywords added yet.</p>
                )}
                {!keywordsLoading && keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw) => (
                      <Badge key={kw.id} variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                        <span>{kw.keyword}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full hover:bg-destructive/20 text-destructive/80 hover:text-destructive"
                          onClick={() => !isProcessingKeyword && handleDeleteKeyword(kw.id)}
                          disabled={isProcessingKeyword}
                          aria-label={`Delete keyword ${kw.keyword}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
            <div className="flex gap-2 items-center pt-2">
              <Input
                placeholder="Add new keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-grow"
                disabled={isProcessingKeyword || keywordsLoading}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isProcessingKeyword) handleAddKeyword(); }} // Add check for isProcessingKeyword
              />
              <Button
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim() || isProcessingKeyword || keywordsLoading}
                size="sm"
                variant="outline"
              >
                {isProcessingKeyword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add
              </Button>
            </div>
          </div>
        )}
        {/* --- End Keyword Section --- */}

        <DialogFooter className="mt-6"> {/* Added margin top */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {/* This button now triggers the react-hook-form submission */}
          <Button
            type="button" // Changed from submit
            onClick={form.handleSubmit(handleCustomerSubmit)} // Trigger RHF submit here
            disabled={isSubmitting || !form.formState.isValid} // Disable if form invalid or submitting
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {/* Added Loader */}
            {isEditing ? "Update Customer" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}