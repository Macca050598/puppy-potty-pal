import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Alert, Linking, Clipboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { likeImage, deleteImage } from '../lib/appwrite';
import { useGlobalContext } from '../context/GlobalProvider';
const ImageCard = ({ $id, title, imageUrl, creator, avatar, colors, likes, onDelete, onClose }) => {
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const animatedScale = useRef(new Animated.Value(1)).current;
  const {user} = useGlobalContext();

  const handleLike = async () => {
    try {
      await likeImage($id);
      setIsLiked(!isLiked);
      setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      
      Animated.sequence([
        Animated.timing(animatedScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(animatedScale, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start();
    } catch (error) {
      console.error("Error liking image:", error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
            try {
              await deleteImage($id);
              Alert.alert('Success', 'Image deleted successfully!', [
                { text: 'OK', onPress: () => {
                  
                }}
              ]);
              
             
            } catch (error) {
              console.error("Error deleting image:", error);
            }
          }
        }
      ]
    );
  };

  const reportImage = async (imageUrl, $id) => {
    const email = 'support@puppypottypal.com'; // Your email address
    const subject = encodeURIComponent(`Report for Image ID: ${imageUrl}`);
    const body = encodeURIComponent(`I would like to report the following image:\n\nImage ID: \n ${imageUrl}\nReason: Please state the reason as to why you want to report this image\nImage URL: ${$id}`);
    
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        throw new Error("Email client not available");
      }
    } catch (error) {
      console.error("Error opening email client:", error);
      Alert.alert(
        "Can't Open Email",
        `We couldn't open your email client. Would you like to copy the support email address (${email}) to your clipboard instead?`,
        [
          { text: "No", style: "cancel" },
          { 
            text: "Yes, Copy Email", 
            onPress: () => {
              Clipboard.setString(email);
              Alert.alert("Email Copied", `The support email (${email}) has been copied to your clipboard.`);
            }
          }
        ]
      );
    }
  };

  const handleReport = async () => {
    Alert.alert(
      "Report Image",
      "Are you sure you want to report this image?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => {
            reportImage($id, imageUrl);
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 24,
      backgroundColor: colors.background,
    },
    imageContainer: {
      width: '100%',
      height: 240,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      padding: 5,
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      textAlign: 'center',
    },
    likeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    likeIcon: {
      marginRight: 5,
    },
    likeCount: {
      color: colors.text,
      fontSize: 14,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode='cover'
        />
        <View style={styles.buttonContainer}>
         {/* {console.log(creator)}
         {console.log(user.username)} */}
        {creator === user.username && ( // Only show delete button if the user is the creator
            <TouchableOpacity onPress={handleDelete} style={styles.button}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleReport} style={styles.button}>
            <Text style={styles.buttonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleLike} style={styles.likeContainer}>
        <Animated.View style={[styles.likeIcon, { transform: [{ scale: animatedScale }] }]}>
          <Feather 
            name={isLiked ? "heart" : "heart"} 
            size={24} 
            color={isLiked ? 'red' : colors.text} 
          />
        </Animated.View>
        <Text style={styles.likeCount}>{likeCount}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImageCard;