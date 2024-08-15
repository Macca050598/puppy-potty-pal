import { View, Text } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const SearchLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen 
          name="[query]"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      <StatusBar backgroundColor='#161622' style="light" />
    </>
  );
};

export default SearchLayout;
