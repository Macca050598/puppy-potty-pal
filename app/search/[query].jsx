import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import SearchInput from '../../components/SearchInput';
import EmptyState from '../../components/EmptyState';
import { searchPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useTheme } from '../../config/theme'; // Import useTheme hook

const Search = () => {
  const { colors } = useTheme(); // Use the useTheme hook to get colors
  const { query } = useLocalSearchParams();
  const { data: posts, refetch } = useAppwrite(() => searchPosts(query));

  useEffect(() => {
    refetch();
  }, [query]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.accent,
      flex: 1,
    },
    header: {
      marginVertical: 24,
      paddingHorizontal: 16,
    },
    subtitle: {
      fontWeight: '500',
      color: colors.tint,
      fontSize: 14,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginTop: 4,
    },
    searchInputContainer: {
      marginTop: 24,
      marginBottom: 32,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
            colors={colors}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              Search Results
            </Text>
            <Text style={styles.title}>
              {query}
            </Text>

            <View style={styles.searchInputContainer}>
              <SearchInput initialQuery={query} refetch={refetch} colors={colors} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
            titleStyle={{ color: colors.text }}
            subtitleStyle={{ color: colors.tint }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;