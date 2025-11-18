
// Analytics and Ads Configuration
export const ANALYTICS_CONFIG = {
  // Điền GA4 Measurement ID (ví dụ: G-XXXXXXXXXX)
  GA_TRACKING_ID: '',
  
  // Điền AdSense Publisher ID (ví dụ: ca-pub-1234567890123456)
  ADSENSE_CLIENT_ID: '',
  
  // AdSense Slot IDs cho các vị trí quảng cáo khác nhau
  AD_SLOTS: {
    HEADER_BANNER: '',
    SIDEBAR: '',
    CONTENT_BANNER: '',
    FOOTER_BANNER: '',
  }
};

// Kiểm tra xem analytics có được bật hay không
export const isAnalyticsEnabled = () => {
  return Boolean(ANALYTICS_CONFIG.GA_TRACKING_ID);
};

// Kiểm tra xem ads có được bật hay không
export const isAdsEnabled = () => {
  return Boolean(ANALYTICS_CONFIG.ADSENSE_CLIENT_ID);
};
