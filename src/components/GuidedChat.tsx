import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Bot, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, getStageConfig } from "@/types/mentoring";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GuidedChatProps {
  stageNumber: number;
}

export const GuidedChat = ({ stageNumber }: GuidedChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const config = getStageConfig(stageNumber);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing messages and initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id || !config) return;

      try {
        // Load existing messages
        const { data: existingMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('stage_number', stageNumber)
          .order('created_at', { ascending: true });

        if (existingMessages && existingMessages.length > 0) {
          setMessages(existingMessages.map(m => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            metadata: m.metadata as Record<string, any>,
            created_at: m.created_at,
          })));
        } else {
          // Start new conversation
          await startConversation();
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Erro ao carregar chat",
          description: "Tente recarregar a página.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [user?.id, stageNumber]);

  const startConversation = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mentor-chat', {
        body: {
          stageNumber,
          action: 'start',
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data?.message) {
        const newMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          created_at: new Date().toISOString(),
        };
        setMessages([newMessage]);

        // Save to database
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          stage_number: stageNumber,
          role: 'assistant',
          content: data.message,
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user?.id) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        stage_number: stageNumber,
        role: 'user',
        content: userMessage.content,
      });

      // Get AI response
      const { data, error } = await supabase.functions.invoke('mentor-chat', {
        body: {
          stageNumber,
          action: 'respond',
          userId: user.id,
          userMessage: userMessage.content,
          messageHistory: messages.map(m => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      if (data?.message) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          metadata: data.metadata,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          stage_number: stageNumber,
          role: 'assistant',
          content: data.message,
          metadata: data.metadata || {},
        });

        // Update progress if provided
        if (data.updateProgress) {
          await supabase.from('mentoring_progress').upsert({
            user_id: user.id,
            stage_number: stageNumber,
            current_step: data.updateProgress.step,
            completed: data.updateProgress.completed || false,
            stage_data: data.updateProgress.data || {},
          }, {
            onConflict: 'user_id,stage_number',
          });
        }

        // Save collected data if provided
        if (data.collectData) {
          await supabase.from('collected_data').upsert({
            user_id: user.id,
            data_type: data.collectData.type,
            data_content: data.collectData.content,
            stage_number: stageNumber,
          }, {
            onConflict: 'user_id,data_type',
          });
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Etapa não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display font-semibold text-lg">
            Etapa {stageNumber}: {config.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Chat guiado com IA
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua resposta..."
            className="min-h-[50px] max-h-[150px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-auto aspect-square"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
