import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Alert, Linking, Clipboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { likeImage, deleteImage } from '../lib/appwrite';

const ImageCard = ({ $id, title, imageUrl, creator, avatar, colors, likes, onDelete }) => {
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const animatedScale = useRef(new Animated.Value(1)).current;

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
              console.log("Image deleted successfully");
              onDelete();
            } catch (error) {
              console.error("Error deleting image:", error);
            }
          }
        }
      ]
    );
  };

  const reportImage = async (imageId, imageUrl) => {
    const email = 'support@puppypottypal.com'; // Your email address
    const subject = encodeURIComponent(`Report for Image ID: ${imageId}`);
    const body = encodeURIComponent(`I would like to report the following image:\n\nImage ID: ${imageId}\nReason: Inappropriate content\nImage URL: ${imageUrl}`);
    
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
    row: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: 12,
    },
    avatarContainer: {
      width: 46,
      height: 46,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    infoContainer: {
      justifyContent: 'center',
      flex: 1,
      marginLeft: 12,
      gap: 4,
    },
    title: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 16,
    },
    creator: {
      color: colors.primary,
      fontSize: 14,
    },
    imageContainer: {
      width: '100%',
      height: 240,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
    },
    image: {
      width: '100%',
      height: '100%',
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    button: {
      padding: 10,
      backgroundColor: colors.primary,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    buttonText: {
      color: '#fff',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <Image source={{uri: avatar}} style={styles.avatar} resizeMode='cover'/>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text> 
          <Text style={styles.creator} numberOfLines={1}>
            {creator}
          </Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl}}
          style={styles.image}
          resizeMode='cover'
        />
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleDelete} style={styles.button}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReport} style={styles.button}>
          <Text style={styles.buttonText}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImageCard;