/**
 * @file SignUpForm.test.tsx
 * @description Unit tests for SignUpForm component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignUpForm } from '../SignUpForm';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the SkillInputComponent
jest.mock('@/components/ui/SkillInputComponent', () => ({
  SkillInputComponent: ({ skills, onSkillsChange }: any) => (
    <div data-testid="skill-input">
      <button
        onClick={() =>
          onSkillsChange([...skills, { name: 'Test Skill', level: 'Beginner' }])
        }
      >
        Add Skill
      </button>
      {skills.map((skill: any, index: number) => (
        <div key={index} data-testid={`skill-${index}`}>
          {skill.name}
        </div>
      ))}
    </div>
  ),
}));

describe('SignUpForm', () => {
  const mockOnSignUp = jest.fn();

  beforeEach(() => {
    mockOnSignUp.mockClear();
  });

  describe('Step 1: Email and Password', () => {
    it('renders email and password fields', () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument();
    });

    it('validates email format', async () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      await waitFor(() => {
        expect(
          screen.getByText(/please enter valid email/i)
        ).toBeInTheDocument();
      });
    });

    it('validates password length', async () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: '123' } });

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6/i)
        ).toBeInTheDocument();
      });
    });

    it('proceeds to next step when valid data is entered', async () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Profile Information', () => {
    const setupStep2 = () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      // Fill step 1 and proceed
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    };

    it('renders profile information fields', async () => {
      setupStep2();

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/age range/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      setupStep2();

      await waitFor(() => {
        const continueButton = screen.getByRole('button', {
          name: /continue/i,
        });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/name required/i)).toBeInTheDocument();
      });
    });

    it('allows going back to previous step', async () => {
      setupStep2();

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 3: Skills Setup', () => {
    const setupStep3 = async () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      // Fill step 1
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Fill step 2
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/full name/i), {
          target: { value: 'John Doe' },
        });
        fireEvent.change(screen.getByLabelText(/bio/i), {
          target: { value: 'Test bio' },
        });
        fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      });
    };

    it('renders skills setup fields', async () => {
      await setupStep3();

      await waitFor(() => {
        expect(screen.getByText(/skills you can teach/i)).toBeInTheDocument();
        expect(
          screen.getByText(/skills you want to learn/i)
        ).toBeInTheDocument();
        expect(screen.getByTestId('skill-input')).toBeInTheDocument();
      });
    });

    it('validates that at least one skill is added', async () => {
      await setupStep3();

      await waitFor(() => {
        const continueButton = screen.getByRole('button', {
          name: /continue/i,
        });
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/please add at least one skill/i)
        ).toBeInTheDocument();
      });
    });

    it('allows adding skills', async () => {
      await setupStep3();

      await waitFor(() => {
        const addSkillButton = screen.getByRole('button', {
          name: /add skill/i,
        });
        fireEvent.click(addSkillButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('skill-0')).toBeInTheDocument();
      });
    });
  });

  describe('Step 4: Mentorship Preferences', () => {
    const setupStep4 = async () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      // Fill step 1
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Fill step 2
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/full name/i), {
          target: { value: 'John Doe' },
        });
        fireEvent.change(screen.getByLabelText(/bio/i), {
          target: { value: 'Test bio' },
        });
        fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      });

      // Fill step 3
      await waitFor(() => {
        const addSkillButton = screen.getByRole('button', {
          name: /add skill/i,
        });
        fireEvent.click(addSkillButton);
        fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      });
    };

    it('renders mentorship preferences', async () => {
      await setupStep4();

      await waitFor(() => {
        expect(screen.getByText(/mentorship preferences/i)).toBeInTheDocument();
        expect(
          screen.getByText(/willing to teach without expecting anything/i)
        ).toBeInTheDocument();
      });
    });

    it('submits form when create account is clicked', async () => {
      await setupStep4();

      await waitFor(() => {
        const createAccountButton = screen.getByRole('button', {
          name: /create account/i,
        });
        fireEvent.click(createAccountButton);
      });

      await waitFor(() => {
        expect(mockOnSignUp).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when provided', () => {
      const errorMessage = 'Registration failed';
      render(<SignUpForm onSignUp={mockOnSignUp} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('disables form when loading', () => {
      render(<SignUpForm onSignUp={mockOnSignUp} isLoading={true} />);

      expect(
        screen.getByRole('button', { name: /creating account/i })
      ).toBeDisabled();
    });
  });

  describe('Progress Indicator', () => {
    it('shows progress indicator after step 1', async () => {
      render(<SignUpForm onSignUp={mockOnSignUp} />);

      // Fill step 1 and proceed
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
        expect(screen.getByText(/profile info/i)).toBeInTheDocument();
      });
    });
  });
});
