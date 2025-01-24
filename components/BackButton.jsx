import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../config/theme';

const BackButton = () => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
      <Feather name="arrow-left" size={24} color={colors.text} />
      <Text style={[styles.buttonText, { color: colors.text }]}>Back</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BackButton; 