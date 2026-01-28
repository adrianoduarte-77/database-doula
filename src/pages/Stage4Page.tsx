import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useDev } from "@/hooks/useDev";
import { Stage4Guide } from "@/components/Stage4Guide";
import { Loader2 } from "lucide-react";

const Stage4Page = () => {
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

    // TEMPORARY: Block stage 4 for non-admin/dev users
    if (!isAdmin && !isDev) {
      navigate('/');
      return;
    }
  }, [user, authLoading, adminLoading, devLoading, isAdmin, isDev, navigate]);

  // Show loading while checking permissions
  if (authLoading || adminLoading || devLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if user will be redirected
  if (!user || (!isAdmin && !isDev)) {
    return null;
  }

  return <Stage4Guide stageNumber={4} />;
};

export default Stage4Page;
