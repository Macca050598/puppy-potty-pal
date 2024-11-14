import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';

export default function PremiumScreen() {
  const { isPro, purchasePro } = useSubscription();

  const features = [
    'Add unlimited dogs',
    'Access detailed analytics',
    'AI-powered dog assistance',
    'Premium support',
    // Add more features
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      
      {features.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Text>✓ {feature}</Text>
        </View>
      ))}

      {!isPro && (
        <TouchableOpacity style={styles.upgradeButton} onPress={purchasePro}>
          <Text style={styles.buttonText}>Upgrade Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
} 