import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string) => Promise<void>; 
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession);
        
        if (event === 'SIGNED_IN') {
          if (currentSession?.user?.email === "admin@gmail.com") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        } else if (event === 'SIGNED_OUT') {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Failed to log in. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const adminLogin = async (email: string) => {
    try {
      const adminEmail = "admin@example.com";
      const adminPassword = "Admin123!@#";
      
      console.log("Attempting admin login...");
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: adminEmail, 
        password: adminPassword
      });
      
      if (signInError) {
        console.log("Admin sign-in failed, attempting signup:", signInError.message);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
          email: adminEmail, 
          password: adminPassword,
          options: {
            data: {
              is_admin: true,
              full_name: "Administrator",
            }
          }
        });
        
        if (signUpError) {
          console.error("Admin signup failed:", signUpError);
          throw new Error("Could not create admin account: " + signUpError.message);
        }
        
        const { error: finalSignInError } = await supabase.auth.signInWithPassword({ 
          email: adminEmail, 
          password: adminPassword
        });
        
        if (finalSignInError) {
          throw finalSignInError;
        }
        
        console.log("Admin account created and signed in successfully");
        
        const { error: adminInsertError } = await supabase
          .from('admin_users')
          .insert([{ id: signUpData.user?.id }]);
          
        if (adminInsertError) {
          console.error("Error adding to admin_users:", adminInsertError);
        }
      } else {
        console.log("Admin sign-in successful");
        
        if (signInData.user) {
          const { error: adminUpsertError } = await supabase
            .from('admin_users')
            .upsert([{ id: signInData.user.id }]);
            
          if (adminUpsertError) {
            console.error("Error upserting to admin_users:", adminUpsertError);
          }
        }
      }

      toast({
        title: "Admin Login Successful",
        description: "Welcome to the admin dashboard.",
      });
      
    } catch (error: any) {
      console.error("Admin login process error:", error);
      toast({
        title: "Admin Login Failed",
        description: error.message || "Invalid admin credentials.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session, 
      login, 
      adminLogin, 
      signup, 
      logout 
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
