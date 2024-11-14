import AsyncStorage from '@react-native-async-storage/async-storage';

const AD_FREQUENCY_KEY = 'last_interstitial_time';
const MIN_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const shouldShowAd = async () => {
  try {
    const lastShow = await AsyncStorage.getItem(AD_FREQUENCY_KEY);
    const now = Date.now();
    
    if (!lastShow || (now - parseInt(lastShow)) > MIN_INTERVAL) {
      await AsyncStorage.setItem(AD_FREQUENCY_KEY, now.toString());
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking ad frequency:', error);
    return false;
  }
}; 