import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to generate signed URLs for private bucket files
 * URLs expire after 1 hour for security
 */
export const useSignedUrl = () => {
  const [loading, setLoading] = useState(false);

  const getSignedUrl = useCallback(async (filePath: string | null): Promise<string | null> => {
    if (!filePath) return null;

    // If it's already a full URL (legacy data), return as-is for backwards compat
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // Extract the path from the old public URL format
      const match = filePath.match(/\/mentee-files\/(.+)$/);
      if (match) {
        const extractedPath = match[1];
        setLoading(true);
        try {
          const { data, error } = await supabase.storage
            .from('mentee-files')
            .createSignedUrl(extractedPath, 3600); // 1 hour expiration

          if (error) {
            console.error('Error creating signed URL:', error);
            return null;
          }
          return data.signedUrl;
        } finally {
          setLoading(false);
        }
      }
      // Fallback for unknown URL format
      return null;
    }

    // It's a file path, generate signed URL
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('mentee-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiration

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }
      return data.signedUrl;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (filePath: string | null, fileName?: string) => {
    const url = await getSignedUrl(filePath);
    if (!url) return;

    setLoading(true);
    try {
      // Fetch the file as blob to avoid browser blocking external URLs
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Trigger download from local blob URL
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: try opening in new tab (may be blocked by some browsers)
      window.open(url, '_blank');
    } finally {
      setLoading(false);
    }
  }, [getSignedUrl]);

  return { getSignedUrl, downloadFile, loading };
};
