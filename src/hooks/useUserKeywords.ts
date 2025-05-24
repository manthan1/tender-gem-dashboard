
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useUserKeywords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getUserKeywords = useCallback(async (): Promise<string[]> => {
    if (!user?.id) return [];
    
    try {
      const { data, error } = await supabase.rpc('get_user_keywords', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      return data || [];
    } catch (err: any) {
      console.error('Error fetching user keywords:', err);
      toast({
        title: "Error",
        description: "Failed to fetch your keywords",
        variant: "destructive",
      });
      return [];
    }
  }, [user?.id, toast]);

  const updateUserKeywords = useCallback(async (keywords: string[]): Promise<boolean> => {
    if (!user?.id) return false;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_user_keywords', {
        p_user_id: user.id,
        p_keywords: keywords
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your keywords have been updated",
      });
      
      return data;
    } catch (err: any) {
      console.error('Error updating user keywords:', err);
      toast({
        title: "Error",
        description: "Failed to update your keywords",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  return {
    getUserKeywords,
    updateUserKeywords,
    loading
  };
};
