// Simple service to track user upgrade interest
export interface UpgradeInterest {
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: string;
  plan: 'monthly' | 'yearly';
}

class UpgradeInterestService {
  private readonly STORAGE_KEY = 'maharat_hub_upgrade_interest_v2';
  private readonly OLD_STORAGE_KEY = 'maharat_hub_upgrade_interest';

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
      } else {
        // Add new record
        existing.push(interest);
      }

      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
      
      // Trigger a custom event to notify the admin dashboard to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('upgradeInterestChanged', {
          detail: { userId, plan, timestamp: interest.timestamp }
        }));
      }
    } catch (error) {
      console.error('Error tracking upgrade interest:', error);
    }
  }

  // Get all upgrade interests
  getInterests(): UpgradeInterest[] {
    try {
      // First, try to migrate data from old storage key
      this.migrateFromOldStorage();
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (!stored) {
        return [];
      }
      
      const result = JSON.parse(stored);
      return result;
    } catch (error) {
      console.error('Error getting upgrade interests:', error);
      return [];
    }
  }

  // Migrate data from old storage key to new one
  private migrateFromOldStorage(): void {
    try {
      const oldData = localStorage.getItem(this.OLD_STORAGE_KEY);
      if (oldData && !localStorage.getItem(this.STORAGE_KEY)) {
        // Copy data to new key
        localStorage.setItem(this.STORAGE_KEY, oldData);
      }
    } catch (error) {
      console.error('Error during migration:', error);
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
    return interests.find(interest => interest.userId === userId) || null;
  }

  // Clear all interests (for testing/cleanup)
  clearAll(): void {
    // Clear both old and new storage keys
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.OLD_STORAGE_KEY);
  }




}

export const upgradeInterestService = new UpgradeInterestService();
