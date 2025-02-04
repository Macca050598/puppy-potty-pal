import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../config/theme';

const EULAModal = ({ visible, onAccept, onDecline }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    content: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 20,
      maxHeight: '80%',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: colors.text,
    },
    scrollContent: {
      marginBottom: 20,
    },
    text: {
      color: colors.text,
      marginBottom: 10,
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      padding: 15,
      borderRadius: 8,
      flex: 0.48,
      alignItems: 'center',
    },
    acceptButton: {
      backgroundColor: colors.primary,
    },
    declineButton: {
      backgroundColor: colors.text,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    emphasisText: {
      fontWeight: '600',
      color: colors.text,
      marginVertical: 10,
    }
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Service & User Agreement</Text>
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.text}>
              Welcome to Puppy Potty Pal. By using our app, you must read and agree to the following terms. These terms constitute a legally binding agreement between you and Puppy Potty Pal.
            </Text>

            <Text style={styles.emphasisText}>
              BY ACCEPTING THESE TERMS, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT.
            </Text>

            <Text style={styles.text}>
              1. Content Guidelines and Prohibited Content{'\n'}
              • Users may only share appropriate images of dogs{'\n'}
              • Strictly prohibited content includes but is not limited to:{'\n'}
                - Explicit, violent, or inappropriate content{'\n'}
                - Harassment or abusive behavior{'\n'}
                - Hate speech or discriminatory content{'\n'}
                - Spam or unauthorized commercial content{'\n'}
                - Content that violates any laws or regulations{'\n'}
                - Content that infringes on intellectual property rights
            </Text>

            <Text style={styles.text}>
              2. Content Moderation and Enforcement{'\n'}
              • All user-generated content is subject to review{'\n'}
              • We reserve the right to remove any content that violates our terms{'\n'}
              • Users can and should report inappropriate content{'\n'}
              • Reported content will be reviewed within 24 hours{'\n'}
              • We maintain logs of reported content and actions taken{'\n'}
              • Users who violate guidelines will face consequences including:{'\n'}
                - Content removal{'\n'}
                - Account suspension{'\n'}
  