import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PuzzlePiece } from '../../components/PuzzlePiece';

describe('PuzzlePiece', () => {
  const onClickMock = vi.fn();

  const defaultProps = {
    text: 'TestPiece',
    type: 'stem' as const,
    isSelected: false,
    onClick: onClickMock,
  };

  beforeEach(() => {
    onClickMock.mockClear();
  });

  it('renders the text correctly', () => {
    render(<PuzzlePiece {...defaultProps} />);
    expect(screen.getByText('TestPiece')).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<PuzzlePiece {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('applies selected styles when isSelected is true', () => {
    render(<PuzzlePiece {...defaultProps} isSelected={true} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-french-blue');
    expect(button.className).toContain('text-white');
  });

  it('does not fire click when disabled', () => {
    render(<PuzzlePiece {...defaultProps} disabled={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).not.toHaveBeenCalled();
  });

  it('renders correct style for Auxiliary type', () => {
      render(<PuzzlePiece {...defaultProps} type="aux-stem" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-amber-50'); 
  });

  it('respects fixedWidth prop when provided', () => {
      const width = 150;
      render(<PuzzlePiece {...defaultProps} fixedWidth={width} />);
      const button = screen.getByRole('button');
      // React sets styles as inline styles
      expect(button).toHaveStyle({ width: `${width}px` });
      expect(button).toHaveStyle({ minWidth: `${width}px` });
  });
});