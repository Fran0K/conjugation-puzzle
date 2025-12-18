import React, { useMemo } from 'react';
import { PuzzlePiece } from './PuzzlePiece';
import { getTextWidth } from './measureText';
import { SlotType } from '../types';

interface PuzzleOption {
  id: string;
  text: string;
  type: SlotType;
}

interface PuzzleZoneProps {
  options: PuzzleOption[]; // 这里的数组最多12个
  onPieceClick: (option: PuzzleOption) => void;
}

export const PuzzleZone: React.FC<PuzzleZoneProps> = ({ options, onPieceClick }) => {
  
  // --- 计算统一宽度的逻辑 ---
  const sharedWidth = useMemo(() => {
    if (options.length === 0) return 0;

    // 1. 定义字体样式
    // 必须和你 CSS 里的设置一致。
    // 我们用 sm:text-xl (约20px) 来计算，这样即使在手机上(text-sm)显示，宽度也足够宽，不会拥挤。
    // font-bold 通常对应 700
    const fontStyle = "700 20px 'Red Hat Display', sans-serif"; 

    // 2. 找出最宽的那个词
    let maxTextWidth = 0;
    options.forEach(opt => {
      const w = getTextWidth(opt.text, fontStyle);
      if (w > maxTextWidth) maxTextWidth = w;
    });

    // 3. 添加安全边距 (Safe Padding)
    // PuzzlePiece 里最大的内边距是 pl-10 (40px) + pr-6 (24px) = 64px
    // 我们给 80px 或者 90px，保证绝对能放下且有呼吸感
    const safePadding = 84; 

    return maxTextWidth + safePadding;
  }, [options]); // 只有当选项列表变化时才重新计算，不随点击重算


  return (
    // 使用 Flex 布局，自动换行，居中对齐
    <div className="flex flex-wrap gap-4 p-4 justify-center w-full">
      {options.map((option) => (
        <PuzzlePiece
          key={option.id}
          text={option.text}
          type={option.type}
          isSelected={false}
          onClick={() => onPieceClick(option)}
          // 将计算出的最长宽度传给每一个拼图
          customWidth={sharedWidth}
        />
      ))}
    </div>
  );
};