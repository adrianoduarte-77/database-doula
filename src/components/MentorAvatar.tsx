import { useMentorImageReady, mentorPhoto } from "@/hooks/useMentorImageReady";

interface MentorAvatarProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
  xxl: "w-24 h-24",
};

export function MentorAvatar({ 
  size = "md", 
  className = "",
  showBorder = true 
}: MentorAvatarProps) {
  const imageReady = useMentorImageReady();

  return (
    <div 
      className={`
        relative rounded-full overflow-hidden flex-shrink-0
        ${sizeClasses[size] || sizeClasses.md}
        ${showBorder ? "border-2 border-primary/30" : ""}
        ${className}
      `}
    >
      {/* Only render image when ready - no flash */}
      {imageReady && (
        <img
          src={mentorPhoto}
          alt="Mentor Duarte"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

// Re-export the hook for components that need to wait for the image
export { useMentorImageReady } from "@/hooks/useMentorImageReady";
