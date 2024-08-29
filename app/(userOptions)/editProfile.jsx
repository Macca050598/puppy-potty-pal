import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../config/theme';
import { useGlobalContext } from '../../context/GlobalProvider';
import { updateUserName, updateUserEmail, updateUserAvatar } from '../../lib/appwrite';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';

const EditProfile = () => {
  const { colors } = useTheme();
  const { user, setUser } = useGlobalContext();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [password, setPassword] = useState('');
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    const hasChanges = 
      username !== user.username ||
      email !== user.email ||
      avatar !== user.avatar;
    setIsFormChanged(hasChanges);
  }, [username, email, avatar, user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password to save changes.');
      return;
    }
  
    try {
      let updatedUser = { ...user };
  
      // Only update username if it has changed
      if (username !== user.username) {
        updatedUser = await updateUserName(username);
      }
  
      // Only update email if it has changed
      if (email !== user.email) {
        updatedUser = await updateUserEmail(email, password);
      }
  
      // Only update avatar if it has changed
      if (avatar !== user.avatar) {
        const avatarUrl = await updateUserAvatar(user.$id, avatar);
        updatedUser.avatar = avatarUrl;
      }
  
      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
      setPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent }]}>
                <Feather name="camera" size={40} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={colors.text}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor={colors.text}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password (required to save changes)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.text}
              placeholder="Enter your password"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton, 
              { backgroundColor: (isFormChanged && password) ? colors.primary : colors.secondary }
            ]}
            onPress={handleSave}
            disabled={!isFormChanged || !password}
          >
            <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  saveButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;