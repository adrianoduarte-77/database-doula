import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const RECOVERY_STORAGE_KEY = "recovery_context";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRecoveryContext, setHasRecoveryContext] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordRequirements = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }),
    [password],
  );

  const isPasswordValid = useMemo(() => Object.values(passwordRequirements).every(Boolean), [passwordRequirements]);
  const isMatch = password && password === confirmPassword;
  const requirementsMet = useMemo(
    () => Object.values(passwordRequirements).filter(Boolean).length,
    [passwordRequirements],
  );

  const recoveryInfo = useMemo(() => {
    const hashValue = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
    const params = new URLSearchParams(hashValue);
    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const isRecovery = type === "recovery" || Boolean(accessToken);
    const hasError = Boolean(error || errorCode);

    let message = "";
    if (hasError) {
      message =
        errorCode === "otp_expired"
          ? "Link expirado. Solicite um novo e-mail de recuperação."
          : errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
          : "Link inválido ou expirado.";
    }

    return { isRecovery, hasError, message };
  }, [location.hash]);

  useEffect(() => {
    if (recoveryInfo.hasError) {
      sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      setHasRecoveryContext(false);
      return;
    }

    if (recoveryInfo.isRecovery) {
      sessionStorage.setItem(RECOVERY_STORAGE_KEY, "1");
      setHasRecoveryContext(true);
      return;
    }

    setHasRecoveryContext(sessionStorage.getItem(RECOVERY_STORAGE_KEY) === "1");
  }, [recoveryInfo.hasError, recoveryInfo.isRecovery]);

  const canReset = (hasRecoveryContext || recoveryInfo.isRecovery) && !recoveryInfo.hasError;
  const submitDisabled = loading || !canReset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canReset) {
      toast({
        title: "Link inválido",
        description: "Abra esta página a partir do link enviado por e-mail.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Senha inválida",
        description: "A senha não atende aos requisitos mínimos.",
        variant: "destructive",
      });
      return;
    }

    if (!isMatch) {
      toast({
        title: "Senhas diferentes",
        description: "A confirmação de senha não confere.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: "Senha atualizada",
        description: "Agora você já pode entrar com a nova senha.",
      });
      sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      navigate("/auth");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao atualizar senha",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="space-y-1 text-center mb-6">
          <h1 className="text-2xl font-semibold">Redefinir senha</h1>
          <p className="text-sm text-muted-foreground">
            Crie uma nova senha para sua conta.
          </p>
        </div>

        {recoveryInfo.hasError && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {recoveryInfo.message}
          </div>
        )}

        {!recoveryInfo.hasError && !canReset && (
          <div className="mb-4 rounded-lg border border-muted/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Abra esta página a partir do link enviado por e-mail.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                className="pl-10"
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {password && (
              <div className="space-y-1">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      requirementsMet <= 1
                        ? "bg-destructive"
                        : requirementsMet <= 3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${(requirementsMet / 5) * 100}%` }}
                  />
                </div>
                <p
                  className={`text-xs ${
                    requirementsMet <= 1
                      ? "text-destructive"
                      : requirementsMet <= 3
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {requirementsMet <= 1 ? "Fraca" : requirementsMet <= 3 ? "Média" : "Forte"}
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              className="pl-10"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button disabled={submitDisabled} className="w-full">
            {loading ? "Carregando..." : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;


