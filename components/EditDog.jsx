import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { manageDog } from '../lib/appwrite';
import { getAllBreeds, searchBreeds } from '../utils/DogBreedApi';
import { debounce } from 'lodash'; // Make sure to install lodash if not already in your project

const EditDog = ({ isVisible, onClose, onDogUpdated, onDogDeleted, dogId, colors, isOwnedByUser }) => {
  const [dogData, setDogData] = useState({
    name: '',
    breed: '',
    weight: '',
    dob: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [breeds, setBreeds] = useState([]);
  const [showBreedList, setShowBreedList] = useState(false);

  useEffect(() => {
    if (isVisible && dogId) {
      fetchDogData();
      loadBreeds();
    }
  }, [isVisible, dogId]);

  const fetchDogData = async () => {
    setIsLoading(true);
    try {
      const dogData = await manageDog('get', dogId);
      setDogData({
        name: dogData.name || '',
        breed: dogData.breed || '',
        weight: dogData.weight ? dogData.weight.toString() : '',
        dob: dogData.birthdate ? new Date(dogData.birthdate) : new Date(),
      });
    } catch (error) {
      console.error('Failed to fetch dog data:', error);
      Alert.alert('Error', 'Failed to load dog information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBreeds = async () => {
    try {
      const allBreeds = await getAllBreeds();
      setBreeds(allBreeds);
    } catch (error) {
      console.error('Failed to load breeds:', error);
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

  const handleUpdateDog = async () => {
    if (!isOwnedByUser) return;
    try {
      const updatedDog = await manageDog('update', dogId, {
        name: dogData.name,
        breed: dogData.breed,
        birthdate: dogData.dob.toISOString(),
        weight: parseInt(dogData.weight) || 0
      });
      onDogUpdated(updatedDog);
      onClose();
    } catch (error) {
      console.error('Failed to update dog:', error);
      Alert.alert('Error', 'Failed to update dog. Please try again.');
    }
  };

  const handleDeleteDog = async () => {
    if (!isOwnedByUser) return;
    Alert.alert(
      "Delete Dog",
      "Are you sure you want to delete this dog? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await manageDog('delete', dogId);
              onDogDeleted(dogId);
              onClose();
            } catch (error) {
              console.error('Failed to delete dog:', error);
              Alert.alert('Error', 'Failed to delete dog. Please try again.');
            }
          }
        }
      ]
    );
  };

  const onChangeDOB = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && isOwnedByUser) {
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      borderRadius: 5,
      padding: 10,
      width: '30%',
    },
    cancelButton: {
      backgroundColor: colors.secondary,
    },
    updateButton: {
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: 'red',
    },
    buttonText: {
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cancelButtonText: {
      color: colors.text,
    },
    actionButtonText: {
      color: colors.accent,
    },
    disabledInput: {
      opacity: 0.5,
    },
    ownershipNote: {
      color: colors.tint,
      fontStyle: 'italic',
      marginBottom: 10,
      textAlign: 'center',
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
    weightInput: {
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      color: colors.text,
    },
  });
if (isLoading) {
    return (
      <Modal visible={isVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{isOwnedByUser ? "Edit Dog" : "Dog Details"}</Text>
          
          {!isOwnedByUser && (
            <Text style={styles.ownershipNote}>This is a family dog. You cannot edit its details.</Text>
          )}

          <TextInput
            style={[styles.input, !isOwnedByUser && styles.disabledInput]}
            placeholder="Dog Name"
            value={dogData.name}
            onChangeText={(text) => setDogData(prev => ({ ...prev, name: text }))}
            editable={isOwnedByUser}
          />

          <TextInput
            style={[styles.input, !isOwnedByUser && styles.disabledInput]}
            placeholder="Search Dog Breed"
            value={dogData.breed}
            onChangeText={handleBreedSearch}
            onFocus={() => isOwnedByUser && setShowBreedList(true)}
            editable={isOwnedByUser}
          />

          {showBreedList && isOwnedByUser && (
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
            style={[styles.weightInput, !isOwnedByUser && styles.disabledInput]}
            placeholder="Dog Weight (kg)"
            value={dogData.weight}
            onChangeText={(text) => setDogData(prev => ({ ...prev, weight: text }))}
            keyboardType="numeric"
            editable={isOwnedByUser}
          />

          <Text style={[styles.datePickerText, { marginBottom: 5 }]}>Date of Birth:</Text>
          <TouchableOpacity 
            style={[styles.datePickerButton, !isOwnedByUser && styles.disabledInput]}
            onPress={() => isOwnedByUser && setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{dogData.dob.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && isOwnedByUser && (
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
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Close</Text>
            </TouchableOpacity>
            {isOwnedByUser && (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.updateButton]}
                  onPress={handleUpdateDog}
                >
                  <Text style={[styles.buttonText, styles.actionButtonText]}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteDog}
                >
                  <Text style={[styles.buttonText, styles.actionButtonText]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditDog;