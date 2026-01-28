import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useDev } from "@/hooks/useDev";
import { Stage5Guide } from "@/components/Stage5Guide";
import { Loader2 } from "lucide-react";

const Stage5Page = () => {
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

    // TEMPORARY: Block stage 5 for non-admin/dev users
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

  return (
    <div className="min-h-screen bg-background">
      <Stage5Guide stageNumber={5} />
    </div>
  );
};

export default Stage5Page;
