import { useState, useEffect } from "react";
import mentorPhoto from "@/assets/mentor-photo.png";

// Preload the image globally when module loads
const preloadedImage = new Image();
preloadedImage.src = mentorPhoto;

// Track global load state
let globalImageLoaded = preloadedImage.complete && preloadedImage.naturalHeight !== 0;
const loadListeners: Array<() => void> = [];

if (!globalImageLoaded) {
  preloadedImage.onload = () => {
    globalImageLoaded = true;
    loadListeners.forEach(cb => cb());
    loadListeners.length = 0;
  };
}

/**
 * Hook that returns true when the mentor image is fully loaded and ready.
 * Use this to delay rendering content that includes the mentor avatar.
 */
export function useMentorImageReady(): boolean {
  const [isReady, setIsReady] = useState(globalImageLoaded);

  useEffect(() => {
    if (globalImageLoaded) {
      setIsReady(true);
      return;
    }
    
    const handleLoad = () => setIsReady(true);
    loadListeners.push(handleLoad);
    
    return () => {
      const idx = loadListeners.indexOf(handleLoad);
      if (idx > -1) loadListeners.splice(idx, 1);
    };
  }, []);

  return isReady;
}

export { mentorPhoto, globalImageLoaded };
