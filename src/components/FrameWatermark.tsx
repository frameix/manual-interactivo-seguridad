import React from 'react';

interface FrameWatermarkProps {
  variant?: 'inline' | 'footer' | 'overlay';
  className?: string;
}

// SVG replica of Bootstrap Icons "bi-patch-check-fill" — the scalloped seal with a checkmark
const PatchCheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z"/>
  </svg>
);

export default function FrameWatermark({ variant = 'inline', className = '' }: FrameWatermarkProps) {
  if (variant === 'overlay') {
    return (
      <div className={`absolute bottom-3 right-4 flex items-center gap-1.5 opacity-[0.06] pointer-events-none select-none ${className}`}>
        <PatchCheckIcon size={18} />
        <span
          className="font-bold font-sans uppercase"
          style={{ fontSize: '1.1rem', letterSpacing: '3px', color: 'currentColor' }}
        >
          Frame
        </span>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex items-center gap-1.5 text-[#adb5bd] dark:text-zinc-600 ${className}`}>
        <PatchCheckIcon size={18} />
        <span
          className="font-bold font-sans uppercase"
          style={{ fontSize: '1.1rem', letterSpacing: '3px' }}
        >
          Frame
        </span>
      </div>
    );
  }

  // inline (default) - small subtle badge
  return (
    <div className={`inline-flex items-center gap-1 text-[#adb5bd] dark:text-zinc-600 ${className}`}>
      <PatchCheckIcon size={14} />
      <span
        className="font-bold font-sans uppercase"
        style={{ fontSize: '0.7rem', letterSpacing: '2px' }}
      >
        Frame
      </span>
    </div>
  );
}
