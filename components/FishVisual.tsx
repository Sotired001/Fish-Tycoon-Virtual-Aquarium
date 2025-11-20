import React, { useMemo } from 'react';
import { FishGenes } from '../types';

interface FishVisualProps {
  genes: FishGenes;
  size?: number;
  className?: string;
}

const FishVisual: React.FC<FishVisualProps> = ({ genes, size = 60, className }) => {
  const { bodyColor, finColor, finShape, pattern, patternColor } = genes;

  // Fin Shape Paths
  const tailPath = useMemo(() => {
    switch (finShape) {
      case 'FORKED': return "M-15,0 L-25,-10 L-20,0 L-25,10 Z";
      case 'ROUND': return "M-15,0 Q-25,-10 -25,0 Q-25,10 -15,0";
      case 'TRIANGLE': default: return "M-15,0 L-25,-10 L-25,10 Z";
    }
  }, [finShape]);

  // Add gradients for more depth
  const gradientId = useMemo(() => `fishGrad_${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg width={size} height={size} viewBox="-30 -20 60 40" className={className} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Tail */}
      <path d={tailPath} fill={finColor} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      
      {/* Top Fin */}
      <path d="M0,-10 Q5,-20 10,-10 Z" fill={finColor} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />

      {/* Body */}
      <ellipse cx="0" cy="0" rx="15" ry="10" fill={bodyColor} />
      
      {/* Body Highlight Overlay */}
      <ellipse cx="0" cy="0" rx="15" ry="10" fill={`url(#${gradientId})`} />

      {/* Pattern */}
      {pattern === 'STRIPED' && (
        <g stroke={patternColor} strokeWidth="2" opacity="0.8">
          <path d="M-5,-9 Q-2,0 -5,9" fill="none" />
          <path d="M0,-10 Q3,0 0,10" fill="none" />
          <path d="M5,-9 Q8,0 5,9" fill="none" />
        </g>
      )}
      {pattern === 'SPOTTED' && (
        <g fill={patternColor} opacity="0.8">
          <circle cx="-8" cy="-3" r="1.5" />
          <circle cx="-2" cy="4" r="2" />
          <circle cx="5" cy="-4" r="1.8" />
          <circle cx="8" cy="2" r="1.5" />
        </g>
      )}

      {/* Eye */}
      <circle cx="8" cy="-3" r="2.5" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      <circle cx="9" cy="-3" r="1.2" fill="black" />
      <circle cx="9.5" cy="-3.5" r="0.5" fill="white" /> {/* Eye sparkle */}
      
      {/* Side Fin (Pectoral) */}
      <path d="M2,2 Q6,5 2,8" fill={finColor} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" opacity="0.9" />
      
      {/* Mouth */}
      <path d="M13,1 Q14,2 13,3" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" fill="none" />

    </svg>
  );
};

export default FishVisual;