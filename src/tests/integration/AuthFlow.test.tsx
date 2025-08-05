/**
 * @file AuthFlow.test.tsx
 * @description Integration tests for the complete authentication flow
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/utils/logger');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Authentication Flow Integration', () => {
  const defaultAuthState = {
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    signInWithProvider: jest.fn(),
    updateProfile: jest.fn(),
    isAuthenticated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(defaultAuthState);
  });

  const renderAuthModal = (props = {}) => {
    return render(
      <BrowserRouter>
        <AuthModal isOpen={true} onClose={jest.fn()} {...props} />
      </BrowserRouter>
    );
  };

  describe('Sign In Flow', () => {
    it('should complete sign in flow successfully', async () => {
      const mockSignIn = jest.fn().mockResolvedValue({ user: { id: '1' } });
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        signIn: mockSignIn,
      });

      renderAuthModal();

      // Fill in sign in form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle sign in errors gracefully', async () => {
      const mockSignIn = jest
        .fn()
        .mockRejectedValue(new Error('Invalid credentials'));
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        signIn: mockSignIn,
      });

      renderAuthModal();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('should complete multi-step sign up flow', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({ user: { id: '1' } });
      const mockUpdateProfile = jest.fn().mockResolvedValue({});

      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        signUp: mockSignUp,
        updateProfile: mockUpdateProfile,
      });

      renderAuthModal();

      // Switch to sign up
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      fireEvent.click(signUpTab);

      // Step 1: Basic info
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(emailInput, {
        target: { value: 'newuser@example.com' },
      });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      // Step 2: Profile setup
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i);
        const bioInput = screen.getByLabelText(/bio/i);

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(bioInput, { target: { value: 'Software Developer' } });
      });

      const profileContinueButton = screen.getByRole('button', {
        name: /continue/i,
      });
      fireEvent.click(profileContinueButton);

      // Step 3: Skills setup
      await waitFor(() => {
        expect(screen.getByText(/skills to teach/i)).toBeInTheDocument();
      });

      const skillsContinueButton = screen.getByRole('button', {
        name: /continue/i,
      });
      fireEvent.click(skillsContinueButton);

      // Step 4: Mentorship preferences
      await waitFor(() => {
        expect(screen.getByText(/mentorship preferences/i)).toBeInTheDocument();
      });

      const finalContinueButton = screen.getByRole('button', {
        name: /continue/i,
      });
      fireEvent.click(finalContinueButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
        expect(mockUpdateProfile).toHaveBeenCalled();
      });
    });

    it('should validate form data at each step', async () => {
      renderAuthModal();

      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      fireEvent.click(signUpTab);

      // Try to continue without filling required fields
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Social Authentication', () => {
    it('should handle social auth provider selection', async () => {
      const mockSignInWithProvider = jest
        .fn()
        .mockResolvedValue({ user: { id: '1' } });
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        signInWithProvider: mockSignInWithProvider,
      });

      renderAuthModal();

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
      });
    });

    it('should handle social auth errors', async () => {
      const mockSignInWithProvider = jest
        .fn()
        .mockRejectedValue(new Error('Auth failed'));
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        signInWithProvider: mockSignInWithProvider,
      });

      renderAuthModal();

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
      });

      // Should log error
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Cross-Component Interactions', () => {
    it('should maintain state consistency across form steps', async () => {
      renderAuthModal();

      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      fireEvent.click(signUpTab);

      // Fill step 1
      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      // Go back and verify data is preserved
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('test@example.com')
        ).toBeInTheDocument();
      });
    });

    it('should handle loading states correctly', async () => {
      const mockSignIn = jest
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        );

      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        signIn: mockSignIn,
      });

      renderAuthModal();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const signInButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);

      // Should show loading state
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    });
  });
});
