import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PredictionFeedback = ({ onFeedback, colors }) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    feedbackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 20,
    },
    feedbackText: {
      marginLeft: 5,
      color: colors.text,
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.feedbackButton, { backgroundColor: colors.success + '20' }]}
        onPress={() => onFeedback(true)}
      >
        <Feather name="check-circle" size={16} color={colors.success} />
        <Text style={styles.feedbackText}>Correct</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.feedbackButton, { backgroundColor: colors.error + '20' }]}
        onPress={() => onFeedback(false)}
      >
        <Feather name="x-circle" size={16} color={colors.error} />
        <Text style={styles.feedbackText}>Incorrect</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PredictionFeedback;