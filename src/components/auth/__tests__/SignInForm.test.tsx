/**
 * @file SignInForm.test.tsx
 * @description Unit tests for SignInForm component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInForm } from '../SignInForm';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('SignInForm', () => {
  const mockOnSignIn = jest.fn();

  beforeEach(() => {
    mockOnSignIn.mockClear();
  });

  it('renders sign in form correctly', () => {
    render(<SignInForm onSignIn={mockOnSignIn} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('calls onSignIn with form data when valid', async () => {
    render(<SignInForm onSignIn={mockOnSignIn} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message when provided', () => {
    const errorMessage = 'Invalid email or password';
    render(<SignInForm onSignIn={mockOnSignIn} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<SignInForm onSignIn={mockOnSignIn} isLoading={true} />);

    expect(
      screen.getByRole('button', { name: /signing in/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<SignInForm onSignIn={mockOnSignIn} />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('disables form inputs when loading', () => {
    render(<SignInForm onSignIn={mockOnSignIn} isLoading={true} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });
});
