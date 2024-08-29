import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import CustomButton from './CustomButton.jsx';
import FormField from '../components/FormField.jsx';
import icons from '../constants/icons.js';
import { router } from 'expo-router';
import { createImage } from '../lib/appwrite.js';
import {useGlobalContext} from '../context/GlobalProvider.js';
import * as ImagePicker from 'expo-image-picker';

const AddNewMedia = ({ isVisible, onClose, colors, onUploadSuccess }) => {
  const {user} = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    image: null
  });

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

  const submit = async () => {
    if(!form.title || !form.image || !form.prompt ) {
      return Alert.alert("Please fill in all the fields..")
    }

    setUploading(true)

    try {

      await createImage({...form, userId: user.$id})


      Alert.alert('Success', 'Post uploaded successfully!', [
        { text: 'OK', onPress: () => {
          onUploadSuccess(); // Trigger refresh in parent component
          onClose(); // Close the modal
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
        setForm({
          title: '',
          image: null,
          prompt: '',
        })

        setUploading(false)
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
      height: '65%',
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
      height: 160,
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
  });

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
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Uploading image...</Text>
            </View>
          ) : (
            <CustomButton 
              title="Submit & Publish"
              handlePress={submit}
              containerStyles={{ marginTop: 28 }}
              colors={colors}
              
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AddNewMedia;