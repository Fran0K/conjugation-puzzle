
import React from 'react';
import { SlotType } from '../types';

interface PuzzlePieceProps {
  text: string;
  type: SlotType;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  isCorrect?: boolean | null; 
  showConnectors?: boolean; // New prop to toggle puzzle shape vs standalone block
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({ 
  text, 
  type, 
  isSelected, 
  onClick, 
  disabled, 
  isCorrect,
  showConnectors = true // Default to true for backward compatibility
}) => {
  
  let baseClasses = "relative transition-all duration-200 select-none flex items-center justify-center font-display font-bold text-lg sm:text-xl transform hover:-translate-y-1 active:translate-y-0";
  
  const isStem = type.includes('stem');
  const isAux = type.includes('aux');

  // Specific styling for Stem vs Ending vs Standalone
  let shapeClass = "";

  if (isStem) {
    if (showConnectors) {
      // Classic Puzzle Piece (Left part)
      shapeClass = "rounded-l-lg rounded-r-none border-r-2 border-dashed pr-6 pl-4 py-3 sm:py-4 min-w-[80px] sm:min-w-[100px] shadow-md border";
    } else {
      // Standalone Block (No connectors)
      // Thicker border (border-2) to match DropZone 'single' style and look like a tile
      shapeClass = "rounded-xl border-2 px-6 py-3 sm:py-4 min-w-[100px] w-full shadow-sm"; 
    }
  } else {
    // Ending Piece (Right part) - Always has connector receiver shape imply on left
    shapeClass = "rounded-r-lg rounded-l-none pl-6 pr-4 py-3 sm:py-4 min-w-[60px] sm:min-w-[80px] w-full shadow-md border";
  }

  // --- Theme Color Logic ---
  let colorClass = "";
  let borderColor = "";

  // 1. Auxiliary Style
  if (isAux) {
     colorClass = "bg-amber-50 text-amber-900 hover:bg-amber-100";
     borderColor = "border-amber-300";
  } 
  // 2. Main Verb Style
  else {
     colorClass = "bg-white text-french-dark hover:bg-blue-50";
     borderColor = "border-gray-200";
  }

  // 3. Selection Override
  if (isSelected) {
    colorClass = "bg-french-blue text-white ring-4 ring-blue-200";
    borderColor = "border-blue-600";
  }

  // 4. Validation Override
  if (isCorrect === true) {
    colorClass = "bg-green-500 text-white ring-4 ring-green-200";
    borderColor = "border-green-600";
  } else if (isCorrect === false) {
    colorClass = "bg-french-red text-white ring-4 ring-red-200";
    borderColor = "border-red-600";
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", text);
    e.dataTransfer.setData("application/x-puzzle-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      draggable={!disabled}
      onDragStart={handleDragStart}
      disabled={disabled}
      className={`${baseClasses} ${shapeClass} ${colorClass} ${borderColor} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Visual connector notch representation - Only for Stems when connectors are enabled */}
      {isStem && showConnectors && (
        <div className={`absolute right-[-10px] top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full shadow-inner z-10 ${
          isSelected ? 'bg-french-blue' : (
            isCorrect === true ? 'bg-green-500' : (
              isCorrect === false ? 'bg-french-red' : (
                isAux ? 'bg-amber-100 border-amber-300' : 'bg-white border-gray-300'
              )
            )
          )
        } border border-inherit`}></div>
      )}
      
      {text}
    </button>
  );
};
