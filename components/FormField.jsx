import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../config/theme';
import { icons } from '../constants';

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
      ...otherStyles,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'pmedium',
      marginBottom: 8,
    },
    inputContainer: {
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
      height: 56,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      color: colors.text,
      fontFamily: 'psemibold',
      fontSize: 16,
    },
    icon: {
      width: 24,
      height: 24,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>

      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholderText}
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
          {...props}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image 
              source={!showPassword ? icons.eye : icons.eyehide} 
              style={styles.icon} 
              resizeMode='contain'
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;