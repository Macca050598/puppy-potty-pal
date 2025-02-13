import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import SearchInput from '../../components/SearchInput'
import ImageCard from '../../components/ImageCard' // Assuming you've created this component
import useAppwrite from '../../lib/useAppwrite'
import { getPosts } from '../../lib/appwrite'
import EmptyState from '../../components/EmptyState'
import { useTheme } from '../../config/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

const SearchPage = () => {
  const { colors } = useTheme()
  const { query } = useLocalSearchParams()
  const [searchQuery, setSearchQuery] = useState(query)
  const { data: searchResults, isLoading } = useAppwrite(() => getPosts({ searchQuery }))

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 30,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
    },
    searchContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    resultCount: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
      marginHorizontal: 24,
      marginBottom: 16,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Search Results</Text>
        <Text style={styles.subtitle}>{`Showing results for "${searchQuery}"`}</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput
          initialQuery={searchQuery}
          colors={colors}
          onSearch={(newQuery) => setSearchQuery(newQuery)}
        />
      </View>

      {!isLoading && (
        <Text style={styles.resultCount}>
          {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
        </Text>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ImageCard
            $id={item.$id}
            title={item.title}
            imageUrl={item.image}
            creator={item.creator.username}
            avatar={item.creator.avatar}
            colors={colors}
            likes={item.likes}
          />
        )}
        ListEmptyComponent={
          !isLoading && (
            <EmptyState
              title="No Results Found"
              subtitle={`We couldn't find any results for "${searchQuery}"`}
            />
          )
        }
      />
    </SafeAreaView>
  )
};
export default SearchPage