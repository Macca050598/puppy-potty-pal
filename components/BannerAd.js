// import { AdMobInterstitial } from 'react-native-google-mobile-ads';
import { View } from 'react-native';
import { AdMobBanner, BannerAdSize } from 'expo-ads-admob';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/2934735716'; // iOS test banner ID
const PRODUCTION_BANNER = 'ca-app-pub-2129022223732244~2476814129';

export function AdBanner() {
  return (
    <View className="w-full items-center">
      <AdMobBanner
        unitId={PRODUCTION_BANNER}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Ad failed to load:', error);
        }}
      />
    </View>
  );
}