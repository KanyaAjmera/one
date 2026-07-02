import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";


interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
  isLightMode?: boolean;
}

export function TubesBackground({ 
  children, 
  className,
  enableClickInteraction = true,
  isLightMode = false
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tubesRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const initTubes = async () => {
      if (!canvasRef.current) return;

      try {
        // We use the specific build from the CDN as it contains the exact effect requested
        // Using native dynamic import which works in modern browsers
        // @ts-ignore
        const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        const TubesCursor = module.default;

        if (!mounted) return;

        const app = TubesCursor(canvasRef.current, {
          bloom: !isLightMode,
          tubes: {
            colors: isLightMode ? ["#9333ea", "#a855f7", "#6958d5"] : ["#f967fb", "#53bc28", "#6958d5"],
            lights: {
              intensity: isLightMode ? 80 : 200,
              colors: isLightMode ? ["#a855f7", "#c084fc", "#e879f9", "#3b82f6"] : ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
            }
          }
        });

        if (isLightMode && app?.three?.renderer) {
          app.three.renderer.setClearColor(0xffffff, 0);
        }

        tubesRef.current = app;
        (window as any).tubesApp = app;


        // Handle resize if the library doesn't automatically
        const handleResize = () => {
          // The library might handle it, but typically we ensure canvas matches container
          // For this specific lib, it likely attaches to window resize or we might need to manually resize
        };

        // Animation loop for infinity path
        let animationFrameId: number;
        let time = 0;
        
        const animateCursor = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          // Infinity symbol (Lemniscate)
          // x = a * cos(t) / (1 + sin^2(t))
          // y = b * sin(t) * cos(t) / (1 + sin^2(t))
          // Simplified Lissajous for smoother look:
          // x = A * cos(t)
          // y = B * sin(2t) / 2
          
          const titleWidth = Math.min(600, width * 0.8);
          const titleHeight = Math.min(200, height * 0.3);
          
          const scaleX = titleWidth / 2;
          const scaleY = titleHeight;
          
          const centerX = width / 2;
          const centerY = height / 2;
          
          const t = time * 0.002; // Speed
          
          const x = centerX + Math.cos(t) * scaleX;
          const y = centerY + Math.sin(t * 2) * scaleY / 2;
          
          // Dispatch synthetic mouse event
          window.dispatchEvent(new MouseEvent('mousemove', {
            bubbles: false,
            cancelable: true,
            clientX: x,
            clientY: y
          }));

          time += 16; // Approx 60fps delta
          animationFrameId = requestAnimationFrame(animateCursor);
        };
        
        animationFrameId = requestAnimationFrame(animateCursor);

        // Block real mouse events to ensure only infinity path is drawn
        const blockRealMouse = (e: MouseEvent) => {
           if (e.isTrusted) {
             e.stopImmediatePropagation();
           }
        };
        window.addEventListener('mousemove', blockRealMouse, true);

        window.addEventListener('resize', handleResize);
        
        cleanup = () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener('mousemove', blockRealMouse, true);
          window.removeEventListener('resize', handleResize);
          // If the library has a destroy method, call it
          // app.destroy?.(); 
          // Based on typical threejs-components, it might not have an explicit destroy exposed easily
          // but we should at least nullify the ref
        };

      } catch (error) {
        console.error("Failed to load TubesCursor:", error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [isLightMode]);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return;
  };

  return (
    <div 
      className={cn("relative w-full h-full min-h-[400px] overflow-hidden bg-background", className)}
      onClick={handleClick}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'none' }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

// Default export
export default TubesBackground;
