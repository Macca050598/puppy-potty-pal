import React from 'react';
import { View } from 'react-native';
import GlobalDogPopup from '../context/GlobalDogPopup';
import { useGlobalContext } from '../context/GlobalProvider';

const AuthenticatedLayout = ({ children }) => {
  const { user } = useGlobalContext();

  if (!user) {
    return null; // or return a loading indicator
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      {/* <GlobalDogPopup /> */}
    </View>
  );
};

export default AuthenticatedLayout;