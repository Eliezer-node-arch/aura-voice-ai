import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
// Removed ParticleField and SoundWave imports for simplicity
import CustomRobotFace from "@/components/CustomRobotFace";

export type RobotState = "idle" | "listening" | "thinking" | "speaking" | "processing" | "error";
export type EmotionalState = "neutral" | "happy" | "thinking" | "confused" | "surprised";

interface RobotAvatarProps {
  isConnected: boolean;
  isSpeaking: boolean;
  robotState: RobotState;
  audioLevel?: number;
  emotionalState?: EmotionalState;
  onTouch?: () => void;
}

const RobotAvatar = ({ 
  isConnected, 
  isSpeaking, 
  robotState, 
  audioLevel = 0, 
  emotionalState = "neutral",
  onTouch
}: RobotAvatarProps) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isTrackingCursor, setIsTrackingCursor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseMoveTime = useRef(Date.now());

  // Blink Interval
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Mouse Tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      lastMouseMoveTime.current = Date.now();
      setIsTrackingCursor(true);
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate normalized position (-10 to 10)
      const x = Math.min(Math.max((e.clientX - (rect.left + rect.width / 2)) / 15, -10), 10);
      const y = Math.min(Math.max((e.clientY - (rect.top + rect.height / 2)) / 15, -10), 10);
      setEyePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Idle Reset
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMouseMoveTime.current > 2000 && isTrackingCursor) {
        setIsTrackingCursor(false);
        setEyePosition({ x: 0, y: 0 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isTrackingCursor]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full h-full">
      {/* Main Avatar Container
         - No 3D perspective
         - Simple Hover Scale
         - Gentle "Breathing" Y-axis animation
      */}
      <motion.div
        className="w-48 h-48 md:w-64 md:h-64 cursor-pointer"
        onClick={onTouch}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: isSpeaking ? [0, -5, 0] : [0, -3, 0], // Gentle float
        }}
        transition={{
          y: { duration: isSpeaking ? 0.5 : 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <CustomRobotFace
          eyePosition={eyePosition}
          isBlinking={isBlinking}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          emotionalState={emotionalState}
          robotState={robotState}
        />
      </motion.div>

      {/* Simple Connection Dot (Bottom Center) */}
      <div className="absolute bottom-4 flex flex-col items-center gap-2">
         <motion.div 
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-500"}`}
            animate={{ opacity: isConnected ? 1 : [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
         />
      </div>
    </div>
  );
};

export default RobotAvatar;