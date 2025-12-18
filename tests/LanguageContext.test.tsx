
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LanguageProvider, useLanguage } from '../LanguageContext';

const TestComponent = () => {
  const { t, setLanguage, language } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="title">{t('title')}</span>
      <span data-testid="objective">{t('objective')}</span>
      <button onClick={() => setLanguage('en')}>Switch to EN</button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('provides default language and translations', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    // 默认应该是法语
    expect(screen.getByTestId('lang').textContent).toBe('fr');
    expect(screen.getByTestId('title').textContent).toBe('ConjuPuzzle');
    expect(screen.getByTestId('objective').textContent).toBe('Objectif');
  });

  it('switches language and updates translations', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await act(async () => {
      screen.getByText('Switch to EN').click();
    });
    
    expect(screen.getByTestId('lang').textContent).toBe('en');
    // 检查英文下的翻译
    expect(screen.getByTestId('objective').textContent).toBe('Goal');
  });
});
