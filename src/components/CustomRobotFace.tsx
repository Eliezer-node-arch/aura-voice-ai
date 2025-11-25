import { motion } from "framer-motion";
import { RobotState, EmotionalState } from "./RobotAvatar";

interface CustomRobotFaceProps {
  eyePosition: { x: number; y: number };
  isBlinking: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  emotionalState: EmotionalState;
  robotState: RobotState;
}

const CustomRobotFace = ({
  eyePosition,
  isBlinking,
  isSpeaking,
  audioLevel,
  emotionalState,
  robotState,
}: CustomRobotFaceProps) => {
  // --- LOGIC ---
  // Simple audio normalization
  const effectiveLevel = isSpeaking 
    ? (audioLevel > 0.01 ? Math.max(audioLevel, 0.15) : 0.15) 
    : 0;

  // Design Colors (Flat & Clean)
  const getColors = () => {
    switch (robotState) {
      case "error": return { face: "#1a1a1a", accent: "#ef4444" }; // Red
      case "thinking": return { face: "#1a1a1a", accent: "#fbbf24" }; // Amber
      case "listening": return { face: "#1a1a1a", accent: "#34d399" }; // Emerald
      case "speaking": return { face: "#1a1a1a", accent: "#38bdf8" }; // Sky Blue
      default: return { face: "#1a1a1a", accent: "#94a3b8" }; // Slate
    }
  };

  const colors = getColors();

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* 1. SIMPLE HEAD SHAPE */}
      {/* Background Shadow (Simple soft blur) */}
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#softShadow)">
        {/* Main Face */}
        <rect
          x="30" y="30" width="140" height="140" rx="24"
          fill={colors.face}
          stroke={colors.accent}
          strokeWidth="3"
        />
        
        {/* Subtle Screen Reflection (Simple Curve) */}
        <path d="M 35 50 Q 100 80 165 50" stroke="white" strokeWidth="2" opacity="0.05" fill="none" />
      </g>

      {/* 2. ANTENNA (Simple) */}
      <motion.g animate={{ y: isSpeaking ? -2 : 0 }}>
        <line x1="100" y1="30" x2="100" y2="15" stroke={colors.accent} strokeWidth="3" />
        <circle cx="100" cy="12" r="4" fill={colors.accent} />
      </motion.g>

      {/* 3. EYES (Simple Dots with Parallax) */}
      <g>
         {/* Eye Backgrounds (optional depth) */}
         <rect x="55" y="80" width="30" height="35" rx="12" fill="rgba(0,0,0,0.3)" />
         <rect x="115" y="80" width="30" height="35" rx="12" fill="rgba(0,0,0,0.3)" />

         {!isBlinking && (
            <>
              {/* Left Eye */}
              <motion.circle 
                cx="70" cy="97.5" r="8" fill={colors.accent}
                animate={{ x: eyePosition.x, y: eyePosition.y }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
              />
              {/* Right Eye */}
              <motion.circle 
                cx="130" cy="97.5" r="8" fill={colors.accent}
                animate={{ x: eyePosition.x, y: eyePosition.y }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
              />
            </>
         )}

         {/* Blink State */}
         {isBlinking && (
            <>
              <line x1="60" y1="97.5" x2="80" y2="97.5" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" />
              <line x1="120" y1="97.5" x2="140" y2="97.5" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" />
            </>
         )}
      </g>

      {/* 4. MOUTH (The Lightweight Solution) */}
      {/* Instead of complex shapes, we use a single elastic Rectangle */}
      <g transform="translate(100, 145)">
         {!isSpeaking ? (
            // Static Mouth (Neutral/Happy)
            <motion.path 
              d={emotionalState === "happy" ? "M -20 -2 Q 0 8 20 -2" : "M -15 0 L 15 0"}
              stroke={colors.accent} strokeWidth="3" fill="none" strokeLinecap="round"
              animate={{ d: emotionalState === "happy" ? "M -20 -2 Q 0 8 20 -2" : "M -15 0 L 15 0" }}
            />
         ) : (
            // Speaking Mouth (Elastic Rectangle)
            // It simply grows in width/height based on volume
            <motion.rect
               fill={colors.accent}
               rx="8" // Rounded corners
               animate={{
                 width: 20 + effectiveLevel * 50,  // Grows wider
                 height: 4 + effectiveLevel * 40,  // Grows taller
                 x: -(20 + effectiveLevel * 50) / 2, // Keeps centered X
                 y: -(4 + effectiveLevel * 40) / 2,  // Keeps centered Y
               }}
               transition={{
                 duration: 0.05, // Fast response
                 ease: "linear"
               }}
            />
         )}
      </g>

      {/* 5. LOADING/THINKING INDICATOR (Simple dots at bottom) */}
      {(robotState === "processing" || robotState === "thinking") && (
         <g fill={colors.accent} opacity="0.8">
            <motion.circle cx="85" cy="170" r="2" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
            <motion.circle cx="100" cy="170" r="2" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.circle cx="115" cy="170" r="2" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
         </g>
      )}
    </svg>
  );
};

export default CustomRobotFace;