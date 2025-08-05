/**
 * @file MentorshipPreferencesForm.test.tsx
 * @description Unit tests for MentorshipPreferencesForm component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MentorshipPreferencesForm } from '../MentorshipPreferencesForm';

describe('MentorshipPreferencesForm', () => {
  const mockProps = {
    formData: {
      willingToTeachWithoutReturn: false,
    },
    isLoading: false,
    onFormDataChange: jest.fn(),
    onBack: jest.fn(),
    onContinue: jest.fn(),
    onSocialAuth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders mentorship preferences section', () => {
    render(<MentorshipPreferencesForm {...mockProps} />);

    expect(screen.getByText('Mentorship Preferences')).toBeInTheDocument();
    expect(
      screen.getByText(
        "I'm willing to teach without expecting anything in return"
      )
    ).toBeInTheDocument();
  });

  it('displays switch in unchecked state by default', () => {
    render(<MentorshipPreferencesForm {...mockProps} />);

    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).not.toBeChecked();
  });

  it('displays switch in checked state when willingToTeachWithoutReturn is true', () => {
    const propsWithChecked = {
      ...mockProps,
      formData: {
        willingToTeachWithoutReturn: true,
      },
    };

    render(<MentorshipPreferencesForm {...propsWithChecked} />);

    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).toBeChecked();
  });

  it('calls onFormDataChange when switch is toggled', () => {
    render(<MentorshipPreferencesForm {...mockProps} />);

    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);

    expect(mockProps.onFormDataChange).toHaveBeenCalledWith({
      ...mockProps.formData,
      willingToTeachWithoutReturn: true,
    });
  });

  it('calls onBack when back button is clicked', () => {
    render(<MentorshipPreferencesForm {...mockProps} />);

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('calls onContinue when continue button is clicked', () => {
    render(<MentorshipPreferencesForm {...mockProps} />);

    const continueButton = screen.getByText('Create Account');
    fireEvent.click(continueButton);

    expect(mockProps.onContinue).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    const propsWithLoading = {
      ...mockProps,
      isLoading: true,
    };

    render(<MentorshipPreferencesForm {...propsWithLoading} />);

    const continueButton = screen.getByText('Creating account...');
    expect(continueButton).toBeDisabled();
  });

  it('calls onSocialAuth when social auth buttons are clicked', () => {
    render(<MentorshipPreferencesForm {...mockProps} />);

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

    render(<MentorshipPreferencesForm {...propsWithLoading} />);

    const googleButton = screen.getByText('Google');
    const facebookButton = screen.getByText('Facebook');
    const appleButton = screen.getByText('Apple');

    expect(googleButton).toBeDisabled();
    expect(facebookButton).toBeDisabled();
    expect(appleButton).toBeDisabled();
  });

  it('maintains switch state when form data changes', () => {
    const { rerender } = render(<MentorshipPreferencesForm {...mockProps} />);

    let switchElement = screen.getByRole('checkbox');
    expect(switchElement).not.toBeChecked();

    // Update props with checked state
    const propsWithChecked = {
      ...mockProps,
      formData: {
        willingToTeachWithoutReturn: true,
      },
    };

    rerender(<MentorshipPreferencesForm {...propsWithChecked} />);

    switchElement = screen.getByRole('checkbox');
    expect(switchElement).toBeChecked();
  });
});
