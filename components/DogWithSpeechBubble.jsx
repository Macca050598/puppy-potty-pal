import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DogWithSpeechBubble = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.speechBubble}>{message}</Text>
      {/* Your dog image or other elements */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  speechBubble: {
    // styling for the speech bubble
  },
});

export default DogWithSpeechBubble;
