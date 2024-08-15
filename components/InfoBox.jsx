import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InfoBox = ({ title, subtitle, containerStyles, titleStyles, subtitleStyles, colors }) => {
  return (
    <View style={[styles.container, containerStyles]}>
      <Text style={[styles.title, { color: colors.text }, titleStyles]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.tint }, subtitleStyles]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 3,
  },
});

export default InfoBox