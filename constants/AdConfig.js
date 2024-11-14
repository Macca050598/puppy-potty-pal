export const AD_IDS = {
  // Test IDs for development
  TEST_BANNER: 'ca-app-pub-3940256099942544/6300978111',
  TEST_INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  
  // Your real IDs for production
  PRODUCTION_BANNER: 'ca-app-pub-2129022223732244~2476814129',
  PRODUCTION_INTERSTITIAL: 'ca-app-pub-2129022223732244/9098062797',
};

// Helper to determine which IDs to use
export const getAdUnitID = (type) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  switch(type) {
    case 'banner':
      return isProduction ? AD_IDS.PRODUCTION_BANNER : AD_IDS.TEST_BANNER;
    case 'interstitial':
      return isProduction ? AD_IDS.PRODUCTION_INTERSTITIAL : AD_IDS.TEST_INTERSTITIAL;
    default:
      return null;
  }
}; 