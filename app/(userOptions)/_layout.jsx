import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../config/theme';

const userOptionsLayout = () => {
  const { colors } = useTheme();

  return (
    <>
      <Stack>
        <Stack.Screen 
          name="analytics"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="family"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="faq"
          options={{
            headerShown: false
          }}
        />
    </Stack>
    <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>
    </>
  );
};

export default userOptionsLayout;
