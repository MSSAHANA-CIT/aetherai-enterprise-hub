import { useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>, enabled: boolean) {
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(40, Math.floor((canvas.width * canvas.height) / 25000));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();
      }

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [canvasRef, enabled]);
}

export default function OtpBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  useParticles(canvasRef, !reducedMotion);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotion) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY, reducedMotion]
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050508]" onMouseMove={handleMouseMove}>
      {/* Aurora gradient mesh */}
      <motion.div
        className="absolute inset-0"
        animate={
          reducedMotion
            ? undefined
            : {
                background: [
                  "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.35) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(139,92,246,0.25) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(59,130,246,0.15) 0%, transparent 50%), #050508",
                  "radial-gradient(ellipse 70% 55% at 70% 15%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(ellipse 55% 45% at 25% 30%, rgba(168,85,247,0.28) 0%, transparent 50%), radial-gradient(ellipse 45% 35% at 60% 75%, rgba(79,70,229,0.18) 0%, transparent 50%), #050508",
                  "radial-gradient(ellipse 75% 50% at 40% 20%, rgba(139,92,246,0.32) 0%, transparent 50%), radial-gradient(ellipse 60% 55% at 85% 60%, rgba(99,102,241,0.22) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 15% 70%, rgba(59,130,246,0.12) 0%, transparent 50%), #050508",
                  "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.35) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(139,92,246,0.25) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(59,130,246,0.15) 0%, transparent 50%), #050508",
                ],
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* Moving mesh overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ x: springX, y: springY }}
        animate={
          reducedMotion
            ? undefined
            : {
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }
        }
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* Floating blur orbs */}
      {[
        { className: "w-[500px] h-[500px] bg-aether-600 -top-32 -left-32", duration: 22 },
        { className: "w-[600px] h-[600px] bg-purple-600 -right-48 top-1/4", duration: 28 },
        { className: "w-[400px] h-[400px] bg-indigo-600 bottom-0 left-1/3", duration: 20 },
        { className: "w-[350px] h-[350px] bg-violet-600 top-1/2 right-1/4", duration: 24 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className={`glow-orb ${orb.className}`}
          style={{ x: springX, y: springY }}
          animate={
            reducedMotion
              ? undefined
              : {
                  x: [0, 30 + i * 10, 0],
                  y: [0, -20 - i * 8, 0],
                  opacity: [0.15, 0.28, 0.15],
                }
          }
          transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,8,0.4)_100%)] pointer-events-none" />
    </div>
  );
}
