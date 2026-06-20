import { useEffect, useRef } from 'react';
import { Minus, Square, X } from 'lucide-react';

export interface WindowConfig {
  id: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
  panelType: string;
}

interface FloatingWindowProps {
  config: WindowConfig;
  children: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

export function FloatingWindow({
  config,
  children,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  onResize,
}: FloatingWindowProps) {
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        onMove(
          Math.max(0, dragRef.current.winX + dx),
          Math.max(0, dragRef.current.winY + dy)
        );
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        onResize(
          Math.max(320, resizeRef.current.startW + dx),
          Math.max(200, resizeRef.current.startH + dy)
        );
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onMove, onResize]);

  if (config.minimized) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: config.x,
        top: config.y,
        width: config.width,
        height: config.height,
        zIndex: config.zIndex,
      }}
      className="flex flex-col rounded-lg overflow-hidden shadow-2xl border border-[#2A3F55]"
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2B3C] border-b border-[#2A3F55] cursor-move shrink-0 select-none"
        onMouseDown={(e) => {
          e.preventDefault();
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            winX: config.x,
            winY: config.y,
          };
        }}
      >
        <div className="flex-1 min-w-0">
          <span className="text-white text-xs font-medium truncate">{config.title}</span>
          {config.subtitle && (
            <span className="text-[#4A90D9] text-xs ml-2 truncate">{config.subtitle}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onMinimize}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#2A3F55] transition-colors"
          >
            <Minus className="w-3 h-3 text-[#8BA3BF]" />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#2A3F55] transition-colors"
          >
            <Square className="w-3 h-3 text-[#8BA3BF]" />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500 transition-colors"
          >
            <X className="w-3 h-3 text-[#8BA3BF] group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-[#101E2D]">
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{ background: 'transparent' }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: config.width,
            startH: config.height,
          };
        }}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#4A90D9] opacity-40" />
      </div>
    </div>
  );
}
