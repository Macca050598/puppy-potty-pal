import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Button, StyleSheet, Image, FlatList } from 'react-native';
import { getPosts } from '../lib/appwrite'; // Import the function to get posts
import { useGlobalContext } from '../context/GlobalProvider';
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

 
  const totalLikes = userPosts
    .filter(post => post.userId === creator.$id) // Filter posts by the selected creator
    .reduce((acc, post) => acc + (post.likes || 0), 0); // Calculate total likes

  console.log(user)
  
  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {loading ? (
            <Text>Loading...</Text> 
          ) : (
            <>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: creator.avatar || userPosts.avatar }} style={styles.avatar} />
                <Text style={styles.username}>{userPosts.username || creator}</Text>
              
              <Text style={styles.information}>Images Uploaded: {userPosts.length}</Text>
              <Text style={styles.information}>Total Likes: {totalLikes}</Text>
              </View>
              <FlatList
                // data={userPosts}
                // keyExtractor={(item) => item.$id}
                // renderItem={({ item }) => (
                //   <View style={styles.postContainer}>
                //     <Image source={{ uri: item.image }} style={styles.postImage} />
                //     <Text>{item.title}</Text>
                //   </View>
                // )}
              />
              <View style={styles.buttonContainer}>
                {user.username != userPosts.username && (
                  <Button title="Block User" onPress={() => {/* Add block user functionality */}} color="red" />
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