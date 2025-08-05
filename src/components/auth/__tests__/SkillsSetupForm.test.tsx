/**
 * @file SkillsSetupForm.test.tsx
 * @description Unit tests for SkillsSetupForm component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SkillsSetupForm } from '../SkillsSetupForm';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock SkillInputComponent
jest.mock('@/components/ui/SkillInputComponent', () => ({
  SkillInputComponent: ({
    onAddSkill,
  }: {
    onAddSkill: (skill: any) => void;
  }) => (
    <button
      onClick={() =>
        onAddSkill({
          name: 'JavaScript',
          level: 'Intermediate',
          description: 'Web development',
        })
      }
    >
      Add Skill
    </button>
  ),
}));

describe('SkillsSetupForm', () => {
  const mockProps = {
    formData: {
      skillsToTeach: [],
    },
    validationErrors: {},
    isLoading: false,
    onFormDataChange: jest.fn(),
    onValidationErrorsChange: jest.fn(),
    onBack: jest.fn(),
    onContinue: jest.fn(),
    onSocialAuth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders skills section', () => {
    render(<SkillsSetupForm {...mockProps} />);

    expect(screen.getByText('Skills You Can Teach')).toBeInTheDocument();
    expect(screen.getByText('Add Skill to Teach')).toBeInTheDocument();
  });

  it('displays validation error when provided', () => {
    const propsWithError = {
      ...mockProps,
      validationErrors: {
        skillsToTeach: 'At least one skill is required',
      },
    };

    render(<SkillsSetupForm {...propsWithError} />);

    expect(
      screen.getByText('At least one skill is required')
    ).toBeInTheDocument();
  });

  it('displays added skills', () => {
    const propsWithSkills = {
      ...mockProps,
      formData: {
        skillsToTeach: [
          {
            name: 'JavaScript',
            level: 'Intermediate',
            description: 'Web development',
          },
          { name: 'Python', level: 'Advanced', description: 'Data science' },
        ],
      },
    };

    render(<SkillsSetupForm {...propsWithSkills} />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(
      screen.getByText('Intermediate • Web development')
    ).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Advanced • Data science')).toBeInTheDocument();
  });

  it('calls onFormDataChange when skill is added', () => {
    render(<SkillsSetupForm {...mockProps} />);

    const addSkillButton = screen.getByText('Add Skill');
    fireEvent.click(addSkillButton);

    expect(mockProps.onFormDataChange).toHaveBeenCalledWith({
      ...mockProps.formData,
      skillsToTeach: [
        {
          name: 'JavaScript',
          level: 'Intermediate',
          description: 'Web development',
        },
      ],
    });
  });

  it('calls onValidationErrorsChange when skill is added', () => {
    render(<SkillsSetupForm {...mockProps} />);

    const addSkillButton = screen.getByText('Add Skill');
    fireEvent.click(addSkillButton);

    expect(mockProps.onValidationErrorsChange).toHaveBeenCalled();
  });

  it('calls onFormDataChange when skill is removed', () => {
    const propsWithSkills = {
      ...mockProps,
      formData: {
        skillsToTeach: [
          {
            name: 'JavaScript',
            level: 'Intermediate',
            description: 'Web development',
          },
        ],
      },
    };

    render(<SkillsSetupForm {...propsWithSkills} />);

    const removeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(removeButton);

    expect(mockProps.onFormDataChange).toHaveBeenCalledWith({
      ...propsWithSkills.formData,
      skillsToTeach: [],
    });
  });

  it('calls onValidationErrorsChange when skill is removed', () => {
    const propsWithSkills = {
      ...mockProps,
      formData: {
        skillsToTeach: [
          {
            name: 'JavaScript',
            level: 'Intermediate',
            description: 'Web development',
          },
        ],
      },
    };

    render(<SkillsSetupForm {...propsWithSkills} />);

    const removeButton = screen.getByRole('button', { name: '' }); // X button
    fireEvent.click(removeButton);

    expect(mockProps.onValidationErrorsChange).toHaveBeenCalled();
  });

  it('calls onBack when back button is clicked', () => {
    render(<SkillsSetupForm {...mockProps} />);

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('calls onContinue when continue button is clicked', () => {
    render(<SkillsSetupForm {...mockProps} />);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(mockProps.onContinue).toHaveBeenCalled();
  });

  it('disables continue button when no skills are added', () => {
    render(<SkillsSetupForm {...mockProps} />);

    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when skills are added', () => {
    const propsWithSkills = {
      ...mockProps,
      formData: {
        skillsToTeach: [
          {
            name: 'JavaScript',
            level: 'Intermediate',
            description: 'Web development',
          },
        ],
      },
    };

    render(<SkillsSetupForm {...propsWithSkills} />);

    const continueButton = screen.getByText('Continue');
    expect(continueButton).not.toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    const propsWithLoading = {
      ...mockProps,
      isLoading: true,
    };

    render(<SkillsSetupForm {...propsWithLoading} />);

    const continueButton = screen.getByText('Creating account...');
    expect(continueButton).toBeDisabled();
  });

  it('calls onSocialAuth when social auth buttons are clicked', () => {
    render(<SkillsSetupForm {...mockProps} />);

    const googleButton = screen.getByText('Google');
    const facebookButton = screen.getByText('Facebook');
    const appleButton = screen.getByText('Apple');

    fireEvent.click(googleButton);
    expect(mockProps.onSocialAuth).toHaveBeenCalledWith('google');

    fireEvent.click(facebookButton);
    expect(mockProps.onSocialAuth).toHaveBeenCalledWith('facebook');

    fireEvent.click(appleButton);
    expect(mockProps.onSocialAuth).toHaveBeenCalledWith('apple');
  });

  it('disables social auth buttons when loading', () => {
    const propsWithLoading = {
      ...mockProps,
      isLoading: true,
    };

    render(<SkillsSetupForm {...propsWithLoading} />);

    const googleButton = screen.getByText('Google');
    const facebookButton = screen.getByText('Facebook');
    const appleButton = screen.getByText('Apple');

    expect(googleButton).toBeDisabled();
    expect(facebookButton).toBeDisabled();
    expect(appleButton).toBeDisabled();
  });
});
