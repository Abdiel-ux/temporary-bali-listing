import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { LocaleProvider } from '../../../context/localeContext';

// Mock useLocation and useHistory hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
  }),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe('LanguageSelector', () => {
  const renderWithProviders = (component) => {
    return render(
      <LocaleProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </LocaleProvider>
    );
  };

  test('renders language selector with current language', () => {
    renderWithProviders(<LanguageSelector />);
    
    // Check that the selector button is rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Check that English is displayed as the current language
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  test('opens dropdown when clicked', () => {
    renderWithProviders(<LanguageSelector />);
    
    // Click the selector button
    fireEvent.click(screen.getByRole('button'));
    
    // Check that language options are displayed
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  test('changes language when option is selected', () => {
    renderWithProviders(<LanguageSelector />);
    
    // Click the selector button
    fireEvent.click(screen.getByRole('button'));
    
    // Click on French option
    fireEvent.click(screen.getByText('Français'));
    
    // Check that the dropdown is closed
    expect(screen.queryByText('Deutsch')).not.toBeInTheDocument();
  });
});