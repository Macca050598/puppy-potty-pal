import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../config/theme';
import { useGlobalContext } from '../../context/GlobalProvider';
import { updateUserName, updateUserEmail, updateUserAvatar, deleteUserAccount } from '../../lib/appwrite';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { useRouter } from 'expo-router';

const EditProfile = () => {
  const { colors } = useTheme();
  const { user, setUser } = useGlobalContext();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [password, setPassword] = useState('');
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

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

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete my account') {
      Alert.alert('Error', 'Please type "delete my account" to confirm');
      return;
    }

    try {
      await deleteUserAccount();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
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

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

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

            <TouchableOpacity 
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Account</Text>
              <Text style={[styles.modalText, { color: colors.text }]}>
                This action cannot be undone. All your data will be permanently deleted.
                To confirm, please type "delete my account" below:
              </Text>
              
              <TextInput
                style={[styles.confirmInput, { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.card
                }]}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="Type 'delete my account'"
                placeholderTextColor={colors.text + '80'}
                autoCapitalize="none"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: colors.card }]}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setConfirmText('');
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: colors.error }]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  separator: {
    height: 1,
    marginVertical: 20,
  },
  deleteButton: {
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
});

export default EditProfile;