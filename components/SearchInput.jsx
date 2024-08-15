import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { icons } from '../constants';

const SearchInput = ({ initialQuery, colors }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || "");

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 64,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.text,
    },
    input: {
      flex: 1,
      fontSize: 16,
      marginTop: 2,
      color: colors.text,
      fontWeight: '400',
    },
    searchIcon: {
      width: 20,
      height: 20,
      tintColor: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        placeholder="Search for a breed of dog"
        placeholderTextColor={colors.text}
        onChangeText={(e) => setQuery(e)}
      />

      <TouchableOpacity
        onPress={() => {
          if (query === "")
            return Alert.alert(
              "Missing Query",
              "Please input something to search results across database"
            );

          if (pathname.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image source={icons.search} style={styles.searchIcon} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;