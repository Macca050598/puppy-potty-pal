import React, { useState, useRef } from "react";
import * as Animatable from "react-native-animatable";
import {
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Animated
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { likeImage } from '../lib/appwrite';

const zoomIn = {
  0: { scale: 0.9 },
  1: { scale: 1 },
};

const zoomOut = {
  0: { scale: 1 },
  1: { scale: 0.9 },
};

const TrendingItem = ({ activeItem, item, colors }) => {
  const [likeCount, setLikeCount] = useState(item.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const animatedScale = useRef(new Animated.Value(1)).current;

  const handleLike = async () => {
    try {
      if (!item.$id) {
        console.error("No image ID provided for like action");
        return;
      }
      
      const result = await likeImage(item.$id);
      setLikeCount(result.likes);
      setIsLiked(result.isLiked);
      
      Animated.sequence([
        Animated.timing(animatedScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(animatedScale, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start();
    } catch (error) {
      console.error("Error liking image:", error);
    }
  };

  const heartColor = isLiked ? 'red' : 'white';

  const styles = StyleSheet.create({
    container: {
      marginRight: 20,
    },
    imageBackground: {
      width: 208,
      height: 288,
      borderRadius: 33,
      marginVertical: 20,
      overflow: 'hidden',
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
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.imageBackground}
          resizeMode="cover"
        />
      </TouchableOpacity>

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