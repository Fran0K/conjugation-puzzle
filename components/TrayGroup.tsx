import React, { useState, useRef, useLayoutEffect } from 'react';
import { SmartTray } from './SmartTray';
import { measureTextWidth } from '../utils';
import { TrayConfig, TrayLayoutState } from '../types';

interface TrayGroupProps {
  trays: TrayConfig[];
}

// Tray Group (The Logic Engine)
export const TrayGroup: React.FC<TrayGroupProps> = ({ trays }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Layout state for each tray in this group
  const [layouts, setLayouts] = useState<TrayLayoutState[]>([]);

  // Measure Container
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- CORE LAYOUT ALGORITHM ---
  useLayoutEffect(() => {
    if (!containerWidth || trays.length === 0) return;

    // A. Configuration constants
    const isDesktop = window.matchMedia('(min-width: 640px)').matches;
    const fontSize = isDesktop ? '20px' : '14px';
    const font = `700 ${fontSize} "Fredoka", sans-serif`;
    
    // Padding + Buffer + Connector space
    const padding = isDesktop ? 60 : 38; 
    const minWidth = isDesktop ? 100 : 55;
    
    // GAP CONFIGURATION (Must match CSS)
    // Mobile: gap-3 (12px)
    // Desktop: gap-4 (16px)
    const gap = isDesktop ? 16 : 12;

    // B. Calculate max puzzle width for each tray independently
    const trayMaxPieceWidths = trays.map(tray => {
      const maxTextW = tray.items.reduce((max, text) => Math.max(max, measureTextWidth(text, font)), 0);
      return Math.max(maxTextW + padding, minWidth);
    });

    const newLayouts: TrayLayoutState[] = [];

    // C. Apply Rules
    if (trays.length === 1) {
      // --- Rule 3: Single Tray Logic ---
      const pWidth = trayMaxPieceWidths[0];
      
      // Check 1x4 Horizontal (Single Row)
      const wRow = (pWidth * 4) + (gap * 3);
      // Check 2x2 Grid
      const wGrid = (pWidth * 2) + gap;

      if (wRow <= containerWidth) {
        newLayouts.push({ cols: 4, pieceWidth: pWidth });
      } else if (wGrid <= containerWidth) {
        newLayouts.push({ cols: 2, pieceWidth: pWidth });
      } else {
        newLayouts.push({ cols: 1, pieceWidth: pWidth }); // Vertical stack
      }

    } else if (trays.length === 2) {
      // --- Rule 4: Dual Tray Logic (Base + Ending) ---
      const wBase = trayMaxPieceWidths[0];
      const wEnd = trayMaxPieceWidths[1];

      // Logic: "If maxBaseWidth + maxEndingWidth <= availableWidth / 2" 
      // This mathematically equals: (wBase * 2) + (wEnd * 2) + gaps <= availableWidth
      // We need to account for the gaps strictly.
      // 2x2 Layout needs: (wBase * 2) + (wEnd * 2) + (gap * 3);
      // Explanation of gaps: [Col1]<gap>[Col2] <trayGap> [Col3]<gap>[Col4]
      const widthNeededFor2x2 = (wBase * 2) + (wEnd * 2) + (gap * 3);

      if (widthNeededFor2x2 <= containerWidth) {
         // Case: Side-by-Side, Internal 2x2
         newLayouts.push({ cols: 2, pieceWidth: wBase });
         newLayouts.push({ cols: 2, pieceWidth: wEnd });
      } else {
         // Fallback: Side-by-Side, Internal 1x4 (Vertical Columns)
         // Note: We don't check if this fits, we force it per requirements, 
         // assuming min-width allows scrolling or wrapping if EXTREMELY narrow, 
         // but requirement says "Side by side vertical stacks".
         newLayouts.push({ cols: 1, pieceWidth: wBase });
         newLayouts.push({ cols: 1, pieceWidth: wEnd });
      }
    }

    setLayouts(newLayouts);

  }, [trays, containerWidth]);

  if (trays.length === 0) return null;

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      {/* 
         Tray Zone Layout:
         - Always Flex Row for Dual Trays (as per rule 4)
         - Justify Center
         - Gap: 12px (mobile) / 16px (desktop)
      */}
      <div className={`flex flex-row justify-center items-stretch gap-3 sm:gap-4 w-full`}>
        {trays.map((tray, idx) => {
          // Guard against layout calculation lag
          const layout = layouts[idx] || { cols: 2, pieceWidth: 100 };
          
          return (
            <SmartTray 
              key={tray.id}
              config={tray}
              layout={layout}
            />
          );
        })}
      </div>
    </div>
  );
};
