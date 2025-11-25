
import React, { useEffect, useRef } from 'react';

interface Props {
  activeSection: number;
}

// --- Math Generators ---

// 1. Archimedean Spiral (Cosmic Vortex)
const getArchimedean = (i: number, total: number) => {
  const t = (i / total) * 100; // revolutions
  const r = t * 15;
  const theta = t * 0.5;
  // Add some thickness/randomness to make it a vortex cloud
  const spread = (Math.random() - 0.5) * 50;
  
  const x = (r + spread) * Math.cos(theta);
  const z = (r + spread) * Math.sin(theta);
  const y = (Math.random() - 0.5) * 800 - 200; // Vertical cylinder spread
  return { x, y, z };
};

// 2. Rose Curve (K=4)
const getRose = (i: number, total: number) => {
  const theta = (i / total) * Math.PI * 100;
  const k = 4; 
  const rBase = 800 * Math.cos(k * theta);
  const spread = (Math.random() - 0.5) * 100;
  const r = rBase + spread;

  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  const z = (Math.random() - 0.5) * 600; // Depth volume
  return { x, y, z };
};

// 3. Heart Curve (3D)
const getHeart = (i: number, total: number) => {
  // Distribute points roughly on the surface
  const t = (i / total) * Math.PI * 200; // Many loops
  const spread = Math.random() * 20;

  // 3D Heart parametric approximation
  // x = 16sin^3(t)
  // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
  // We scale it up
  
  const scale = 35;
  const x = scale * 16 * Math.pow(Math.sin(t), 3);
  const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  const z = (Math.random() - 0.5) * 400 * (1 - Math.abs(y)/600); // Thicker at top, thinner at bottom

  return { x, y: y + 200, z }; // Offset Y to center
};

// 4. Butterfly Curve
const getButterfly = (i: number, total: number) => {
  const t = (i / total) * 24 * Math.PI;
  const e = 2.71828;
  const term1 = Math.pow(e, Math.cos(t));
  const term2 = 2 * Math.cos(4 * t);
  const term3 = Math.pow(Math.sin(t / 12), 5);
  
  const r = 250 * (term1 - term2 + term3);
  
  const x = r * Math.sin(t);
  const y = -r * Math.cos(t);
  const z = r * Math.sin(t * 2); // Twist in Z
  return { x: x * 1.5, y: y * 1.5, z };
};

// 5. Koch Snowflake (Fractal Approximation)
const getKoch = (i: number, total: number) => {
    // We create a "Crystal" structure using symmetry
    const layer = Math.floor(i / (total / 5)); // 5 layers
    const segment = i % (total / 5);
    
    const radius = 600 - layer * 100;
    const theta = (segment / (total/5)) * Math.PI * 2;
    
    // Add "Fractal noise" to position
    const noise = Math.sin(segment * 0.1) * 50;
    
    // Star shape base
    let r = radius + (Math.cos(theta * 3) * 200); // Triangle base
    if (layer % 2 === 0) r = radius + (Math.cos(theta * 3 + Math.PI) * 200); // Inverted triangle
    
    // Add high frequency detail
    r += Math.cos(theta * 12) * 40; 
    
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = (layer - 2.5) * 150 + noise;

    return { x, y, z };
};

// 6. DNA Helix (Profile Section)
const getDNA = (i: number, total: number) => {
    const strand = i % 2 === 0 ? 1 : -1; // Two strands
    const t = (i / total) * Math.PI * 20; // Length
    
    const radius = 250;
    const x = radius * Math.cos(t + (strand * Math.PI)); // Phase shift for double helix
    const y = (i / total) * 1200 - 600; // Vertical spread
    const z = radius * Math.sin(t + (strand * Math.PI));
    
    // Add "Rungs" (connecting bars) - scattered points between strands
    if (i % 10 === 0) {
        return { 
            x: x * Math.random(), 
            y: y, 
            z: z * Math.random() 
        };
    }

    return { x, y, z };
}

