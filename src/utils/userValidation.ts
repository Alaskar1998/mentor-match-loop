// Centralized user validation utilities
export const DISABLED_USERNAMES = [
  'test',
  'demo',
  'admin',
  'moderator',
  'system',
  'blocked',
  'suspended',
  'banned',
  'restricted'
];

export const isSearchDisabled = (userName?: string): boolean => {
  if (!userName) return false;
  
  return DISABLED_USERNAMES.some(disabledName => 
    userName.toLowerCase().includes(disabledName.toLowerCase())
  );
};

export const isUserValid = (user: any): boolean => {
  return user && user.id && user.name && !isSearchDisabled(user.name);
};

export const canUserPerformAction = (user: any, action: string): boolean => {
  if (!isUserValid(user)) return false;
  
  // Add specific action validations here
  switch (action) {
    case 'search':
      return !isSearchDisabled(user.name);
    case 'send_invitation':
      return user.remainingInvites > 0;
    case 'premium_features':
      return user.userType === 'premium';
    default:
      return true;
  }
}; 