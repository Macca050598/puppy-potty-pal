import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { likeImage } from '../lib/appwrite';

const ImageCard = ({ $id, title, imageUrl, creator, avatar, colors, likes }) => {
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
    </View>
  );
};

export default ImageCard;