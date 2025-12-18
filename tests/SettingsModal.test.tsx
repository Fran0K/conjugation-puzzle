
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsModal } from '../components/SettingsModal';
import { LanguageProvider } from '../LanguageContext';
import { ALL_TENSES } from '../constants';

describe('SettingsModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedTenses: ['Présent'],
    onSave: vi.fn(),
  };

  const renderWithLang = (ui: React.ReactElement) => render(
    <LanguageProvider >{ui}</LanguageProvider>
  );

  it('renders all available tenses', () => {
    renderWithLang(<SettingsModal {...defaultProps} />);
    // Check if some key tenses are visible (translated or original)
    expect(screen.getByText(/Présent/i)).toBeInTheDocument();
    expect(screen.getByText(/Imparfait/i)).toBeInTheDocument();
  });

  it('toggles selection when a tense is clicked', () => {
    renderWithLang(<SettingsModal {...defaultProps} />);
    const checkbox = screen.getByLabelText(/Imparfait/i);
    
    fireEvent.click(checkbox);
    // After clicking, the validate button should show count 2 (Présent + Imparfait)
    expect(screen.getByText(/Valider \(2\)/i)).toBeInTheDocument();
  });

  it('handles Select All correctly', () => {
    renderWithLang(<SettingsModal {...defaultProps} />);
    const selectAllBtn = screen.getByText(/Tout/i);
    
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(new RegExp(`Valider \\(${ALL_TENSES.length}\\)`, 'i'))).toBeInTheDocument();
  });

  it('calls onSave with correct data', () => {
    renderWithLang(<SettingsModal {...defaultProps} />);
    const saveBtn = screen.getByText(/Valider/i);
    
    fireEvent.click(saveBtn);
    expect(defaultProps.onSave).toHaveBeenCalledWith(['Présent']);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
