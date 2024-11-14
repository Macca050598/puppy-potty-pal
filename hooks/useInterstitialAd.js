import { useEffect, useState } from 'react';
import { AdMobInterstitial } from 'expo-ads-admob';
import { getAdUnitID } from '../constants/AdConfig';

export const useInterstitialAd = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize interstitial
    AdMobInterstitial.setAdUnitID(getAdUnitID('interstitial'));
    loadAd();

    return () => {
      // Cleanup
      AdMobInterstitial.removeAllListeners();
    };
  }, []);

  const loadAd = async () => {
    try {
      await AdMobInterstitial.requestAdAsync();
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load interstitial ad:', error);
    }
  };

  const showAd = async () => {
    if (isLoaded) {
      try {
        await AdMobInterstitial.showAdAsync();
        setIsLoaded(false);
        // Load the next ad
        loadAd();
      } catch (error) {
        console.error('Failed to show interstitial ad:', error);
      }
    }
  };

  return { showAd, isLoaded };
}; 