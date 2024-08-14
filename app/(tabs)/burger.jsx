import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { signOut } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';

const OptionItem = ({ icon, title, onPress, textColor = '#333' }) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <Feather name={icon} size={24} color={textColor} />
    <Text style={[styles.optionText, { color: textColor }]}>{title}</Text>
    <Feather name="chevron-right" size={24} color="#ccc" />
  </TouchableOpacity>
);

const Profile = () => {
  const { user } = useGlobalContext();

  const handleOptionPress = (option) => {
    console.log(`${option} pressed`);
    // Add navigation or action logic here
  };

  const logout = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const options = [
    { icon: "edit", title: "Edit User", onPress: () => handleOptionPress("Edit User"), textColor: '#FFF' },
    { icon: "star", title: "Feature Request", onPress: () => handleOptionPress("Feature Request"), textColor: '#FFF' },
    { icon: "alert-circle", title: "Report a Bug", onPress: () => handleOptionPress("Report a Bug"), textColor: '#FFF' },
    { icon: "help-circle", title: "FAQ", onPress: () => handleOptionPress("FAQ"), textColor: '#FFF' },
    { icon: "log-out", title: "Logout", onPress: logout, textColor: '#FF3B30' }
  ];

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={styles.container}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.username || 'User Name'}</Text>
            <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>

        <FlatList
          data={options}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <OptionItem
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
              textColor={item.textColor}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#161622',
    marginBottom: 20,
    color: '#FFF'
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#161622',
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
});

export default Profile;