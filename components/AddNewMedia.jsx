import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import CustomButton from './CustomButton.jsx';
import FormField from '../components/FormField.jsx';
import icons from '../constants/icons.js';

const AddNewMedia = ({ isVisible, onClose, colors }) => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    video: null,
    thumbnail: null,
    prompt: ''
  });

  const openPicker = async (selectType) => {
    // Implement picker logic  
  }

  const submit = () => {
    // Implement submission logic
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
      height: '90%',
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
      borderColor: colors.tint,
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
    },
    thumbnail: {
      width: '100%',
      height: 256,
      borderRadius: 16,
    },
  });

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>x</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Upload a Video</Text>
          
          <FormField 
            title="Image Title"
            value={form.title}
            placeholder="Give your image a catchy title..."
            handleChangeText={(e) => setForm({ ...form, title: e })}
            otherStyles={{ marginTop: 40 }}
            colors={colors}
          />

          <View style={{ marginTop: 28 }}>
            <Text style={styles.sectionTitle}>Upload Video</Text>
            <TouchableOpacity onPress={() => openPicker('video')}>
              {form.video ? (
                <Video
                  source={{ uri: form.video.uri }}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
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

          <View style={{ marginTop: 28 }}>
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
          </View>

          <FormField 
            title="AI Prompt"
            value={form.prompt}
            placeholder="The Prompt you used to create this video"
            handleChangeText={(e) => setForm({ ...form, prompt: e })}
            otherStyles={{ marginTop: 28 }}
            colors={colors}
          />
          
          <CustomButton 
            title="Submit & Publish"
            handlePress={submit}
            containerStyles={{ marginTop: 28 }}
            isLoading={uploading}
            colors={colors}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AddNewMedia;