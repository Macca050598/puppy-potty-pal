import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Button, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDog, getCurrentUser } from '../lib/appwrite'; // Adjust the import path as needed

const AddNewDog = ({ isVisible, onClose, onDogAdded }) => {
  const [newDogName, setNewDogName] = useState('');
  const [newDogBreed, setNewDogBreed] = useState('');
  const [newDogDOB, setNewDogDOB] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobError, setDobError] = useState('');

  const handleAddDog = async () => {
    try {
      // Validate and parse the date of birth
      const parsedDate = new Date(newDogDOB);
      if (isNaN(parsedDate.getTime())) {
        setDobError('Invalid date format.');
        return;
      }
      const formattedDate = parsedDate.toISOString();

      // Fetch the current user's ID
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.$id) {
        const userId = currentUser.$id; // Access the user ID

        // Add the new dog and link it to the current user
        const newDog = await addDog(userId, newDogName, newDogBreed, formattedDate, newDogDOB);
        onDogAdded(newDog);
        onClose();
        
        // Reset form
        setNewDogName('');
        setNewDogBreed('');
        setNewDogDOB('');
        setDobError('');
      } else {
        throw new Error('No current user found');
      }
    } catch (error) {
      console.error('Failed to add dog:', error);
      Alert.alert('Error', 'Failed to add dog. Please try again.');
    }
  };

  const onChangeDOB = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDogDOB(selectedDate.toISOString().split('T')[0]); // Format date to yyyy-MM-dd
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
     <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Black background with 30% opacity
      }}
    >
        <View className="bg-white p-5 rounded-lg w-4/5">
          <Text className="text-xl font-semibold mb-4">Add New Dog</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mb-4"
            placeholder="Dog Name"
            value={newDogName}
            onChangeText={setNewDogName}
          />
          <TextInput
            className="border border-gray-300 p-2 rounded mb-4"
            placeholder="Dog Breed"
            value={newDogBreed}
            onChangeText={setNewDogBreed}
          />
       
       <TouchableOpacity 
            onPress={() => setShowDatePicker(true)} 
            className="border border-gray-300 p-2 rounded mb-4"
          >
            <Text>{newDogDOB ? newDogDOB : 'Choose Date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(newDogDOB || Date.now())}
              mode="date"
              display="default"
              onChange={onChangeDOB}
            />
          )}
          {dobError ? (
            <Text className="text-red-500 mb-4">{dobError}</Text>
          ) : null}
          <View className="flex-row justify-around">
            <Button title="Cancel" onPress={onClose} />
            <Button title="Add Dog" onPress={handleAddDog} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddNewDog;
