import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface StageCompleteButtonProps {
  stageNumber: number;
  disabled?: boolean;
  className?: string;
}

export const StageCompleteButton = ({ 
  stageNumber, 
  disabled = false,
  className = ''
}: StageCompleteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (!user?.id || completing) return;

    setCompleting(true);
    try {
      const { data: existing } = await supabase
        .from('mentoring_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('stage_number', stageNumber)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('mentoring_progress')
          .update({ completed: true, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('mentoring_progress').insert([{
          user_id: user.id,
          stage_number: stageNumber,
          current_step: 1,
          completed: true,
        }]);
      }

      toast({
        title: "Etapa concluída!",
        description: `Etapa ${stageNumber} marcada como concluída.`,
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error completing stage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a etapa como concluída.",
        variant: "destructive",
      });
    } finally {
      setCompleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleComplete}
      disabled={disabled || completing}
      className={`gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 ${className}`}
    >
      <Check className="w-4 h-4" />
      {completing ? 'Salvando...' : 'Marcar como concluída'}
    </Button>
  );
};
