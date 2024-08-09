import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { getUserDogs, getDogToiletEvents, addToiletEvent } from '../lib/appwrite'; // Adjust path as needed
import { images } from '../constants';
const { width, height } = Dimensions.get('window');

const DogWithSpeechBubble = ({ isVisible, onClose, onAddTrip = [], message }) => {
  
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(animationValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 40,
      }).start();
    } else {
      Animated.spring(animationValue, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
        tension: 40,
      }).start();
    }
  }, [isVisible]);

  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, height - 200],
  });

  return (
    <Modal visible={isVisible} animationType="none" transparent={true}>
      <View style={styles.container}>
        <Animated.View style={[styles.dogContainer, { transform: [{ translateY }] }]}>
         
          <View style={styles.speechBubble}>
            
            <Text style={styles.speechText}>{message}</Text>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Image
            source={images.dog} 
            style={styles.dogImage}
          />
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dogContainer: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dogImage: {
    width: 200,
    height: 200,
    left: 155,
    top: 7,
    resizeMode: 'contain',
  },
  speechBubble: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    maxWidth: 220,
    right: 70,
  },
  speechText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DogWithSpeechBubble;