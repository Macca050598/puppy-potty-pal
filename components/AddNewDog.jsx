import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDog, getCurrentUser } from '../lib/appwrite';
import { getAllBreeds, searchBreeds } from '../utils/DogBreedApi';
import { debounce } from 'lodash'; // Make sure to install lodash if not already in your project

const AddNewDog = ({ isVisible, onClose, onDogAdded, colors }) => {
  const [dogData, setDogData] = useState({
    name: '',
    breed: '',
    weight: '',
    dob: new Date()
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [breeds, setBreeds] = useState([]);
  const [showBreedList, setShowBreedList] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadBreeds();
    }
  }, [isVisible]);

  const loadBreeds = async () => {
    try {
      const allBreeds = await getAllBreeds();
      setBreeds(allBreeds);
    } catch (error) {
      console.error('Failed to load breeds:', error);
      Alert.alert('Error', 'Failed to load dog breeds. Please try again.');
    }
  };

  const debouncedSearchBreeds = useCallback(
    debounce(async (query) => {
      if (query.length > 2) {
        try {
          const searchResults = await searchBreeds(query);
          setBreeds(searchResults);
        } catch (error) {
          console.error('Failed to search breeds:', error);
        }
      } else if (query.length === 0) {
        loadBreeds();
      }
    }, 300),
    []
  );

  const handleBreedSearch = (query) => {
    setDogData(prev => ({ ...prev, breed: query }));
    debouncedSearchBreeds(query);
    setShowBreedList(true);
  };

  const selectBreed = (breed) => {
    setDogData(prev => ({ ...prev, breed: breed.name }));
    setShowBreedList(false);
  };

  const handleAddDog = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.$id) {
        const newDog = await addDog(
          currentUser.$id,
          dogData.name,
          dogData.breed,
          dogData.dob.toISOString(),
          parseInt(dogData.weight) || 0
        );
        onDogAdded(newDog);
        resetForm();
        onClose();
      } else {
        throw new Error('No current user found');
      }
    } catch (error) {
      console.error('Failed to add dog:', error);
      Alert.alert('Error', 'Failed to add dog. Please try again.');
    }
  };

  const resetForm = () => {
    setDogData({
      name: '',
      breed: '',
      weight: '',
      dob: new Date()
    });
  };

  const onChangeDOB = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDogData(prev => ({ ...prev, dob: selectedDate }));
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 20,
      width: '80%',
      maxWidth: 300,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      color: colors.text,
    },
    datePickerButton: {
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
    },
    datePickerText: {
      color: colors.text,
    },
    errorText: {
      color: 'red',
      marginBottom: 15,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      borderRadius: 5,
      padding: 10,
      width: '45%',
    },
    cancelButton: {
      backgroundColor: colors.secondary,
    },
    addButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cancelButtonText: {
      color: colors.text,
    },
    addButtonText: {
      color: colors.accent,
    },
    breedList: {
      maxHeight: 150,
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 5,
      marginBottom: 15,
    },
    breedItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.tint,
      color: colors.text,
    },
  });

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add New Dog</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Dog Name"
            value={dogData.name}
            onChangeText={(text) => setDogData(prev => ({ ...prev, name: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Search Dog Breed"
            value={dogData.breed}
            onChangeText={handleBreedSearch}
            onFocus={() => setShowBreedList(true)}
          />

          {showBreedList && (
            <FlatList
              data={breeds}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectBreed(item)}>
                  <Text style={styles.breedItem}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={styles.breedList}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Dog Weight (kg)"
            value={dogData.weight}
            onChangeText={(text) => setDogData(prev => ({ ...prev, weight: text }))}
            keyboardType="numeric"
          />

          <Text style={[styles.datePickerText, { marginBottom: 5 }]}>Date of Birth:</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{dogData.dob.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dogData.dob}
              mode="date"
              display="default"
              onChange={onChangeDOB}
              textColor={colors.text}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.addButton]}
              onPress={handleAddDog}
            >
              <Text style={[styles.buttonText, styles.addButtonText]}>Add Dog</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddNewDog;