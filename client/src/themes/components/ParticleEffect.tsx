// ============================================
// Particle Effects Component
// Stars, lanterns, and other floating elements
// ============================================

import { useEffect, useRef } from "react";
import type { ThemeConfig } from "../types";

interface ParticleEffectProps {
  theme: ThemeConfig;
  type?: "stars" | "lanterns" | "snow" | "leaves";
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkle?: number;
}

export function ParticleEffect({ theme, type = "stars" }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enabled = theme.animation.enableParticles;

  useEffect(() => {
    // Don't run animation if disabled
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const particleCount = type === "stars" ? 100 : 30;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size:
          type === "stars" ? Math.random() * 2 + 0.5 : Math.random() * 20 + 10,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    // Animation loop
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update twinkle
        particle.twinkle = (particle.twinkle || 0) + 0.02;
        const twinkleOpacity =
          particle.opacity * (0.5 + 0.5 * Math.sin(particle.twinkle));

        if (type === "stars") {
          // Draw star
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkleOpacity})`;
          ctx.fill();

          // Star glow
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 2,
          );
          gradient.addColorStop(
            0,
            `rgba(255, 255, 255, ${twinkleOpacity * 0.3})`,
          );
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (type === "lanterns") {
          // Draw lantern (simple glow circle)
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size,
          );
          gradient.addColorStop(0, `rgba(255, 180, 50, ${twinkleOpacity})`);
          gradient.addColorStop(
            0.5,
            `rgba(255, 120, 30, ${twinkleOpacity * 0.5})`,
          );
          gradient.addColorStop(1, "rgba(255, 100, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(
            particle.x - particle.size,
            particle.y - particle.size,
            particle.size * 2,
            particle.size * 2,
          );
        }

        // Move particle slowly upward (for lanterns) or twinkle in place (for stars)
        if (type === "lanterns") {
          particle.y -= particle.speed;
          particle.x += Math.sin(particle.twinkle) * 0.3;

          // Reset if off screen
          if (particle.y < -particle.size) {
            particle.y = canvas.height + particle.size;
            particle.x = Math.random() * canvas.width;
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [type, enabled]);

  // Don't render if particles disabled
  if (!enabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}

export default ParticleEffect;
