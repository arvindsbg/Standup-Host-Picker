import { useState, useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { playSpinStart, playSpinEnd } from '@/lib/sounds';
import './SpinningWheel.css';

interface SpinningWheelProps {
  items: string[];
  onSpinComplete: (selectedItem: string) => void;
  isSpinning: boolean;
  disabled?: boolean;
  title?: string;
}

/**
 * SpinningWheel Component
 * Design Philosophy: Modern Minimalist with Playful Interaction
 * - Smooth spinning animation with satisfying physics
 * - Cyan accent color for visual focus
 * - Responsive design for all screen sizes
 */
export const SpinningWheel = ({
  items,
  onSpinComplete,
  isSpinning,
  disabled = false,
  title = 'Spin the Wheel',
}: SpinningWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw wheel segments
    const segmentAngle = (2 * Math.PI) / items.length;

    items.forEach((item, index) => {
      const startAngle = index * segmentAngle + (rotation * Math.PI) / 180;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Alternate colors for better visibility
      const isEven = index % 2 === 0;
      ctx.fillStyle = isEven ? '#06b6d4' : '#0891b2';
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + segmentAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.65);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.65);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Wrap text if too long
      const maxWidth = radius * 0.4;
      const words = item.split(' ');
      let line = '';
      let y = -10;

      words.forEach((word) => {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, 0, y);
          line = word;
          y += 16;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, 0, y);

      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer indicator
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 10, 30);
    ctx.lineTo(centerX + 10, 30);
    ctx.closePath();
    ctx.fillStyle = '#000000';
    ctx.fill();
  }, [items, rotation]);

  const handleSpin = () => {
    if (isSpinning || disabled || items.length === 0) return;

    // Play spin start sound
    playSpinStart();

    // Generate random rotation (at least 5 full rotations + random offset)
    const minRotation = 1800; // 5 full rotations
    const randomOffset = Math.random() * 360;
    const totalRotation = minRotation + randomOffset;

    // Calculate which item will be selected (pointer is at top)
    const segmentAngle = 360 / items.length;
    const normalizedRotation = (totalRotation % 360 + 360) % 360;
    const selectedIdx = Math.floor(normalizedRotation / segmentAngle) % items.length;

    setSelectedIndex(selectedIdx);

    // Animate the rotation
    const startRotation = rotation;
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for satisfying deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeProgress;

      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin complete - play end sound
        playSpinEnd();
        onSpinComplete(items[selectedIdx]);
      }
    };

    animate();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-full shadow-lg border-4 border-slate-200 dark:border-slate-700"
        />
        <div className="absolute inset-0 rounded-full pointer-events-none border-4 border-transparent bg-gradient-to-b from-transparent via-transparent to-slate-900/5" />
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || disabled || items.length === 0}
        className="mt-4 px-8 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold transition-all duration-200 ease-out flex items-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
      >
        <Zap className="w-5 h-5" />
        {isSpinning ? 'Spinning...' : 'Spin Wheel'}
      </button>

      {items.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Select team members to enable spinning</p>
      )}
    </div>
  );
};
