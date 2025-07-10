import React from 'react';
import { Button } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export default function PaywallButton({
  title,
  onProPress, // function to call if user is subscribed
  offering, // optional: pass a specific offering
  requiredEntitlementIdentifier = 'Premium', // or 'Premium', etc.
  ...props
}) {
  const handlePress = async () => {
    // Show paywall, or do nothing if already subscribed
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier,
      offering,
    });

    if (
      paywallResult === PAYWALL_RESULT.PURCHASED ||
      paywallResult === PAYWALL_RESULT.RESTORED
    ) {
      // User is now pro, allow the action
      if (onProPress) onProPress();
    }
    // If already subscribed, presentPaywallIfNeeded will just return immediately and allow the action
    else if (paywallResult === PAYWALL_RESULT.NOT_PRESENTED) {
      // Already entitled, allow the action
      if (onProPress) onProPress();
    }
    // Otherwise, do nothing (user cancelled or error)
  };

  return (
    <Button title={title} onPress={handlePress} {...props} />
  );
} 