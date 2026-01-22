import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook to check if the current user is an admin.
 * 
 * IMPORTANT: isAdminSticky is a "sticky" flag that, once true, never goes back to false
 * in the same session. This prevents redirect loops caused by transient RPC errors.
 */
export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminSticky, setIsAdminSticky] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      // Do NOT reset isAdminSticky here - only logout should reset it
      setLoading(false);
      return;
    }

    try {
      // IMPORTANT: always use the backend role-check function.
      // Reading user_roles directly can fail under RLS and cause inconsistent admin detection.
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });

      if (error) {
        console.error('[useAdmin] RPC error:', error);
        // On error, do NOT set isAdmin to false if already sticky
        // This prevents transient errors from causing redirect loops
        if (!isAdminSticky) {
          setIsAdmin(false);
        }
      } else {
        const adminResult = Boolean(data);
        setIsAdmin(adminResult);
        
        // Once admin is detected, make it sticky for this session
        if (adminResult && !isAdminSticky) {
          console.log('[useAdmin] Admin detected, setting sticky flag');
          setIsAdminSticky(true);
        }
      }
    } catch (error) {
      console.error('[useAdmin] Unexpected error:', error);
      // Same logic: don't reset if already sticky
      if (!isAdminSticky) {
        setIsAdmin(false);
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAdminSticky]);

  useEffect(() => {
    if (authLoading) return;
    checkAdminStatus();
  }, [authLoading, checkAdminStatus]);

  // Listen for logout to reset sticky state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        console.log('[useAdmin] User signed out, resetting sticky flag');
        setIsAdminSticky(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { 
    isAdmin: isAdmin || isAdminSticky, // Either current or sticky means admin
    isAdminSticky,
    loading: authLoading || loading 
  };
};
