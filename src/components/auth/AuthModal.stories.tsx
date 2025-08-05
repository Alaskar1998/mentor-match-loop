/**
 * @file AuthModal.stories.tsx
 * @description Storybook stories for AuthModal component
 */
import type { Meta, StoryObj } from '@storybook/react';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const meta: Meta<typeof AuthModal> = {
  title: 'Components/Auth/AuthModal',
  component: AuthModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive authentication modal with sign-in and multi-step sign-up flows.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls the visibility of the modal',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
  },
  decorators: [
    Story => {
      // Mock auth state for stories
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithProvider: jest.fn(),
        updateProfile: jest.fn(),
        isAuthenticated: false,
      });

      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
};

export const SignInTab: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the sign-in form with email and password fields.',
      },
    },
  },
};

export const SignUpTab: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the multi-step sign-up form with profile setup, skills, and preferences.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  decorators: [
    Story => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithProvider: jest.fn(),
        updateProfile: jest.fn(),
        isAuthenticated: false,
      });

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows loading state during authentication.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  decorators: [
    Story => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithProvider: jest.fn(),
        updateProfile: jest.fn(),
        isAuthenticated: false,
      });

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows error state when authentication fails.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Shows how the modal appears on mobile devices.',
      },
    },
  },
};

export const DarkTheme: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Shows the modal in dark theme.',
      },
    },
  },
};
