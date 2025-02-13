import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ResizeMode } from 'expo-av';
import CustomButton from './CustomButton.jsx';
import FormField from '../components/FormField.jsx';
import icons from '../constants/icons.js';
import { router } from 'expo-router';
import { createImage } from '../lib/appwrite.js';
import {useGlobalContext} from '../context/GlobalProvider.js';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';  // Make sure to install axios if you haven't already


const AddNewMedia = ({ isVisible, onClose, colors, onUploadSuccess, onRefresh }) => {
  const {user} = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    image: null,
    prompt: ''
  }); 
  const [eulaVisible, setEulaVisible] = useState(false);


  const openPicker = async (selectType) => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if(!result.canceled) {
      if(selectType === 'image') {
        setForm({ ...form, image: result.assets[0] })
      }
    }
  }
  const moderateImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('media', {
        uri: imageUri,
        type: 'image/jpeg', // or the appropriate MIME type
        name: 'upload.jpg'
      });
      formData.append('models', 'nudity-2.1,offensive-2.0,text-content,face-attributes,gore-2.0,self-harm');
      formData.append('api_user', '923154362');
      formData.append('api_secret', 'Z3fgC3ZokHsVs7xiWX7TCmrFonCEPVoN');

      const response = await axios({
        method: 'post',
        url: 'https://api.sightengine.com/1.0/check.json',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Check moderation results
      const result = response.data;
      
      // You can adjust these thresholds based on your needs
      if (
        result.nudity < 0.8 ||
        result.offensive > 0.7 ||
        result.gore > 0.7 ||
        result.self_harm > 0.7
      ) {
        return {
          isApproved: false,
          reason: 'Content violated community guidelines'
        };
      }

      return { isApproved: true };
    } catch (error) {
      console.error('Moderation error:', error);
      throw new Error('Image moderation failed');
    }
  };

