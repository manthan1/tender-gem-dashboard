
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

// Admin login form schema
const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
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
      password: "123456", // Updated to 6 characters
    },
  });

  const handleAdminLogin = async (data: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      await adminLogin(data.email, data.password);
    } catch (error) {
      console.error("Admin login error:", error);
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
        <CardContent>
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
              <FormField
                control={adminForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
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
