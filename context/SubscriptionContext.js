// import { createContext, useState, useContext, useEffect } from 'react';
// import Purchases from 'react-native-purchases';

// const SubscriptionContext = createContext();

// export function SubscriptionProvider({ children }) {
//   const [isPro, setIsPro] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Initialize RevenueCat
//     Purchases.configure({
//       apiKey: 'YOUR_REVENUECAT_API_KEY'
//     });
    
//     checkSubscriptionStatus();
//   }, []);

//   const checkSubscriptionStatus = async () => {
//     try {
//       const customerInfo = await Purchases.getCustomerInfo();
//       // Check if user has active pro subscription
//       setIsPro(customerInfo.entitlements.active['pro_features'] !== undefined);
//     } catch (error) {
//       console.error('Error checking subscription:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const purchasePro = async () => {
//     try {
//       const offerings = await Purchases.getOfferings();
//       if (offerings.current !== null) {
//         const purchase = await Purchases.purchasePackage(offerings.current.available[0]);
//         setIsPro(purchase.customerInfo.entitlements.active['pro_features'] !== undefined);
//       }
//     } catch (error) {
//       console.error('Error making purchase:', error);
//     }
//   };

//   return (
//     <SubscriptionContext.Provider value={{ isPro, isLoading, purchasePro, checkSubscriptionStatus }}>
//       {children}
//     </SubscriptionContext.Provider>
//   );
// }

// export const useSubscription = () => useContext(SubscriptionContext); 