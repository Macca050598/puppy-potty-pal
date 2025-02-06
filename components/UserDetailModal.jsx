import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Button, StyleSheet, Image, FlatList } from 'react-native';
import { getPosts } from '../lib/appwrite'; // Import the function to get posts
import { useGlobalContext } from '../context/GlobalProvider';
const UserDetailModal = ({ visible, onClose }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (user) {
        setLoading(true);
        const posts = await getPosts(user.$id); // Fetch posts for the selected user
        setUserPosts(posts);
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

 
  const totalLikes = userPosts
    .filter(post => post.userId === user.$id) // Filter posts by the logged-in user
    .reduce((acc, post) => acc + (post.likes || 0), 0); // Calculate total likes

  console.log(user.username)
  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={s