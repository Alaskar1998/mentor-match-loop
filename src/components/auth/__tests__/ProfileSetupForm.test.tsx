/**
 * @file ProfileSetupForm.test.tsx
 * @description Unit tests for ProfileSetupForm component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSetupForm } from '../ProfileSetupForm';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ProfileSetupForm', () => {
  const mockProps = {
    formData: {
      name: '',
      bio: '',
      age: '',
      gender: '',
      country: '',
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

  it('renders all form fields', () => {
    render(<ProfileSetupForm {...mockProps} />);

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByLabelText('Age Range')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });

  it('displays validation errors when provided', () => {
    const propsWithErrors = {
      ...mockProps,
      validationErrors: {
        name: 'Name is required',
        bio: 'Bio is required',
        age: 'Age is required',
        gender: 'Gender is required',
        country: 'Country is required',
      },
    };

    render(<ProfileSetupForm {...propsWithErrors} />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Bio is required')).toBeInTheDocument();
    expect(screen.getByText('Age is required')).toBeInTheDocument();
    expect(screen.getByText('Gender is required')).toBeInTheDocument();
    expect(screen.getByText('Country is required')).toBeInTheDocument();
  });

  it('calls onFormDataChange when name field changes', () => {
    render(<ProfileSetupForm {...mockProps} />);

    const nameInput = screen.getByLabelText('Full Name');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(mockProps.onFormDataChange).toHaveBeenCalledWith({
      ...mockProps.formData,
      name: 'John Doe',
    });
  });

  it('calls onFormDataChange when bio field changes', () => {
    render(<ProfileSetupForm {...mockProps} />);

    const bioTextarea = screen.getByLabelText('Bio');
    fireEvent.change(bioTextarea, { target: { value: 'Software developer' } });

    expect(mockProps.onFormDataChange).toHaveBeenCalledWith({
      ...mockProps.formData,
      bio: 'Software developer',
    });
  });

  it('calls onBack when back button is clicked', () => {
    render(<ProfileSetupForm {...mockProps} />);

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('calls onContinue when continue button is clicked', () => {
    render(<ProfileSetupForm {...mockProps} />);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(mockProps.onContinue).toHaveBeenCalled();
  });

  it('disables continue button when form is invalid', () => {
    render(<ProfileSetupForm {...mockProps} />);

    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when form is valid', () => {
    const validFormData = {
      name: 'John Doe',
      bio: 'Software developer',
      age: '25–34',
      gender: 'Male',
      country: 'United States',
    };

    const propsWithValidData = {
      ...mockProps,
      formData: validFormData,
    };

    render(<ProfileSetupForm {...propsWithValidData} />);

    const continueButton = screen.getByText('Continue');
    expect(continueButton).not.toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    const propsWithLoading = {
      ...mockProps,
      isLoading: true,
    };

    render(<ProfileSetupForm {...propsWithLoading} />);

    const continueButton = screen.getByText('Creating account...');
    expect(continueButton).toBeDisabled();
  });

  it('calls onSocialAuth when social auth buttons are clicked', () => {
    render(<ProfileSetupForm {...mockProps} />);

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

    render(<ProfileSetupForm {...propsWithLoading} />);

    const googleButton = screen.getByText('Google');
    const facebookButton = screen.getByText('Facebook');
    const appleButton = screen.getByText('Apple');

    expect(googleButton).toBeDisabled();
    expect(facebookButton).toBeDisabled();
    expect(appleButton).toBeDisabled();
  });
});
