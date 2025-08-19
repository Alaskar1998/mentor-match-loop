// Simple service to track user upgrade interest
export interface UpgradeInterest {
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: string;
  plan: 'monthly' | 'yearly';
}

class UpgradeInterestService {
  private readonly STORAGE_KEY = 'maharat_hub_upgrade_interest';

  // Track when a user shows interest in upgrading
  trackInterest(userId: string, userEmail: string, userName: string, plan: 'monthly' | 'yearly'): void {
    try {
      const interest: UpgradeInterest = {
        userId,
        userEmail,
        userName,
        timestamp: new Date().toISOString(),
        plan
      };

      // Get existing interests
      const existing = this.getInterests();
      
      // Check if user already has an interest record
      const existingIndex = existing.findIndex(item => item.userId === userId);
      
      if (existingIndex >= 0) {
        // Update existing record
        existing[existingIndex] = interest;
        console.log('Updated existing upgrade interest for user:', userId);
      } else {
        // Add new record
        existing.push(interest);
        console.log('Added new upgrade interest for user:', userId);
      }

      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
      
      // Trigger a custom event to notify the admin dashboard to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('upgradeInterestChanged', {
          detail: { userId, plan, timestamp: interest.timestamp }
        }));
        console.log('Dispatched upgradeInterestChanged event');
      }
      
      console.log('Upgrade interest tracked successfully:', interest);
      console.log('Total interests in storage:', existing.length);
      console.log('Storage key used:', this.STORAGE_KEY);
    } catch (error) {
      console.error('Error tracking upgrade interest:', error);
    }
  }

  // Get all upgrade interests
  getInterests(): UpgradeInterest[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      console.log('Getting upgrade interests from storage key:', this.STORAGE_KEY);
      console.log('Raw stored value:', stored);
      const result = stored ? JSON.parse(stored) : [];
      console.log('Parsed result:', result);
      return result;
    } catch (error) {
      console.error('Error getting upgrade interests:', error);
      return [];
    }
  }

  // Check if a specific user has shown upgrade interest
  hasInterest(userId: string): boolean {
    const interests = this.getInterests();
    return interests.some(interest => interest.userId === userId);
  }

  // Get interest for a specific user
  getUserInterest(userId: string): UpgradeInterest | null {
    const interests = this.getInterests();
    const result = interests.find(interest => interest.userId === userId) || null;
    console.log(`Getting upgrade interest for user ${userId}:`, result);
    return result;
  }

  // Clear all interests (for testing/cleanup)
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('All upgrade interests cleared');
  }

  // Debug method to show current storage state
  debugStorage(): void {
    console.log('=== UpgradeInterestService Debug ===');
    console.log('Storage key:', this.STORAGE_KEY);
    const stored = localStorage.getItem(this.STORAGE_KEY);
    console.log('Raw stored value:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed interests:', parsed);
        console.log('Total interests:', parsed.length);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    } else {
      console.log('No data in storage');
    }
  }

  // Method to manually trigger refresh event for testing
  triggerRefresh(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upgradeInterestChanged', {
        detail: { manual: true, timestamp: new Date().toISOString() }
      }));
      console.log('Manually triggered upgradeInterestChanged event');
    }
  }
}

export const upgradeInterestService = new UpgradeInterestService();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.upgradeInterestService = upgradeInterestService;
}
