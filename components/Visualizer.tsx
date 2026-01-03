import React, { useRef, useEffect } from 'react';
import { MidiSettings, ScaleType } from '../types';
import { SCALES, NOTE_NAMES } from '../constants';

interface VisualizerProps {
  imageSrc: string | null;
  settings: MidiSettings;
}

const Visualizer: React.FC<VisualizerProps> = ({ imageSrc, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 400;
      
      // Draw 1-bit style visualization
      drawVisualization(ctx, img, canvas.width, canvas.height);
    };

  }, [imageSrc, settings]);

  const drawVisualization = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) => {
    const { 
      threshold, resolutionX, resolutionY, 
      minNote, maxNote, scale, rootNote 
    } = settings;

    // 1. Draw source image (hidden/offscreen usually, but here just draw over)
    // We want a gritty look, so no smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height).data;

    // 2. Clear with Black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const blockW = width / resolutionX;
    const blockH = height / resolutionY;
    const rootIndex = NOTE_NAMES.indexOf(rootNote);

    const isNoteInScale = (note: number, rIdx: number, sType: string): boolean => {
      if (sType === ScaleType.CHROMATIC) return true;
      const relativeNote = (note - rIdx + 120) % 12; 
      return SCALES[sType].includes(relativeNote);
    };

    // 3. Draw "Pixels" as ASCII blocks or raw rectangles
    for (let x = 0; x < resolutionX; x++) {
      for (let y = 0; y < resolutionY; y++) {
         const sampleX = Math.floor((x + 0.5) * blockW);
         const sampleY = Math.floor((y + 0.5) * blockH);
         
         const idx = (sampleY * width + sampleX) * 4;
         const r = imageData[idx];
         const g = imageData[idx + 1];
         const b = imageData[idx + 2];
         // Perceptual brightness
         const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

         if (brightness > threshold) {
            const pitchRatio = 1 - (y / resolutionY); 
            let rawPitch = Math.floor(minNote + pitchRatio * (maxNote - minNote));
            const inScale = isNoteInScale(rawPitch, rootIndex, scale);

            if (inScale) {
                // In scale: White or Light Grey
                ctx.fillStyle = '#ffffff';
            } else {
                // Out of scale: Red or Dark Grey (Visual noise)
                // In NFO style, maybe we just use dither patterns? 
                // Let's use Red to indicate "Invalid/Ghost" notes that will be snapped
                ctx.fillStyle = '#330000';
            }

            // Draw slightly smaller rect to create grid effect
            ctx.fillRect(Math.floor(x * blockW), Math.floor(y * blockH), Math.ceil(blockW), Math.ceil(blockH));
         }
      }
    }

    // Add CRT scanlines via canvas for extra grit? 
    // No, doing it via CSS in index.html is better for performance.
  };

  if (!imageSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black border border-zinc-800 text-zinc-600 font-mono">
        <div className="text-4xl mb-4 opacity-20">NO_SIGNAL</div>
        <p className="text-xs uppercase">[ Insert disk to continue ]</p>
      </div>
    );
  }

  return (
    <canvas ref={canvasRef} className="w-full h-full object-contain image-pixelated" style={{ imageRendering: 'pixelated' }} />
  );
};

export default Visualizer;