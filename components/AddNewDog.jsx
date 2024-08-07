import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDog, getCurrentUser } from '../lib/appwrite'; // Adjust the import path as needed

const AddNewDog = ({ isVisible, onClose, onDogAdded }) => {
  const [newDogName, setNewDogName] = useState('');
  const [newDogBreed, setNewDogBreed] = useState('');
  const [newDogDOB, setNewDogDOB] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobError, setDobError] = useState('');

  const handleAddDog = async () => {
    try {
      const formattedDate = newDogDOB.toISOString();
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.$id) {
        const userId = currentUser.$id;
        const newDog = await addDog(userId, newDogName, newDogBreed, formattedDate);
        onDogAdded(newDog);
        onClose();
        setNewDogName('');
        setNewDogBreed('');
        setNewDogDOB(new Date());
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
      setNewDogDOB(selectedDate);
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          width: '80%',
          maxWidth: 300,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Add New Dog</Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Dog Name"
            value={newDogName}
            onChangeText={setNewDogName}
          />

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Dog Breed"
            value={newDogBreed}
            onChangeText={setNewDogBreed}
          />

          <Text style={{ marginBottom: 5 }}>Date of Birth:</Text>
          <TouchableOpacity 
            style={{ 
              borderWidth: 1, 
              borderColor: '#ccc', 
              borderRadius: 5, 
              padding: 10, 
              marginBottom: 15 
            }}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{newDogDOB.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={newDogDOB}
              mode="date"
              display="default"
              onChange={onChangeDOB}
            />
          )}

          {dobError ? (
            <Text style={{ color: 'red', marginBottom: 15 }}>{dobError}</Text>
          ) : null}

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
          }}>
            <TouchableOpacity 
              style={{
                borderRadius: 5,
                padding: 10,
                backgroundColor: '#ccc',
                width: '45%',
              }} 
              onPress={onClose}
            >
              <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{
                borderRadius: 5,
                padding: 10,
                backgroundColor: '#FF9C01',
                width: '45%',
              }} 
              onPress={handleAddDog}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Add Dog</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddNewDog;