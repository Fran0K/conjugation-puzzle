// utils/measureText.ts

let cachedContext: CanvasRenderingContext2D | null = null;

const getContext = () => {
  if (cachedContext) return cachedContext;
  const canvas = document.createElement("canvas");
  cachedContext = canvas.getContext("2d");
  return cachedContext;
};

export const getTextWidth = (text: string, font: string): number => {
  const context = getContext();
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  return 0;
};