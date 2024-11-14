// import { useSubscription } from '../context/SubscriptionContext';
// import { Alert } from 'react-native';

// export const usePremiumFeature = () => {
//   const { isPro, purchasePro } = useSubscription();

//   const requirePremium = (callback) => {
//     if (isPro) {
//       return callback();
//     }
    
//     Alert.alert(
//       'Premium Feature',
//       'This feature requires a premium subscription. Would you like to upgrade?',
//       [
//         { text: 'Not Now', style: 'cancel' },
//         { text: 'Upgrade', onPress: purchasePro }
//       ]
//     );
//   };

//   return { requirePremium };
// }; 