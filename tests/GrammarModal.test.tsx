
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GrammarModal } from '../components/GrammarModal';
import { LanguageProvider } from '../LanguageContext';

describe('GrammarModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  const renderWithLang = (ui: React.ReactElement) => render(
    <LanguageProvider >{ui}</LanguageProvider>
  );

  it('renders the title and rule list', () => {
    renderWithLang(<GrammarModal {...defaultProps} />);
    // locales.ts 中 fr.ui.rules 为 "Les règles de conjugaison"
    expect(screen.getByText(/Conjugasion Rules/i)).toBeInTheDocument();
    // 检查直陈式现在时标题
    expect(screen.getByText(/Present Indicative/i)).toBeInTheDocument();
  });

  it('expands a rule detail when clicked', () => {
    renderWithLang(<GrammarModal {...defaultProps} />);
    const ruleHeader = screen.getByText(/Present Indicative/i);
    
    // 初始状态下详情应该是折叠的
    expect(screen.queryByText(/details/i)).not.toBeInTheDocument();
    
    fireEvent.click(ruleHeader);
    
    // 展开后应该能看到详情标题
    expect(screen.getByText(/details/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithLang(<GrammarModal {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // 第一个按钮通常是 X 关闭按钮
    fireEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
