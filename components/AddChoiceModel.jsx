import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ChoiceModal = ({ isVisible, onClose, onChooseToilet, onChooseEating, colors }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Event</Text>

              <TouchableOpacity 
                style={[styles.choiceButton, { backgroundColor: colors.primary }]}
                onPress={onChooseToilet}
              >
                <Feather name="target" size={24} color={colors.background} />
                <Text style={[styles.choiceButtonText, { color: colors.background }]}>Toilet Trip</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.choiceButton, { backgroundColor: colors.primary }]}
                onPress={onChooseEating}
              >
                <Feather name="coffee" size={24} color={colors.background} />
                <Text style={[styles.choiceButtonText, { color: colors.background }]}>Eating Event</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  choiceButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChoiceModal;
