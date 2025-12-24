import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PuzzlePiece } from '../../components/PuzzlePiece';

describe('PuzzlePiece', () => {
  // Define the spy separately so we can reference it for clearing
  const onClickMock = vi.fn();

  const defaultProps = {
    text: 'TestPiece',
    type: 'stem' as const,
    isSelected: false,
    onClick: onClickMock,
  };

  // Clear the mock history before every single test
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
    // Now this will pass because the count was reset to 0 before this test ran
    expect(onClickMock).not.toHaveBeenCalled();
  });

  it('renders correct style for Auxiliary type', () => {
      render(<PuzzlePiece {...defaultProps} type="aux-stem" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-amber-50'); 
  });
});
