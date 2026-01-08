
import React, { useEffect, useState } from 'react';

const PARTICLE_COUNT = 30; // Per side

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  delay: number;
  emoji: string;
}

const EMOJIS = ['🎉', '✨', '⭐', '🎊', '🎈'];

const createParticles = (side: 'left' | 'right', offset: number): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
    id: offset + i, // Add offset to ensure unique IDs
    x: side === 'left' ? 0 : 100, // Percentage from left
    y: 100, // Percentage from top (bottom)
    angle: side === 'left' 
      ? -45 - Math.random() * 45 // -45 to -90 deg (Up-Right)
      : -135 + Math.random() * 45, // -135 to -90 deg (Up-Left)
    velocity: 15 + Math.random() * 15,
    delay: Math.random() * 0.2,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  }));
};

export const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles([
      ...createParticles('left', 0), 
      ...createParticles('right', PARTICLE_COUNT) // Offset the IDs for the second batch
    ]);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes confetti-shoot {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => {
        const rad = p.angle * (Math.PI / 180);
        // Distance calculation for translation
        const dist = 50 + Math.random() * 30; // Viewport height percentage
        const tx = Math.cos(rad) * (dist * (window.innerWidth / window.innerHeight)); // Aspect ratio correction
        const ty = Math.sin(rad) * dist;
        const rot = Math.random() * 360 * 2;

        return (
          <div
            key={p.id}
            className="absolute text-2xl sm:text-4xl will-change-transform"
            style={{
              left: p.x + '%',
              top: p.y + '%',
              // Custom properties for keyframes
              // @ts-ignore
              '--tx': `${tx}vh`,
              '--ty': `${ty}vh`,
              '--rot': `${rot}deg`,
              animation: `confetti-shoot 2s ease-out forwards ${p.delay}s`
            }}
          >
            {p.emoji}
          </div>
        );
      })}
    </div>
  );
};
