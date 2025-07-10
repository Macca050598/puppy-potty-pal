import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../config/theme';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Button } from 'react-native';
async function presentPaywall(offering = undefined) {
  const paywallResult = await RevenueCatUI.presentPaywall(
    offering ? { offering } : undefined
  );
  switch (paywallResult) {
    case PAYWALL_RESULT.NOT_PRESENTED:
    case PAYWALL_RESULT.ERROR:
    case PAYWALL_RESULT.CANCELLED:
      return false;
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return true;
    default:
      return false;
  }
}

const Subscriptions = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  const proAction = async () => {
    try {
      const success = await presentPaywall();
      if (success) {
        // Unlock pro features or show a success message
        console.log("Premium features unlocked!");
      } else {
        // Optionally handle cancellation or error
        console.log("Paywall not completed or cancelled.");
      }
    } catch (e) {
      console.error("Error showing paywall:", e);
    }
  };

  return (
    <AuthenticatedLayout>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Upgrade to Premium
        </Text>
        <Button title="Premium" onPress={proAction} />
      </View>
      <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>
    </AuthenticatedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
});

export default Subscriptions;