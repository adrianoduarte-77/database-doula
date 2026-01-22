import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, ChevronRight } from "lucide-react";
import { MentorAvatar } from "@/components/MentorAvatar";

interface GiftModalProps {
  open: boolean;
  onOpenGift: () => void;
}

const GiftModal = ({ open, onOpenGift }: GiftModalProps) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenGift = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpenGift();
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 border-0 bg-transparent shadow-none [&>button]:hidden overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {!isOpening ? (
            <motion.div
              key="gift-content"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative"
            >
              {/* Sparkle effects */}
              <div className="absolute -inset-4 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Gift icon with animation */}
                  <motion.div
                    className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center"
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [-2, 2, -2],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Gift className="w-10 h-10 text-primary" />
                  </motion.div>

                  {/* Mentor info */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <MentorAvatar size="sm" />
                    <span className="text-sm text-muted-foreground">Duarte tem um presente para você!</span>
                  </div>

                  {/* Title */}
                  <motion.h2
                    className="text-2xl font-display font-bold text-foreground mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Você recebeu um <span className="text-gradient">Presente Especial</span>! 🎁
                  </motion.h2>

                  <motion.p
                    className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Uma trilha de desenvolvimento personalizada foi preparada exclusivamente para você.
                  </motion.p>

                  {/* Open gift button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={handleOpenGift}
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-6 rounded-xl text-base group"
                    >
                      <Gift className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                      Abrir Presente
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.5, 0],
                  rotate: [0, 180, 360],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Gift className="w-16 h-16 text-primary" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default GiftModal;
