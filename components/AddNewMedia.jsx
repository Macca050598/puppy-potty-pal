import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import CustomButton from './CustomButton.jsx';
import FormField from '../components/FormField.jsx';
import icons from '../constants/icons.js';

const AddToiletTrip = ({ isVisible, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    video: null,
    thumbnail: null,
    prompt: ''
  });

  const openPicker = async (selectType) => {
      
  }

  const submit = () => {
    // Implement submission logic
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          width: '90%',
          height: '90%',
          position: 'relative', // Required to position the close button
          marginBottom: 0,
        }}>
          
          {/* X button to close the modal */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 10,
              right: 15,
              padding: 5,
              zIndex: 10,
            }}
          >
            <Text style={{ fontSize: 32, fontWeight: 'bold' }}>x</Text>
          </TouchableOpacity>
          
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Upload a Video</Text>
          
          <FormField 
            title="Image Title"
            value={form.title}
            placeholder="Give your image a catchy title..."
            handleChangeText={(e) => setForm({ ...form, title: e })}
            otherStyles="mt-10"
          />

          <View className="mt-7 space-y-2">
            <Text className="text-base text-gray-100 font-pmedium">Upload Video</Text>
            <TouchableOpacity onPress={() => openPicker('video')}>
              {form.video ? (
                <Video
                  source={{ uri: form.video.uri }}
                  className="w-full h-64 rounded-2xl"
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              ) : (
                <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                  <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                    <Image 
                      source={icons.upload}
                      resizeMode='contain'
                      className="w-1/2 h-1/2"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-7 space-y-2">
            <Text className="text-base text-gray-100 font-pmedium">Thumbnail Image</Text>
            <TouchableOpacity onPress={() => openPicker('image')}>
              {form.thumbnail ? (
                <Image 
                  source={{ uri: form.thumbnail.uri }}
                  resizeMode='cover'
                  className="w-full h-64 rounded-2xl"
                />
              ) : (
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-back-200 flex-row space-x-2">
                  <Image 
                    source={icons.upload}
                    resizeMode='contain'
                    className="w-5 h-5"
                  />
                  <Text className="text-sm text-gray-100 font-pmedium">Choose a file</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <FormField 
            title="AI Prompt"
            value={form.prompt}
            placeholder="The Prompt you used to create this video"
            handleChangeText={(e) => setForm({ ...form, prompt: e })}
            otherStyles="mt-7"
          />
          
          <CustomButton 
            title="Submit & Publish"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={uploading}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AddToiletTrip;
