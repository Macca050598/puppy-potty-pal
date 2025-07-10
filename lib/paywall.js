import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export async function showPaywallIfNeeded({ requiredEntitlementIdentifier = 'Premium', offering }) {
  const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier,
    offering,
  });

  return (
    paywallResult === PAYWALL_RESULT.PURCHASED ||
    paywallResult === PAYWALL_RESULT.RESTORED ||
    paywallResult === PAYWALL_RESULT.NOT_PRESENTED
  );
} 