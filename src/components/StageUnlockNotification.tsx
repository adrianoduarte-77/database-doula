import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface StageNotification {
  stageNumber: number;
  title: string;
  message: string;
  path: string;
}

const stageNotifications: Record<number, Omit<StageNotification, 'stageNumber' | 'path'>> = {
  1: {
    title: 'LinkedIn Pronto! 🎉',
    message: 'Seu novo LinkedIn está pronto, clique aqui para iniciarmos a Etapa 1 da Mentoria',
  },
  2: {
    title: 'Etapa 2 Liberada! 📄',
    message: 'Você já pode criar seu currículo estratégico na Etapa 2',
  },
  3: {
    title: 'Funil Pronto! 🎯',
    message: 'Seu funil de oportunidades está pronto, clique aqui para ver sua estratégia personalizada',
  },
  5: {
    title: 'Etapa 5 Liberada! 💼',
    message: 'Você já pode criar sua apresentação para convencer o gestor',
  },
};

interface StageUnlockNotificationProps {
  linkedinDiagnosticPublished: boolean;
  stage2Unlocked: boolean;
  opportunityFunnelPublished: boolean;
  hasInterviewHistory: boolean;
  userId: string | undefined;
}

export const StageUnlockNotification = ({
  linkedinDiagnosticPublished,
  stage2Unlocked,
  opportunityFunnelPublished,
  hasInterviewHistory,
  userId,
}: StageUnlockNotificationProps) => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<StageNotification | null>(null);
  const [open, setOpen] = useState(false);
  const [seenStages, setSeenStages] = useState<Set<number> | null>(null);

  const getStagePaths: Record<number, string> = {
    1: '/etapa/1',
    2: '/cv',
    3: '/etapa/3',
    5: '/etapa/5',
  };

  // Load seen notifications from database
  useEffect(() => {
    if (!userId) return;

    const loadSeen = async () => {
      const { data } = await supabase
        .from('stage_notifications_seen')
        .select('stage_number')
        .eq('user_id', userId);

      const seen = new Set<number>((data || []).map((r: any) => r.stage_number));
      setSeenStages(seen);
    };

    loadSeen();
  }, [userId]);

  // Check for notifications once seen data is loaded
  useEffect(() => {
    if (!userId || seenStages === null) return;

    const checkStageNotification = (stageNumber: number, isUnlocked: boolean) => {
      if (isUnlocked && !seenStages.has(stageNumber)) {
        const notificationData = stageNotifications[stageNumber];
        if (notificationData) {
          setNotification({
            stageNumber,
            ...notificationData,
            path: getStagePaths[stageNumber],
          });
          setOpen(true);
          return true;
        }
      }
      return false;
    };

    if (checkStageNotification(5, hasInterviewHistory)) return;
    if (checkStageNotification(3, opportunityFunnelPublished)) return;
    if (checkStageNotification(2, stage2Unlocked)) return;
    if (checkStageNotification(1, linkedinDiagnosticPublished)) return;
  }, [userId, seenStages, linkedinDiagnosticPublished, stage2Unlocked, opportunityFunnelPublished, hasInterviewHistory]);

  const handleClose = async () => {
    if (notification && userId) {
      // Mark as seen in database
      await supabase
        .from('stage_notifications_seen')
        .upsert(
          { user_id: userId, stage_number: notification.stageNumber },
          { onConflict: 'user_id,stage_number' }
        );

      // Update local state
      setSeenStages((prev) => {
        const next = new Set(prev);
        next.add(notification.stageNumber);
        return next;
      });
    }
    setOpen(false);
    setNotification(null);
  };

  const handleNavigate = () => {
    if (notification) {
      handleClose();
      navigate(notification.path);
    }
  };

  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">
            {notification.title}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {notification.message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleNavigate}
            className="w-full gap-2"
          >
            Acessar Etapa {notification.stageNumber}
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleClose}
            className="w-full text-muted-foreground"
          >
            Depois
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
