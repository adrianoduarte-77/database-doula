import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BaseCV {
  id: string;
  cv_analysis: string;
  original_filename: string | null;
  updated_at: string;
}

export function useBaseCV() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [baseCV, setBaseCV] = useState<BaseCV | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing base CV on mount
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchBaseCV = async () => {
      try {
        const { data, error } = await supabase
          .from("user_base_cv")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching base CV:", error);
        } else if (data) {
          setBaseCV(data as BaseCV);
        }
      } catch (err) {
        console.error("Error in fetchBaseCV:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBaseCV();
  }, [user?.id]);

  // Save or update base CV
  const saveBaseCV = async (cvAnalysis: string, filename?: string) => {
    if (!user?.id) return false;

    try {
      if (baseCV) {
        // Update existing
        const { data, error } = await supabase
          .from("user_base_cv")
          .update({
            cv_analysis: cvAnalysis,
            original_filename: filename || baseCV.original_filename,
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        setBaseCV(data as BaseCV);
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("user_base_cv")
          .insert({
            user_id: user.id,
            cv_analysis: cvAnalysis,
            original_filename: filename || null,
          })
          .select()
          .single();

        if (error) throw error;
        setBaseCV(data as BaseCV);
      }

      return true;
    } catch (err) {
      console.error("Error saving base CV:", err);
      toast({
        title: "Erro ao salvar CV",
        description: "Não foi possível salvar o CV base.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Clear base CV (for replacing)
  const clearBaseCV = async () => {
    if (!user?.id || !baseCV) return;

    try {
      const { error } = await supabase
        .from("user_base_cv")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setBaseCV(null);
    } catch (err) {
      console.error("Error clearing base CV:", err);
    }
  };

  return {
    baseCV,
    isLoading,
    saveBaseCV,
    clearBaseCV,
    hasBaseCV: !!baseCV,
  };
}
