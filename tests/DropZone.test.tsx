
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DropZone } from '../components/DropZone';
import { LanguageProvider } from '../LanguageContext';

describe('DropZone Component', () => {
  const defaultProps = {
    type: 'stem' as const,
    content: null,
    placeholder: 'Test Placeholder',
    onClear: vi.fn(),
    onDrop: vi.fn(),
  };

  const renderWithLang = (ui: React.ReactElement) => render(
    <LanguageProvider>{ui}</LanguageProvider>
  );

  it('renders placeholder when empty', () => {
    renderWithLang(<DropZone {...defaultProps} />);
    expect(screen.getByText('Test Placeholder')).toBeInTheDocument();
  });

  it('renders content when provided', () => {
    renderWithLang(<DropZone {...defaultProps} content="mange" />);
    expect(screen.getByText('mange')).toBeInTheDocument();
    expect(screen.queryByText('Test Placeholder')).not.toBeInTheDocument();
  });

  it('calls onClear when clicked and has content', () => {
    renderWithLang(<DropZone {...defaultProps} content="mange" />);
    fireEvent.click(screen.getByText('mange'));
    expect(defaultProps.onClear).toHaveBeenCalled();
  });

  it('handles drop event correctly with type validation', () => {
    renderWithLang(<DropZone {...defaultProps} />);
    const zone = screen.getByText('Test Placeholder').closest('div');
    
    // Simulate drop with correct type
    const dataTransfer = {
      getData: vi.fn((key) => {
        if (key === 'application/x-puzzle-type') return 'stem';
        if (key === 'text/plain') return 'dropped-text';
        return '';
      }),
      dropEffect: 'none'
    };

    fireEvent.drop(zone!, { dataTransfer });
    expect(defaultProps.onDrop).toHaveBeenCalledWith('dropped-text');
  });

  it('rejects drop with mismatched type', () => {
    renderWithLang(<DropZone {...defaultProps} type="ending" />);
    const zone = screen.getByText('Test Placeholder').closest('div');
    
    const dataTransfer = {
      getData: vi.fn((key) => {
        if (key === 'application/x-puzzle-type') return 'stem'; // Mismatch: zone is ending
        return 'dropped-text';
      }),
    };

    fireEvent.drop(zone!, { dataTransfer });
    expect(defaultProps.onDrop).not.toHaveBeenCalled();
  });

  it('shows success styling when isCorrect is true', () => {
    const { container } = renderWithLang(<DropZone {...defaultProps} content="mange" isCorrect={true} />);
    const zone = container.firstChild;
    expect(zone).toHaveClass('border-green-500');
    expect(zone).toHaveClass('bg-green-50');
  });
});
