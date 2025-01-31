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
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Service & User Agreement</Text>
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.text}>
              Welcome to Puppy Potty Pal. By using our app, you agree to the following terms:
            </Text>
            <Text style={styles.text}>
              1. Content Guidelines{'\n'}
              • Users may only share appropriate images of dogs{'\n'}
              • No explicit, violent, or inappropriate content{'\n'}
              • No harassment or abusive behavior{'\n'}
              • No spam or commercial content without authorization
            </Text>
            <Text style={styles.text}>
              2. Content Moderation{'\n'}
              • All content is subject to review{'\n'}
              • Users can report inappropriate content{'\n'}
              • Reported content will be reviewed within 24 hours{'\n'}
              • Users who violate guidelines may be suspended or banned
            </Text>
            <Text style={styles.text}>
              3. Zero Tolerance Policy{'\n'}
              • We maintain a zero-tolerance policy for objectionable content{'\n'}
              • Violators will be immediately removed from the platform{'\n'}
              • Reported content will be promptly removed if found to violate our terms
            </Text>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.declineButton]} 
              onPress={onDecline}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EULAModal;