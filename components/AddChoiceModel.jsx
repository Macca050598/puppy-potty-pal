import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDog, getCurrentUser } from '../lib/appwrite';
import { getAllBreeds, searchBreeds } from '../utils/DogBreedApi';
import { Feather } from '@expo/vector-icons';
const ChoiceModal = ({ isVisible, onClose, onChooseToilet, onChooseEating, colors }) => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
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
        </View>
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