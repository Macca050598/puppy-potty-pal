import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { icons } from '../constants';
import { Video, ResizeMode } from 'expo-av';

const VideoCard = ({ title, creator, avatar, thumbnail, video, colors }) => {
  const [play, setPlay] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 56,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
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
      fontSize: 14,
    },
    creator: {
      color: colors.primary,
      fontSize: 12,
    },
    menuIcon: {
      width: 20,
      height: 20,
      tintColor: colors.tint,
    },
    videoContainer: {
      width: '100%',
      height: 240,
      borderRadius: 12,
      marginTop: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    video: {
      width: '100%',
      height: 240,
      borderRadius: 12,
    },
    playIcon: {
      width: 48,
      height: 48,
      position: 'absolute',
      tintColor: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flex: 1 }}>
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
        <View style={{ paddingTop: 8 }}>
          <Image source={icons.menu} style={styles.menuIcon} resizeMode='contain'/>
        </View>
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
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
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          style={styles.videoContainer}
        >
          <Image 
            source={{ uri: thumbnail}}
            style={styles.video}
            resizeMode='cover'
          />
          <Image 
            source={icons.play}
            style={styles.playIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;