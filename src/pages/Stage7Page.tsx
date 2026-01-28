import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useDev } from '@/hooks/useDev';
import { Stage7Guide } from '@/components/Stage7Guide';
import { Loader2 } from 'lucide-react';

const Stage7Page = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isDev, loading: devLoading } = useDev();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for all loading states
    if (authLoading || adminLoading || devLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // TEMPORARY: Block stage 7 for non-admin/dev users
    if (!isAdmin && !isDev) {
      navigate('/');
      return;
    }
  }, [user, authLoading, adminLoading, devLoading, isAdmin, isDev, navigate]);

  // Show loading while checking permissions
  if (authLoading || adminLoading || devLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if user will be redirected
  if (!user || (!isAdmin && !isDev)) {
    return null;
  }

  return <Stage7Guide stageNumber={7} />;
};

export default Stage7Page;
