import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import ParticleField from "@/components/ParticleField";
import SoundWaveVisualization from "@/components/SoundWaveVisualization";

export type RobotState = "idle" | "listening" | "thinking" | "speaking" | "processing" | "error";
export type EmotionalState = "neutral" | "happy" | "thinking" | "confused" | "surprised";

interface CustomRobotFaceProps {
  isConnected: boolean;
  isSpeaking: boolean;
  robotState: RobotState;
  audioLevel?: number;
  frequency?: number;
  emotionalState?: EmotionalState;
  onTouch?: () => void;
}

const CustomRobotFace = ({ 
  isConnected, 
  isSpeaking, 
  robotState, 
  audioLevel = 0, 
  frequency = 0,
  emotionalState = "neutral",
  onTouch
}: CustomRobotFaceProps) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [idleEyePosition, setIdleEyePosition] = useState({ x: 0, y: 0 });
  const [isTrackingCursor, setIsTrackingCursor] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [touchReaction, setTouchReaction] = useState({ rotateZ: 0, rotateY: 0, rotateX: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseMoveTime = useRef(Date.now());

  // Natural blinking effect
  useEffect(() => {
    if (!isConnected) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      const blinkDuration = Math.random() * 50 + 100;
      setTimeout(() => setIsBlinking(false), blinkDuration);
    }, Math.random() * 2000 + 2500);

    return () => clearInterval(blinkInterval);
  }, [isConnected]);

  // Eye tracking - follows cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      lastMouseMoveTime.current = Date.now();
      setIsTrackingCursor(true);

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const maxRange = 15;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const limitedDistance = Math.min(distance, 200);
      
      const normalizedX = (deltaX / distance) * (limitedDistance / 200) * maxRange;
      const normalizedY = (deltaY / distance) * (limitedDistance / 200) * maxRange;

      setEyePosition({
        x: normalizedX || 0,
        y: normalizedY || 0,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Idle eye movement
  useEffect(() => {
    const idleInterval = setInterval(() => {
      const timeSinceLastMove = Date.now() - lastMouseMoveTime.current;
      
      if (timeSinceLastMove > 2000) {
        setIsTrackingCursor(false);
        setIdleEyePosition({
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 8,
        });
      }
    }, 3000);

    return () => clearInterval(idleInterval);
  }, []);

  // Touch interaction
  const handleTouch = () => {
    if (!isConnected) return;
    
    setIsTouched(true);
    onTouch?.();
    
    const randomRotations = [
      { rotateZ: 15, rotateY: 10, rotateX: -5 },
      { rotateZ: -15, rotateY: -10, rotateX: 5 },
      { rotateZ: 10, rotateY: -8, rotateX: 8 },
      { rotateZ: -12, rotateY: 12, rotateX: -8 },
    ];
    
    const randomReaction = randomRotations[Math.floor(Math.random() * randomRotations.length)];
    setTouchReaction(randomReaction);
    
    const randomEyeMovement = {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 15,
    };
    setEyePosition(randomEyeMovement);
    
    setTimeout(() => {
      setIsTouched(false);
      setTouchReaction({ rotateZ: 0, rotateY: 0, rotateX: 0 });
    }, 800);
  };

  const finalEyePosition = isTrackingCursor ? eyePosition : idleEyePosition;
  
  // Enhanced lip sync with MUCH more dynamic scaling for visibility
  const amplifiedAudioLevel = Math.min(audioLevel * 3, 1);
  const lipSyncScale = isSpeaking ? 1 + amplifiedAudioLevel * 2 : 1;
  const jawOpenness = isSpeaking ? amplifiedAudioLevel * 2.5 : 0;

  const getStateColor = () => {
    switch (robotState) {
      case "error":
        return "hsl(0 100% 50%)";
      case "thinking":
      case "processing":
        return "hsl(45 100% 50%)";
      case "listening":
        return "hsl(150 100% 50%)";
      case "speaking":
        return "hsl(180 100% 50%)";
      default:
        return "hsl(220 13% 50%)";
    }
  };

  const getStateBorder = () => {
    const color = getStateColor();
    return isConnected
      ? `0 0 60px ${color.replace("50%)", "40%)")}, inset 0 0 40px ${color.replace("50%)", "10%)")}`
      : "0 10px 40px hsl(222 47% 4% / 0.6)";
  };

  // Head movements based on speech patterns, emotional state, and touch
  const getHeadRotation = () => {
    if (isTouched) {
      return touchReaction;
    }
    
    if (isSpeaking) {
      const intensityMultiplier = audioLevel > 0.3 ? 1.5 : 1;
      return {
        rotateZ: Math.sin(frequency * 4) * audioLevel * 5 * intensityMultiplier,
        rotateY: Math.cos(frequency * 3) * audioLevel * 4 * intensityMultiplier,
        rotateX: Math.sin(frequency * 2) * audioLevel * 3 * intensityMultiplier,
      };
    }
    
    switch (emotionalState) {
      case "thinking":
        return { rotateZ: -8, rotateY: 5, rotateX: -3 };
      case "confused":
        return { rotateZ: 12, rotateY: -8, rotateX: 3 };
      case "surprised":
        return { rotateZ: 0, rotateY: 0, rotateX: -8 };
      case "happy":
        return { rotateZ: 5, rotateY: 3, rotateX: 2 };
      default:
        return { rotateZ: 0, rotateY: 0, rotateX: 0 };
    }
  };

  const headRotation = getHeadRotation();

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full h-full">
      {/* 3D Sound Wave Visualization */}
      <SoundWaveVisualization
        audioLevel={audioLevel}
        frequency={frequency}
        isSpeaking={isSpeaking}
        robotState={robotState}
      />
      
      {/* 3D Particle Field */}
      <ParticleField 
        isSpeaking={isSpeaking}
        isProcessing={robotState === "processing"}
        robotState={robotState}
        isConnected={isConnected}
      />

      {/* Main robot container */}
      <motion.div
        className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={handleTouch}
        whileHover={isConnected ? { scale: 1.02 } : {}}
        whileTap={isConnected ? { scale: 0.98 } : {}}
        style={{
          background: 'radial-gradient(circle at center, hsl(222 40% 12%), hsl(222 47% 8%))',
          boxShadow: getStateBorder(),
        }}
        animate={{
          scale: isSpeaking ? [1, 1.02, 1] : robotState === "thinking" ? [1, 1.01, 1] : 1,
          rotateZ: headRotation.rotateZ,
          rotateY: headRotation.rotateY,
          rotateX: headRotation.rotateX,
          y: isSpeaking ? [-2, 2, -2] : 0,
        }}
        transition={{
          scale: {
            duration: 0.8,
            repeat: isSpeaking || robotState === "thinking" ? Infinity : 0,
          },
          rotateZ: { duration: 0.5, ease: "easeOut" },
          rotateY: { duration: 0.5, ease: "easeOut" },
          rotateX: { duration: 0.5, ease: "easeOut" },
          y: {
            duration: 1.5,
            repeat: isSpeaking ? Infinity : 0,
            ease: "easeInOut",
          },
        }}
      >
        {/* SVG Robot Face */}
        <motion.div
          className="w-full h-full"
          animate={{
            y: isConnected ? [0, -5, 0] : 0,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 30px rgba(0,0,0,0.5))" }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(220 25% 30%)", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "hsl(220 22% 20%)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(220 25% 12%)", stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="glossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "white", stopOpacity: 0.4 }} />
          <stop offset="50%" style={{ stopColor: "white", stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: "white", stopOpacity: 0 }} />
        </linearGradient>

        <linearGradient id="eyeSocketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(220 30% 8%)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(220 25% 4%)", stopOpacity: 1 }} />
        </linearGradient>

        <radialGradient id="glowGradient">
          <stop offset="0%" style={{ stopColor: getStateColor(), stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: getStateColor(), stopOpacity: 0 }} />
        </radialGradient>

        {/* Filters */}
        <filter id="innerShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Main Face Structure - Sleek rounded design */}
      <g>
        {/* Face Base */}
        <ellipse
          cx="100"
          cy="110"
          rx="65"
          ry="75"
          fill="url(#faceGradient)"
          stroke={getStateColor()}
          strokeWidth="2.5"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}
        />
        
        {/* Face Gloss Effect */}
        <ellipse
          cx="100"
          cy="90"
          rx="50"
          ry="55"
          fill="url(#glossGradient)"
          opacity="0.3"
        />

        {/* Top Sensor Array */}
        <motion.g
          animate={{
            y: isSpeaking ? [-0.5, 0.5, -0.5] : 0,
          }}
          transition={{
            duration: 0.6,
            repeat: isSpeaking ? Infinity : 0,
          }}
        >
          <rect
            x="80"
            y="45"
            width="40"
            height="8"
            rx="4"
            fill="hsl(220 20% 15%)"
            stroke={getStateColor()}
            strokeWidth="1.5"
          />
          <motion.rect
            x="82"
            y="47"
            width={amplifiedAudioLevel * 36}
            height="4"
            rx="2"
            fill={getStateColor()}
            animate={{
              opacity: isSpeaking ? [0.6, 1, 0.6] : 0.3,
            }}
            transition={{
              duration: 0.5,
              repeat: isSpeaking ? Infinity : 0,
            }}
          />
        </motion.g>

        {/* Antenna */}
        <motion.g
          animate={{
            y: isSpeaking ? [-1, 1, -1] : 0,
          }}
          transition={{
            duration: 0.8,
            repeat: isSpeaking ? Infinity : 0,
          }}
        >
          <line
            x1="100"
            y1="45"
            x2="100"
            y2="28"
            stroke={getStateColor()}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <motion.circle
            cx="100"
            cy="22"
            r="5"
            fill={getStateColor()}
            style={{ filter: `drop-shadow(0 0 8px ${getStateColor()})` }}
            animate={{
              scale: isSpeaking ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
            }}
          />
        </motion.g>

        {/* Side Vents - Sleek Design */}
        <g opacity="0.6">
          <rect x="40" y="95" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
          <rect x="40" y="100" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
          <rect x="40" y="105" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
          <rect x="40" y="110" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
          
          <rect x="148" y="95" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
          <rect x="148" y="100" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
          <rect x="148" y="105" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
          <rect x="148" y="110" width="12" height="2" rx="1" fill={getStateColor()} opacity="0.5" />
        </g>

        {/* Eye Sockets - Deeper and more defined */}
        <ellipse cx="75" cy="95" rx="18" ry="16" fill="url(#eyeSocketGradient)" filter="url(#innerShadow)" />
        <ellipse cx="125" cy="95" rx="18" ry="16" fill="url(#eyeSocketGradient)" filter="url(#innerShadow)" />
        
        {/* Eye Socket Rims */}
        <ellipse cx="75" cy="95" rx="18" ry="16" fill="none" stroke={getStateColor()} strokeWidth="1" opacity="0.4" />
        <ellipse cx="125" cy="95" rx="18" ry="16" fill="none" stroke={getStateColor()} strokeWidth="1" opacity="0.4" />

        {/* Eyes - Enhanced with glow */}
        {!isBlinking && (
          <>
            <motion.g
              animate={{
                x: finalEyePosition.x,
                y: finalEyePosition.y,
                scale: emotionalState === "surprised" ? 1.4 : emotionalState === "happy" ? 1.15 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Left Eye Glow */}
              <circle
                cx="75"
                cy="95"
                r="15"
                fill="url(#glowGradient)"
              />
              {/* Left Eye */}
              <circle
                cx="75"
                cy="95"
                r={emotionalState === "surprised" ? "10" : emotionalState === "thinking" ? "6" : "7"}
                fill={getStateColor()}
                style={{ filter: `drop-shadow(0 0 12px ${getStateColor()})` }}
              />
              {/* Left Eye Core */}
              <circle
                cx="75"
                cy="95"
                r={emotionalState === "surprised" ? "6" : emotionalState === "thinking" ? "3" : "4"}
                fill="white"
                opacity="0.9"
              />
              {/* Left Eye Highlight */}
              <circle
                cx="73"
                cy="92"
                r="2.5"
                fill="white"
                opacity="0.8"
              />
            </motion.g>
            
            <motion.g
              animate={{
                x: finalEyePosition.x,
                y: finalEyePosition.y,
                scale: emotionalState === "surprised" ? 1.4 : emotionalState === "happy" ? 1.15 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Right Eye Glow */}
              <circle
                cx="125"
                cy="95"
                r="15"
                fill="url(#glowGradient)"
              />
              {/* Right Eye */}
              <circle
                cx="125"
                cy="95"
                r={emotionalState === "surprised" ? "10" : emotionalState === "thinking" ? "6" : "7"}
                fill={getStateColor()}
                style={{ filter: `drop-shadow(0 0 12px ${getStateColor()})` }}
              />
              {/* Right Eye Core */}
              <circle
                cx="125"
                cy="95"
                r={emotionalState === "surprised" ? "6" : emotionalState === "thinking" ? "3" : "4"}
                fill="white"
                opacity="0.9"
              />
              {/* Right Eye Highlight */}
              <circle
                cx="123"
                cy="92"
                r="2.5"
                fill="white"
                opacity="0.8"
              />
            </motion.g>
          </>
        )}

        {/* Blinking Animation */}
        {isBlinking && (
          <>
            <motion.ellipse
              cx="75"
              cy="95"
              rx="18"
              ry="2"
              fill="hsl(220 25% 25%)"
              initial={{ ry: 16 }}
              animate={{ ry: 2 }}
              transition={{ duration: 0.08 }}
            />
            <motion.ellipse
              cx="125"
              cy="95"
              rx="18"
              ry="2"
              fill="hsl(220 25% 25%)"
              initial={{ ry: 16 }}
              animate={{ ry: 2 }}
              transition={{ duration: 0.08 }}
            />
          </>
        )}

        {/* Eyebrows - Dynamic Expressions */}
        {emotionalState === "thinking" && (
          <>
            <motion.path
              d="M 60 80 Q 67 75, 75 76 Q 83 77, 90 82"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              animate={{ 
                d: [
                  "M 60 80 Q 67 75, 75 76 Q 83 77, 90 82",
                  "M 60 78 Q 67 73, 75 74 Q 83 75, 90 80",
                  "M 60 80 Q 67 75, 75 76 Q 83 77, 90 82"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
              d="M 110 82 Q 117 77, 125 76 Q 133 75, 140 80"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              animate={{ 
                d: [
                  "M 110 82 Q 117 77, 125 76 Q 133 75, 140 80",
                  "M 110 80 Q 117 75, 125 74 Q 133 73, 140 78",
                  "M 110 82 Q 117 77, 125 76 Q 133 75, 140 80"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}

        {emotionalState === "confused" && (
          <>
            <motion.path
              d="M 60 75 Q 67 78, 75 80 Q 83 82, 90 83"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              animate={{ 
                d: [
                  "M 60 75 Q 67 78, 75 80 Q 83 82, 90 83",
                  "M 60 77 Q 67 80, 75 82 Q 83 84, 90 85",
                  "M 60 75 Q 67 78, 75 80 Q 83 82, 90 83"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.path
              d="M 110 83 Q 117 82, 125 80 Q 133 78, 140 76"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              animate={{ 
                d: [
                  "M 110 83 Q 117 82, 125 80 Q 133 78, 140 76",
                  "M 110 85 Q 117 84, 125 82 Q 133 80, 140 78",
                  "M 110 83 Q 117 82, 125 80 Q 133 78, 140 76"
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </>
        )}

        {emotionalState === "surprised" && (
          <>
            <motion.path
              d="M 58 75 Q 67 73, 75 73 Q 83 73, 92 75"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
              animate={{ y: [-2, 0, -2] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.path
              d="M 108 75 Q 117 73, 125 73 Q 133 73, 142 75"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
              animate={{ y: [-2, 0, -2] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </>
        )}

        {emotionalState === "happy" && (
          <>
            <motion.path
              d="M 58 82 Q 67 77, 75 76 Q 83 77, 92 82"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
            <motion.path
              d="M 108 82 Q 117 77, 125 76 Q 133 77, 142 82"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
          </>
        )}

        {/* Nose/Sensor */}
        <ellipse
          cx="100"
          cy="115"
          rx="3"
          ry="4"
          fill={getStateColor()}
          opacity="0.6"
          style={{ filter: `drop-shadow(0 0 4px ${getStateColor()})` }}
        />

        {/* MOUTH AREA - Sophisticated Design */}
        <g>
          {/* Happy Mouth */}
          {emotionalState === "happy" && !isSpeaking && (
            <g>
              <motion.path
                d="M 70 135 Q 85 145, 100 147 Q 115 145, 130 135"
                stroke={getStateColor()}
                strokeWidth="4"
                fill="hsl(220 20% 8%)"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              {/* Teeth */}
              <line x1="85" y1="142" x2="115" y2="142" stroke="hsl(220 10% 70%)" strokeWidth="2.5" opacity="0.6" />
              {/* Smile dimples */}
              <circle cx="70" cy="133" r="2" fill={getStateColor()} opacity="0.5" />
              <circle cx="130" cy="133" r="2" fill={getStateColor()} opacity="0.5" />
            </g>
          )}

          {/* Confused Mouth */}
          {emotionalState === "confused" && !isSpeaking && (
            <motion.path
              d="M 75 140 Q 85 135, 100 137 Q 115 139, 125 138"
              stroke={getStateColor()}
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              animate={{
                d: [
                  "M 75 140 Q 85 135, 100 137 Q 115 139, 125 138",
                  "M 75 140 Q 85 137, 100 138 Q 115 137, 125 138",
                  "M 75 140 Q 85 135, 100 137 Q 115 139, 125 138"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Surprised Mouth */}
          {emotionalState === "surprised" && !isSpeaking && (
            <g>
              <motion.ellipse
                cx="100"
                cy="142"
                rx="12"
                ry="16"
                fill="hsl(220 20% 5%)"
                stroke={getStateColor()}
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [1, 1.08, 1],
                  ry: [16, 18, 16]
                }}
                transition={{ 
                  scale: { duration: 0.3 },
                  ry: { duration: 0.6, repeat: Infinity }
                }}
              />
              {/* Inner glow */}
              <ellipse
                cx="100"
                cy="144"
                rx="8"
                ry="10"
                fill={getStateColor()}
                opacity="0.3"
              />
            </g>
          )}

          {/* Thinking Mouth */}
          {emotionalState === "thinking" && !isSpeaking && (
            <motion.path
              d="M 78 140 L 105 138"
              stroke={getStateColor()}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.75"
            />
          )}

          {/* Neutral Mouth */}
          {emotionalState === "neutral" && !isSpeaking && (
            <path
              d="M 80 140 Q 100 142, 120 140"
              stroke={getStateColor()}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}

          {/* SPEAKING MOUTH - Advanced Lip Sync */}
          {isSpeaking && (
            <g>
              {/* Mouth cavity */}
              <motion.ellipse
                cx="100"
                cy={142 + jawOpenness * 12}
                rx={18 + amplifiedAudioLevel * 20}
                ry={10 + amplifiedAudioLevel * 25}
                fill="hsl(220 20% 4%)"
                stroke={getStateColor()}
                strokeWidth="2.5"
                style={{
                  filter: `drop-shadow(0 0 10px ${getStateColor()})`
                }}
                animate={{
                  ry: 10 + amplifiedAudioLevel * 25,
                  rx: 18 + amplifiedAudioLevel * 20,
                  cy: 142 + jawOpenness * 12,
                }}
                transition={{
                  duration: 0.04,
                  ease: "linear",
                }}
              />

              {/* Upper Lip */}
              <motion.path
                d={`M ${72 - amplifiedAudioLevel * 10} ${135 - jawOpenness * 4} 
                    Q ${86 - amplifiedAudioLevel * 5} ${132 - jawOpenness * 5}, 
                    100 ${132 - jawOpenness * 5}
                    Q ${114 + amplifiedAudioLevel * 5} ${132 - jawOpenness * 5}, 
                    ${128 + amplifiedAudioLevel * 10} ${135 - jawOpenness * 4}`}
                stroke={getStateColor()}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
                animate={{
                  d: `M ${72 - amplifiedAudioLevel * 10} ${135 - jawOpenness * 4} 
                      Q ${86 - amplifiedAudioLevel * 5} ${132 - jawOpenness * 5}, 
                      100 ${132 - jawOpenness * 5}
                      Q ${114 + amplifiedAudioLevel * 5} ${132 - jawOpenness * 5}, 
                      ${128 + amplifiedAudioLevel * 10} ${135 - jawOpenness * 4}`
                }}
                transition={{
                  duration: 0.04,
                  ease: "linear",
                }}
              />

              {/* Lower Lip */}
              <motion.path
                d={`M ${72 - amplifiedAudioLevel * 10} ${149 + jawOpenness * 10} 
                    Q ${86 - amplifiedAudioLevel * 5} ${152 + jawOpenness * 12}, 
                    100 ${152 + jawOpenness * 12}
                    Q ${114 + amplifiedAudioLevel * 5} ${152 + jawOpenness * 12}, 
                    ${128 + amplifiedAudioLevel * 10} ${149 + jawOpenness * 10}`}
                stroke={getStateColor()}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
                animate={{
                  d: `M ${72 - amplifiedAudioLevel * 10} ${149 + jawOpenness * 10} 
                      Q ${86 - amplifiedAudioLevel * 5} ${152 + jawOpenness * 12}, 
                      100 ${152 + jawOpenness * 12}
                      Q ${114 + amplifiedAudioLevel * 5} ${152 + jawOpenness * 12}, 
                      ${128 + amplifiedAudioLevel * 10} ${149 + jawOpenness * 10}`
                }}
                transition={{
                  duration: 0.04,
                  ease: "linear",
                }}
              />

              {/* Teeth - Visible when mouth is open enough */}
              {amplifiedAudioLevel > 0.2 && (
                <>
                  <motion.line
                    x1={100 - (10 + amplifiedAudioLevel * 12)}
                    y1={138 + jawOpenness * 5}
                    x2={100 + (10 + amplifiedAudioLevel * 12)}
                    y2={138 + jawOpenness * 5}
                    stroke="hsl(220 10% 80%)"
                    strokeWidth="2.5"
                    opacity={0.6 + amplifiedAudioLevel * 0.3}
                    strokeLinecap="round"
                    animate={{
                      x1: 100 - (10 + amplifiedAudioLevel * 12),
                      x2: 100 + (10 + amplifiedAudioLevel * 12),
                      y1: 138 + jawOpenness * 5,
                      y2: 138 + jawOpenness * 5,
                    }}
                    transition={{
                      duration: 0.04,
                      ease: "linear",
                    }}
                  />
                  {/* Individual teeth for detail */}
                  {amplifiedAudioLevel > 0.4 && (
                    <g opacity="0.4">
                      <line x1="95" y1={136 + jawOpenness * 5} x2="95" y2={140 + jawOpenness * 5} stroke="hsl(220 10% 70%)" strokeWidth="1.5" />
                      <line x1="100" y1={136 + jawOpenness * 5} x2="100" y2={140 + jawOpenness * 5} stroke="hsl(220 10% 70%)" strokeWidth="1.5" />
                      <line x1="105" y1={136 + jawOpenness * 5} x2="105" y2={140 + jawOpenness * 5} stroke="hsl(220 10% 70%)" strokeWidth="1.5" />
                    </g>
                  )}
                </>
              )}

              {/* Tongue/Inner mouth glow */}
              <motion.ellipse
                cx="100"
                cy={144 + jawOpenness * 10}
                rx={12 + amplifiedAudioLevel * 15}
                ry={6 + amplifiedAudioLevel * 18}
                fill={getStateColor()}
                opacity={0.25 + amplifiedAudioLevel * 0.4}
                animate={{
                  ry: 6 + amplifiedAudioLevel * 18,
                  rx: 12 + amplifiedAudioLevel * 15,
                  cy: 144 + jawOpenness * 10,
                }}
                transition={{
                  duration: 0.04,
                  ease: "linear",
                }}
              />
            </g>
          )}

          {/* Voice Activity Ring */}
          {isSpeaking && (
            <motion.ellipse
              cx="100"
              cy="142"
              rx="30"
              ry="25"
              fill="none"
              stroke={getStateColor()}
              strokeWidth="2"
              opacity="0.3"
              animate={{
                rx: [30, 36, 30],
                ry: [25, 30, 25],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
              }}
            />
          )}
        </g>

        {/* Chin Detail */}
        <ellipse
          cx="100"
          cy="165"
          rx="25"
          ry="8"
          fill="hsl(220 25% 8%)"
          opacity="0.4"
        />
        
        {/* Bottom Accent */}
        <path
          d="M 70 170 Q 100 172, 130 170"
          stroke={getStateColor()}
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
      </g>
    </svg>
        </motion.div>

        {/* State overlay effects */}
        {robotState === "thinking" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        )}

        {robotState === "processing" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-yellow-500/30 via-transparent to-yellow-500/30 rounded-full"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {robotState === "error" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-transparent rounded-full"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          />
        )}

        {isSpeaking && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          />
        )}
      </motion.div>

      {/* Status indicator dot */}
      <motion.div
        className="absolute bottom-4 right-4 md:bottom-8 md:right-8"
        animate={{
          scale: isConnected ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <div className="relative">
          <div
            className={`w-4 h-4 rounded-full ${
              isConnected ? "bg-primary" : "bg-muted-foreground/50"
            }`}
            style={{
              boxShadow: isConnected ? "0 0 20px hsl(var(--primary))" : "none",
            }}
          />
          {isConnected && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CustomRobotFace;
