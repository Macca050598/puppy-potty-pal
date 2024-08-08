import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import CustomDropdown from './CustomDropdown.jsx';

const AddToiletTrip = ({ isVisible, onClose}) => {
  
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
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Add Toilet Trip</Text>
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
              onPress={onClose}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Add Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


export default AddToiletTrip;