const AsciiLandscape: React.FC<Props> = ({ activeSection }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Float32Array | null>(null); 
  const count = 25000; // Increased particle count for density

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Initialize Particles
    if (!particlesRef.current) {
      particlesRef.current = new Float32Array(count * 7); // [x, y, z, tx, ty, tz, colorType]
      for (let i = 0; i < count; i++) {
        const idx = i * 7;
        const { x, y, z } = getArchimedean(i, count);
        particlesRef.current[idx] = x;
        particlesRef.current[idx + 1] = y;
        particlesRef.current[idx + 2] = z;
        particlesRef.current[idx + 3] = x;
        particlesRef.current[idx + 4] = y;
        particlesRef.current[idx + 5] = z;
        particlesRef.current[idx + 6] = Math.random(); // 0-1 for color blending
      }
    }

    let animationFrameId: number;
    let rotationY = 0;
    let rotationX = 0;

    const render = () => {
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // "Space" Background Clear
      ctx.fillStyle = '#020205'; // Very dark blue/black
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add Glow Effect
      ctx.globalCompositeOperation = 'lighter';

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      rotationY += 0.0015;
      rotationX = Math.sin(rotationY * 0.5) * 0.1; // Slight tilt

      const data = particlesRef.current!;
      const ease = 0.04; // Smooth morphing speed

      // Pre-calculate rotation matrices
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      for (let i = 0; i < count; i++) {
        const idx = i * 7;
        
        // 1. Interpolate to Target
        data[idx] += (data[idx + 3] - data[idx]) * ease;
        data[idx + 1] += (data[idx + 4] - data[idx + 1]) * ease;
        data[idx + 2] += (data[idx + 5] - data[idx + 2]) * ease;

        // 2. 3D Rotation
        let x = data[idx];
        let y = data[idx + 1];
        let z = data[idx + 2];

        // Rotate Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // 3. Project
        const fov = 1000;
        const scale = fov / (fov + z2 + 1000); // Z-offset for camera
        
        const screenX = cx + x1 * scale;
        const screenY = cy + y2 * scale;

        // 4. Draw
        if (z2 > -900) {
            const size = scale * 1.8;
            const alpha = Math.min(1, scale * scale * 0.8);
            
            // Color Mapping based on random seed + Z depth
            const colorSeed = data[idx + 6];
            
            if (colorSeed > 0.95) {
                // Bright White sparkles
                 ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            } else if (colorSeed > 0.6) {
                // Tech Cyan
                ctx.fillStyle = `rgba(0, 243, 255, ${alpha * 0.8})`;
            } else if (colorSeed > 0.3) {
                // Deep Purple/Blue
                ctx.fillStyle = `rgba(80, 100, 255, ${alpha * 0.5})`;
            } else {
                // Faint particle
                ctx.fillStyle = `rgba(0, 243, 255, ${alpha * 0.2})`;
            }
            
            ctx.beginPath();
            ctx.fillRect(screenX, screenY, size, size);
        }
      }
      
      ctx.globalCompositeOperation = 'source-over'; // Reset
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Handle Curve Switching
  useEffect(() => {
    if (!particlesRef.current) return;
    const data = particlesRef.current;
    
    for (let i = 0; i < count; i++) {
        const idx = i * 7;
        let target;
        
        switch (activeSection) {
            case 0: target = getArchimedean(i, count); break; // Hero: Spiral
            case 1: target = getRose(i, count); break; // Data: Rose
            case 2: target = getHeart(i, count); break; // Analysis: Heart
            case 3: target = getButterfly(i, count); break; // Intangible: Butterfly
            case 4: target = getKoch(i, count); break; // Material: Fractal
            case 5: target = getDNA(i, count); break; // Profile: DNA
            default: target = getArchimedean(i, count);
        }

        data[idx + 3] = target.x;
        data[idx + 4] = target.y;
        data[idx + 5] = target.z;
    }
  }, [activeSection]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default AsciiLandscape;