const submit = async () => {
  if (!form.title || !form.image || !form.prompt) {
    return Alert.alert("Please fill in all the fields..");
  }
  setUploading(true);

  try {
    // Moderate the image first
    const moderationResult = await moderateImage(form.image.uri);
    
    if (!moderationResult.isApproved) {
      Alert.alert('Content Warning', moderationResult.reason);
      return;
    }

    // If moderation passes, proceed with the image upload
    await createImage({ ...form, userId: user.$id });

    Alert.alert('Success', 'Post uploaded successfully!, Please refresh the page.', [
      { text: 'OK', onPress: () => {
        onUploadSuccess();
        onClose();
      }}
    ]);
  } catch (error) {
    console.error('Upload error:', error);  // Add this for debugging
    Alert.alert('Error', error.message);
  } finally {
    setForm({
      title: '',
      image: null,
      prompt: '',
      likes: null
    });
    setUploading(false);
  }
};

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 20,
      width: '90%',
      height: '80%',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 15,
      padding: 5,
      zIndex: 10,
    },
    closeButtonText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      marginBottom: 8,
    },
    uploadContainer: {
      width: '100%',
      height: '70',
      padding: 16,
      backgroundColor: colors.secondary,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadIconContainer: {
      width: 56,
      height: 56,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.color,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadIcon: {
      width: '50%',
      height: '50%',
      tintColor: colors.tint,
    },
    thumbnailContainer: {
      width: '100%',
      height: 64,
      padding: 16,
      backgroundColor: colors.secondary,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.tint,
      flexDirection: 'row',
    },
    thumbnailText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
      marginLeft: 8,
    },
    video: {
      width: '100%',
      height: 256,
      borderRadius: 16,
      marginBottom: 10
    },
    thumbnail: {
      width: '100%',
      height: 256,
      borderRadius: 16,
    },
    loadingContainer: {
      alignItems: 'center',
      marginTop: 28,
    },
    loadingText: {
      marginTop: 10,
      color: colors.text,
      fontSize: 16,
    },
    eulaText: {
      marginTop: 10,
      color: colors.text,
      fontSize: 16,
      textAlign: 'center',
    },
    link: {
      color: colors.primary,
      fontSize: 16,
      textAlign: 'center',
      marginTop: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      padding: 15,
      borderRadius: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.background,
    },
    text: {
      marginTop: 10,
      color: colors.text,
      fontSize: 16,
    },
    emphasisText: {
      fontWeight: 'bold',
      color: colors.text,
    },
    bulletPoint: {
      marginLeft: 20,
      color: colors.text,
    },
  });

  const handleEulaAccept = () => {
    setEulaVisible(false);
    submit();
  };

  const handleEulaDecline = () => {
    setEulaVisible(false);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>x</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Upload a Image</Text>
          
          <FormField 
            title="Image Title"
            value={form.title}
            placeholder="Give your image a catchy title..."
            handleChangeText={(e) => setForm({ ...form, title: e })}
            otherStyles={{ marginTop: 0 }}
            colors={colors}
          />

          <FormField 
            title="Dog Breed"
            value={form.prompt}
            placeholder="Please enter the breed of dog..."
            handleChangeText={(e) => setForm({ ...form, prompt: e })}
            otherStyles={{ marginTop: 0 }}
            colors={colors}
          />
          <View style={{ marginTop: 0, marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Upload An Image</Text>
            <TouchableOpacity onPress={() => openPicker('image')}>
              {form.image ? (
                <Image
                  source={{ uri: form.image.uri }}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                />
              ) : (
                <View style={styles.uploadContainer}>
                  <View style={styles.uploadIconContainer}>
                    <Image 
                      source={icons.upload}
                      resizeMode='contain'
                      style={styles.uploadIcon}
                      
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* <View style={{ marginTop: 28 }}>
            <Text style={styles.sectionTitle}>Thumbnail Image</Text>
            <TouchableOpacity onPress={() => openPicker('image')}>
              {form.thumbnail ? (
                <Image 
                  source={{ uri: form.thumbnail.uri }}
                  resizeMode='cover'
                  style={styles.thumbnail}
                />
              ) : (
                <View style={styles.thumbnailContainer}>
                  <Image 
                    source={icons.upload}
                    resizeMode='contain'
                    style={styles.uploadIcon}
                  />
                  <Text style={styles.thumbnailText}>Choose a file</Text>
                </View>
              )}
            </TouchableOpacity>
          </View> */}
          
          {uploading ? (
              <View style={styles.loadingContainer}>
              <ActivityIndicator size="25" color={colors.primary} />
              <Text style={styles.loadingText}>Uploading image...</Text>
            </View>
          ) : (
            <CustomButton 
              title="Submit & Publish"
              handlePress={() => setEulaVisible(true)}
              containerStyles="bg-primary rounded-lg p-3"
              colors={colors}
            />
          )}

          <Text style={styles.eulaText}>
            By uploading this photo, I abide by the Puppy Potty Pals EULA Terms.
          </Text>
          <TouchableOpacity onPress={() => setEulaVisible(true)}>
            <Text style={styles.link}>View EULA</Text>
          </TouchableOpacity>

          <Modal visible={eulaVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  <Text style={styles.title}>Content Upload Agreement</Text>
                  <Text style={styles.text}>
                    Before uploading your image, please confirm that your content meets our community guidelines:
                  </Text>
                  <Text style={styles.emphasisText}>I confirm that this image:</Text>
                  <Text style={styles.bulletPoint}>• Contains only appropriate images of dogs</Text>
                  <Text style={styles.bulletPoint}>• Does not contain any explicit, violent, or inappropriate content</Text>
                  <Text style={styles.bulletPoint}>• Does not violate any copyright or intellectual property rights</Text>
                  <Text style={styles.bulletPoint}>• Does not contain any personally identifiable information</Text>
                  <Text style={styles.bulletPoint}>• Complies with all app terms and community guidelines</Text>
                  <Text style={styles.text}>
                    By proceeding with the upload, you acknowledge that:
                  </Text>
                  <Text style={styles.bulletPoint}>• Your content may be reviewed by our moderation team</Text>
                  <Text style={styles.bulletPoint}>• Content violating our terms will be removed</Text>
                  <Text style={styles.bulletPoint}>• Repeated violations may result in account suspension</Text>
                  <Text style={styles.bulletPoint}>• You are granting us license to store and display this content</Text>
                  <Text style={styles.emphasisText}>
                    Violation of these terms may result in content removal and account penalties.
                  </Text>
                </ScrollView>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: colors.text }]} 
                    onPress={handleEulaDecline}
                  >
                    <Text style={styles.buttonText}>Cancel Upload</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, { backgroundColor: colors.primary }]} 
                    onPress={handleEulaAccept}
                  >
                    <Text style={styles.buttonText}>I Agree & Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

export default AddNewMedia;
