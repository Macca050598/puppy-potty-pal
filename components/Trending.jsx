import React, { useState, useRef } from "react";
import { ResizeMode, Video } from "expo-av";
import { Feather } from '@expo/vector-icons';
import { likeVideo } from '../lib/appwrite';
import * as Animatable from "react-native-animatable";
import {
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  View,
  Text, Animated
} from "react-native";

import { icons } from "../constants";

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

const TrendingItem = ({ activeItem, item, colors, likes, $id }) => {
  const [play, setPlay] = useState(false);
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const animatedScale = useRef(new Animated.Value(1)).current;
  const handleLike = async () => {
    console.log('Toggling like for video with id:', $id);
    try {
      const result = await likeVideo($id);
      console.log('Like result:', result);
      
      // Toggle the like state
      setIsLiked(!isLiked);
      
      // Update the like count based on whether we're liking or unliking
      setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      
      // Animate the heart
      Animated.sequence([
        Animated.timing(animatedScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(animatedScale, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start();
    } catch (error) {
      console.error("Error toggling like for video:", error);
    }
  };

  const heartColor = isLiked ? 'red' : 'white';
  const styles = StyleSheet.create({
    container: {
      marginRight: 20,
    },
    video: {
      width: 208,
      height: 288,
      borderRadius: 33,
      marginTop: 12,
      backgroundColor: `${colors.secondary}20`,
    },
    touchable: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageBackground: {
      width: 208,
      height: 288,
      borderRadius: 33,
      marginVertical: 20,
      overflow: 'hidden',
    },
    playIcon: {
      width: 48,
      height: 48,
      position: 'absolute',
      tintColor: colors.primary,
    },
    likeContainer: {
      position: 'absolute',
      bottom: 2,
      right: 18,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 12,
      padding: 4,
    },
    likeIcon: {
      width: 15,
      height: 15,
      tintColor: 'white',
    },
    likeCount: {
      marginRight: 5,
      marginLeft: 5,
      color: 'white',
      fontSize: 13,
    },
  });

  return (
    <Animatable.View
      style={styles.container}
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <Video
          source={{ uri: item.video }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          style={styles.touchable}
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{
              uri: item.thumbnail,
            }}
            style={styles.imageBackground}
            resizeMode="cover"
          >
            <View style={{ flex: 1, backgroundColor: `${colors.secondary}40` }} />
          </ImageBackground>

          <Image
            source={icons.play}
            style={styles.playIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
       <TouchableOpacity onPress={handleLike} style={styles.likeContainer}>
        <Animated.View style={[styles.likeIcon, { transform: [{ scale: animatedScale }] }]}>
          <Feather name="heart" size={15} color={heartColor} />
        </Animated.View>
        <Text style={styles.likeCount}>{likeCount}</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const Trending = ({ posts, colors }) => {
  const [activeItem, setActiveItem] = useState(posts[0]?.$id);

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item.$id);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} colors={colors} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
    />
  );
};

export default Trending;