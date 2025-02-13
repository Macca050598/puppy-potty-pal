import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Button, StyleSheet, Image, FlatList, Alert } from 'react-native';
import { getPosts } from '../lib/appwrite'; // Import the function to get posts
import { useGlobalContext } from '../context/GlobalProvider';
import { updateUserBlockedList } from '../lib/appwrite'; // Import the function to update the user's blocked list

const UserDetailModal = ({ visible, onClose, creator }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useGlobalContext();
  

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (creator) {
        setLoading(true);
        const posts = await getPosts(creator.$id); // Fetch posts for the selected creator
        setUserPosts(posts);
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [creator]);

 
  // const usersPosts = userPosts.filter(post => post.creator === creator) // Filter posts by the selected creator

  // const totalLikes = userPosts.reduce((acc, post) => acc + (post.likes || 0), 0); // Calculate total likes

  const blockUser = async () => {
    try {
  
    // Check if the user is trying to block themselves
      if (user.username === creator) {
        Alert.alert('Error', 'You cannot block yourself.');
        return; // Exit the function early
      }
  
      // Call the function to update the user's blocked list
      await updateUserBlockedList(user.$id, creator);
      Alert.alert('Success', `${creator} has been blocked. Please refresh the app for this to take effect.`, [
        {
          text: 'OK',
          onPress: () => {
            // Call a function to refresh the data or navigate back
            onRefresh(); // Assuming you have a function to refresh the data
            onClose(); // Close the modal
          },
        },
      ]);
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert('Error', 'Failed to block user. Please try again.');
    }
  };
  const onRefresh = async () => {
    // Logic to refetch data
    await fetchData(); // Replace with your data fetching logic
  };
  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {loading ? (
            <Text>Loading...</Text> 
          ) : (
            <>
              <View style={styles.avatarContainer}>
                {/* <Image source={{ uri: creator.avatar }} style={styles.avatar} /> */}
                <Text style={styles.username}>{creator}</Text>
              
              {/* <Text style={styles.information}>Images Uploaded: {totalLikes.length}</Text>
              <Text style={styles.information}>Total Likes: {totalLikes}</Text> */}
              </View>
              {/* <FlatList
                data={userPosts}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                  <View style={styles.postContainer}>
                    <Image source={{ uri: item.image }} style={styles.postImage} />
                    <Text>{item.title}</Text>
                  </View>
                )}
              /> */}
              <View style={styles.buttonContainer}>
                {user.username != userPosts.username && (
                  <Button title="Block User" onPress={blockUser} color="red" /> 
                )}
                <Button title="Close" onPress={onClose} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postContainer: {
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  information: {
    fontSize: 15,
    padding: 1, 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  }
});

export default UserDetailModal; 