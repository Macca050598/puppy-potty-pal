import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getCurrentUserDogs, getDogEvents, addToiletEvent } from '../lib/appwrite'; // Adjust path as needed



// Custom Drop down
const CustomDropdown = ({ options, selectedValue, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <View style={{ marginBottom: 15 }}>
        <Text style={{ marginBottom: 5 }}>{label}:</Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 10,
            backgroundColor: 'white',
          }}
          onPress={() => setIsOpen(true)}
        >
          <Text>{options.find(opt => opt.value === selectedValue)?.label || 'Select'}</Text>
        </TouchableOpacity>
        <Modal visible={isOpen} transparent animationType="fade">
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 10,
              width: '80%',
              maxHeight: '50%',
            }}>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                    onPress={() => {
                      onSelect(item.value);
                      setIsOpen(false);
                    }}
                  >
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
  
              
            </View>
          </View>
        </Modal>
      </View>
    );
  };
export default CustomDropdown;