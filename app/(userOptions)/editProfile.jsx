import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasChanges = 
      username !== user.username ||
      email !== user.email ||
      avatar !== user.avatar;
    setIsFormChanged(hasChanges);
  }, [username, email, avatar, user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to your photo library to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('Image picker result:', result);

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        setAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!isFormChanged) return;

    if (!password) {
      Alert.alert('Error', 'Please enter your password to save changes.');
      return;
    }

    setIsLoading(true);
    try {
      let updatedUser = { ...user };

      if (avatar && avatar !== user.avatar) {
        console.log('Updating avatar with URI:', avatar);
        const avatarUrl = await updateUserAvatar(user.$id, avatar);
        console.log('Received avatar URL:', avatarUrl);
        updatedUser.avatar = avatarUrl;
      }

      if (username !== user.username) {
        updatedUser = await updateUserName(username);
      }

      if (email !== user.email) {
        updatedUser = await updateUserEmail(email, password);
      }

      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
      setPassword('');
      setIsFormChanged(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={pickImage}
            disabled={isLoading}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accent }]}>
                <Feather name="camera" size={40} color={colors.primary} />
              </View>
            )}
            <Text style={[styles.changeAvatarText, { color: colors.text }]}>
              Tap to change avatar
            </Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={username}
                onChangeText={setUsername}
                placeholderTextColor={colors.text}
                editable={!isLoading}
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
                editable={!isLoading}
                autoCapitalize="none"
              />
            </View>

            {isFormChanged && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Current Password (required to save changes)
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={colors.text}
                  editable={!isLoading}
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
                (!isFormChanged || isLoading) && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={!isFormChanged || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.white }]}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
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
  changeAvatarText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  saveButton: {
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EditProfile;