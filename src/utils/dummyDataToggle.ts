// Utility to toggle dummy data for testing vs production
// Set this to false when ready for production

export const USE_DUMMY_DATA = true; // Set to false to disable dummy data

// Helper function to check if dummy data should be used
export const shouldUseDummyData = (): boolean => {
  return USE_DUMMY_DATA;
};

// Helper function to get environment-specific data source
export const getDataConfig = () => {
  if (USE_DUMMY_DATA) {
    return {
      useDummyProfiles: true,
      useDummyAds: true,
      loadingDelay: 1000, // 1 second delay for realistic feel
    };
  }
  
  return {
    useDummyProfiles: false,
    useDummyAds: false,
    loadingDelay: 0,
  };
};

// Console warning for production
if (USE_DUMMY_DATA) {
  console.warn('⚠️ DUMMY DATA ENABLED - Remember to set USE_DUMMY_DATA = false for production');
} 