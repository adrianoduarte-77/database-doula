import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

const TOAST_DURATION = 2000; // 2 seconds - must match TOAST_AUTO_DISMISS_DELAY

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1 w-full">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
            {/* Progress bar that animates from full to empty */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30 overflow-hidden">
              <div 
                className="h-full bg-primary/70 animate-toast-progress origin-left"
                style={{
                  animation: `toast-progress ${TOAST_DURATION}ms linear forwards`
                }}
              />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
