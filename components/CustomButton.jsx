import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import React from 'react'
import { colors } from '../config/theme';

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading,}) => {
  return (
    <TouchableOpacity 
    onPress={handlePress}
    activeOpacity={0.7}
    style={[styles.button, containerStyles]}
    disabled={isLoading}
    > 

        <Text style={[styles.buttonText, textStyles]}>
            {title}
        </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFA86B',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // Default text color
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton