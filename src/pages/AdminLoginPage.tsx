
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield } from "lucide-react";

// Admin login form schema (email only)
const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLoginPage = () => {
  const { adminLogin, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Admin login form
  const adminForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "admin@gmail.com", // Pre-filled for testing
    },
  });

  const handleAdminLogin = async (data: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      await adminLogin(data.email);
    } catch (error) {
      console.error("Admin login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectAdminAccess = async () => {
    setIsLoading(true);
    try {
      await adminLogin("admin@gmail.com");
    } catch (error) {
      console.error("Direct admin access error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated and is admin, redirect to admin dashboard
  if (isAuthenticated && user?.email === "admin@gmail.com") {
    return <Navigate to="/admin" />;
  }
  
  // If authenticated but not admin, redirect to regular dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Shield className="h-12 w-12 text-blue-600 mb-2" />
          <CardTitle className="text-2xl font-bold text-center">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-center">
            Access the GEM Tenders administration panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* One-click admin access button */}
          <Button 
            onClick={handleDirectAdminAccess} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accessing Admin Mode
              </>
            ) : (
              "Enter Admin Mode"
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or use email
              </span>
            </div>
          </div>
          
          {/* Email-based admin login */}
          <Form {...adminForm}>
            <form onSubmit={adminForm.handleSubmit(handleAdminLogin)} className="space-y-4">
              <FormField
                control={adminForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating
                  </>
                ) : (
                  "Admin Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
