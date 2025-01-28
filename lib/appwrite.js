import { Avatars, Databases, Account, Client, ID, Query, Functions, Storage, File, Permission, Role} from 'react-native-appwrite';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';


export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.puppypottypal',
    projectId: '66af9c38001e2e6ad8e9',
    databaseId: '66af9d730023a1d75a57',
    userCollectionId: '66af9d8e0014d12625bc',
    videoCollectionId: '66af9dab002cd080167a',
    imageCollectionId: '66b0f0e3001c8e626537',
    storageId: '66af9ef9003a67a125b3',
    dogCollectionId: '66b1fcf1003a5567b83b',
    toiletEventsCollectionId: '66b1ff160024765fb18d',
    eatingEventsCollectionId: '66c35bcf002506e7f9de',
    familyCollectionId: '66bd1fae001725e40d1a',
    alertsCollectionId: '66cf520100240e2692be',
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    imageCollectionId,
    storageId,
    dogCollectionId,
    toiletEventsCollectionId,
    eatingEventsCollectionId,
    familyCollectionId,
    alertsCollectionId,
} = appwriteConfig;


// Init your React Native SDK
const client = new Client();


client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
    .setPlatform(appwriteConfig.platform) // Your application ID or bundle ID.

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client);
    const functions = new Functions(client);
    const storage = new Storage(client);
    export const createUser = async (email, password, username) => {
      try {
         const [newAccount, avatarUrl] = await Promise.all([
           account.create(ID.unique(), email, password, username),
           avatars.getInitials(username)
         ]);
     
         if(!newAccount) throw Error;
     
         await signIn(email, password);
     
         const newUser = await databases.createDocument(
             appwriteConfig.databaseId,
             appwriteConfig.userCollectionId,
             ID.unique(),
             {
                 accountId: newAccount.$id,
                 email,
                 username,
                 avatar: avatarUrl
             }
         );
         return newUser;
      } catch (error) {
         console.log(error);
         throw error;
      }
     }


     export const signIn = async (email, password) => {
      try {
          // First, ensure any existing sessions are cleared
          try {
              const sessions = await account.listSessions();
              if (sessions.total > 0) {
                  await account.deleteSession('current');
              }
          } catch (e) {
              // Ignore session clearing errors
              console.log("Session clearing skipped:", e);
          }

          // Create a new session - using the correct method name
          const session = await account.createEmailPasswordSession(email, password);
          
          // Verify the session was created successfully
          if (!session) {
              throw new Error('Failed to create session');
          }

          // Get the user account details
          const currentAccount = await account.get();
          
          if (!currentAccount) {
              throw new Error('Failed to get account details');
          }

          // Get the user document from your database
          const currentUser = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.userCollectionId,
              [Query.equal('accountId', currentAccount.$id), Query.limit(1)]
          );

          if (!currentUser.documents.length) {
              throw new Error('User document not found');
          }

          return {
              session,
              user: currentUser.documents[0]
          };
      } catch (error) {
          console.error('Sign in error:', error);
          throw error;
      }
  };
  

    export async function signOut() {
      try {
        const sessions = await account.listSessions();
        if (sessions.total > 0) {
          await account.deleteSession('current');
        }
        // Clear any local storage or state here if needed
      } catch (error) {
        console.error('Error during sign out:', error);
        // Proceed with local logout even if there's an error
      }
    }

    


    export const getCurrentUser = async () => {
      try {
          const currentAccount = await account.get();
  
          if (!currentAccount) throw Error;
  
          const currentUser = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.userCollectionId,
              [Query.equal('accountId', currentAccount.$id), Query.limit(1)]
          );
  
          if (!currentUser.documents.length) throw Error;
  
          return currentUser.documents[0];
      } catch (error) {
          console.log(error);
          throw error; // Re-throw the error to allow proper error handling
      }
  };



  export const getPosts = async (options = {}) => {
    try {
        const queries = [];

        if (options.userId) {
            queries.push(Query.equal('creator', options.userId));
        }

        if (options.searchQuery) {
            queries.push(Query.search('title', options.searchQuery));
        }

        if (options.latest) {
            queries.push(Query.orderDesc('$createdAt'));
            queries.push(Query.limit(7));
        }

        if (options.limit) {
            queries.push(Query.limit(options.limit));
        }

        if (options.offset) {
            queries.push(Query.offset(options.offset));
        }

        const posts = await databases.listDocuments(
            databaseId,
            imageCollectionId,
            queries
        );

        return posts.documents;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
};


export const getCurrentUserDogs = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('No current user found');
    }

    const dogs = await databases.listDocuments(
      databaseId,
      dogCollectionId,
      [Query.equal('creator', currentUser.$id)]
    );

    return dogs.documents;
  } catch (error) {
    console.error('Error fetching current user dogs:', error);
    throw error;
  }
};

// Function to add a new dog for the current user
export const addDog = async (userId, name, breed, birthdate, weight) => {
  try {
    const newDog = await databases.createDocument(
      databaseId,
      dogCollectionId,
      ID.unique(),
      {
        creator: userId, // Link the dog to the current user
        name: name,     // Dog's name
        breed: breed,   // Dog's breed
        birthdate: birthdate, // Dog's birthdate
        weight: weight  // Dog's weight
      }
    );
    return newDog;
  } catch (error) {
    console.error("Error adding new dog:", error);
    throw error;
  }
};

export const getDog = async (dogId) => {
try {
  const dog = await databases.getDocument(
    databaseId,
    dogCollectionId,
    dogId
  );
  return dog;
} catch (error) {
  console.error("Error getting dog:", error);
  throw error;
}
};

export const updateDog = async (dogId, name, breed, birthdate, weight) => {
  try {
    const updatedDog = await databases.updateDocument(
      databaseId,
      dogCollectionId,
      dogId,
      {
        name,
        breed,
        birthdate,
        weight
      }
    );
    return updatedDog;
  } catch (error) {
    console.error("Error updating dog:", error);
    throw error;
  }
};

export const deleteDog = async (dogId) => {
  try {
    await databases.deleteDocument(
      databaseId,
      dogCollectionId,
      dogId
    );
  } catch (error) {
    console.error("Error deleting dog:", error);
    throw error;
  }
};

export const manageDog = async (action, dogId, dogData = {}) => {
  try {
    switch (action) {
      case 'get':
        return await databases.getDocument(databaseId, dogCollectionId, dogId);
      case 'update':
        return await databases.updateDocument(databaseId, dogCollectionId, dogId, dogData);
      case 'delete':
        await databases.deleteDocument(databaseId, dogCollectionId, dogId);
        return { success: true };
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error(`Error ${action}ing dog:`, error);
    throw error;
  }
};
  
  

export const getDogToiletEvents = async (dogId, limit = 20, options = {}) => {
  try {
    const filters = [
      Query.orderDesc('$createdAt'),
      Query.limit(limit)
    ];

    // Handle single dogId or array of dogIds
    if (Array.isArray(dogId)) {
      filters.push(Query.equal('associatedDog', dogId));
    } else {
      filters.push(Query.equal('associatedDog', dogId));
    }

    // Add type filter if provided in options
    if (options.type) {
      filters.push(Query.equal('type', options.type));
    }

    // Add date range filter if provided in options
    if (options.startDate && options.endDate) {
      filters.push(Query.between('timestamp', options.startDate, options.endDate));
    }

    // Add any additional filters from options
    if (options.additionalFilters && Array.isArray(options.additionalFilters)) {
      filters.push(...options.additionalFilters);
    }

    const events = await databases.listDocuments(
      databaseId,
      toiletEventsCollectionId,
      filters
    );

    return events.documents;
  } catch (error) {
    const dogIdString = Array.isArray(dogId) ? dogId.join(', ') : dogId;
    console.error(`Error fetching toilet events for dog(s) ${dogIdString}:`, error);
    throw error;
  }
};


export const addToiletEvent = async (dogId, type, location, timestamp = new Date().toISOString()) => {
  const validTypes = ['wee', 'poo'];
  const validLocations = ['inside', 'outside'];

  if (!validTypes.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  if (!validLocations.includes(location)) {
    throw new Error(`Invalid location. Must be one of: ${validLocations.join(', ')}`);
  }

  try {
    const newEvent = await databases.createDocument(
      databaseId,
      toiletEventsCollectionId,
      ID.unique(),
      {
        associatedDog: dogId,
        type: type,
        location: location,
        timestamp: timestamp,
      }
    );
    return newEvent;
  } catch (error) {
    console.error("Error adding new toilet event:", error);
    console.error("Full error:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const deleteToiletEvents = async (eventId, databaseId) => {
  try {
    const response = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.toiletEventsCollectionId,
      eventId
    );
    return response;
  } catch (error) {
    console.error('Error deleting toilet event:', error);
    throw error;
  }
};

export const updateToiletEvent = async (eventId, updatedEvent) => {
  try {
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.toiletEventsCollectionId,
      eventId,
      {
        type: updatedEvent.type,
        location: updatedEvent.location,
        timestamp: updatedEvent.timestamp,
      }
    );
    return response;
  } catch (error) {
    console.error(`Error updating toilet event ${eventId}:`, error);
    throw error;
  }
};

export const analyzeToiletBreaks = async (toiletBreaks, dogName) => {
  try {
    const execution = await functions.createExecution(
      '66b3b74300156e0ff844',
      JSON.stringify({ toiletBreaks, dogName }),
      false,
      '/',
      'POST'
    );

    if (execution.status === 'completed') {
      const executionResponse = JSON.parse(execution.responseBody);
      
      if (!executionResponse.ok) {
        throw new Error(executionResponse.error || 'Unknown error occurred');
      }
      
      const analysis = JSON.parse(executionResponse.completion);
      return analysis;
    } else {
      throw new Error(`Function execution failed: ${execution.stderr}`);
    }
  } catch (error) {
    console.error('Error calling AI function:', error);
    throw error;
  }
};



// Unified function for getting dog eating events (single or multiple dogs)
export const getDogEatingEvents = async (dogId, limit = 20, options = {}) => {
  try {
    const filters = [
      Query.orderDesc('$createdAt'),
      Query.limit(limit)
    ];

    // Handle single dogId or array of dogIds
    if (Array.isArray(dogId)) {
      filters.push(Query.equal('associatedDog', dogId));
    } else {
      filters.push(Query.equal('associatedDog', dogId));
    }

    // Add type filter if provided in options
    if (options.type) {
      filters.push(Query.equal('type', options.type));
    }

    // Add date range filter if provided in options
    if (options.startDate && options.endDate) {
      filters.push(Query.between('timestamp', options.startDate, options.endDate));
    }

    const events = await databases.listDocuments(
      databaseId,
      eatingEventsCollectionId,
      filters
    );

    return events.documents;
  } catch (error) {
    const dogIdString = Array.isArray(dogId) ? dogId.join(', ') : dogId;
    console.error(`Error fetching eating events for dog(s) ${dogIdString}:`, error);
    throw error;
  }
};

export const addEatingEvent = async (dogId, type, timestamp = new Date().toISOString()) => {
  const validEatingTypes = ['snack', 'meal'];

  if (!validEatingTypes.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${validEatingTypes.join(', ')}`);
  }

  try {
    const newEatingEvent = await databases.createDocument(
      databaseId,
      eatingEventsCollectionId,
      ID.unique(),
      { associatedDog: dogId, type, timestamp }
    );
    return newEatingEvent;
  } catch (error) {
    console.error(`Error adding new eating event for dog ${dogId}:`, error);
    throw error;
  }
};

export const updateEatingEvent = async (eventId, updatedEvent) => {
  try {
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.eatingEventsCollectionId,
      eventId,
      {
        type: updatedEvent.type,
        timestamp: updatedEvent.timestamp,
      }
    );
    return response;
  } catch (error) {
    console.error(`Error updating eating event ${eventId}:`, error);
    throw error;
  }
};

export const getCombinedDogEvents = async (dogId, limit = 20, options = {}) => {
  try {
    const [toiletEvents, eatingEvents] = await Promise.all([
      getDogToiletEvents(dogId, limit, options),
      getDogEatingEvents(dogId, limit, options)
    ]);

    const combinedEvents = [...toiletEvents, ...eatingEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return combinedEvents;
  } catch (error) {
    console.error(`Error fetching combined events for dog ${dogId}:`, error);
    throw error;
  }
};

export const getAllDogsCombinedEvents = async (dogIds, limit = 20, options = {}) => {
  try {
    const [toiletEvents, eatingEvents] = await Promise.all([
      getDogToiletEvents(dogIds, limit, options),
      getDogEatingEvents(dogIds, limit, options)
    ]);

    const combinedEvents = [...toiletEvents, ...eatingEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return combinedEvents;
  } catch (error) {
    const dogIdString = Array.isArray(dogIds) ? dogIds.join(', ') : dogIds;
    console.error(`Error fetching combined events for dogs ${dogIdString}:`, error);
    throw error;
  }
};



// Helper function to generate a unique family code
const generateFamilyCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Function to create a new family and update user's family_ids
export const createFamily = async (userId, familyName) => {
  try {
    const familyCode = generateFamilyCode();
    const newFamily = await databases.createDocument(
      databaseId,
      familyCollectionId,
      ID.unique(),
      {
        name: familyName,
        code: familyCode,
        admin_id: userId,
        members: [userId],
        created_at: new Date().toISOString(),
        users: userId,
      }
    );

    await updateUserFamilies(userId, newFamily.$id);
    return newFamily;
  } catch (error) {
    console.error(`Error creating family for user ${userId}:`, error);
    throw error;
  }
};

// This helps a user join a family
export const updateUserFamilies = async (userId, familyId) => {
  try {
    const user = await databases.getDocument(databaseId, userCollectionId, userId);
    const updatedFamilyIds = [...new Set([...(user.family_ids || []), familyId])];

    await databases.updateDocument(
      databaseId,
      userCollectionId,
      userId,
      { family_ids: updatedFamilyIds }
    );
  } catch (error) {
    console.error(`Error updating families for user ${userId}:`, error);
    throw error;
  }
};

export const getUserFamilies = async (userId) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error('No current user found');
    }
  
    const userId = currentUser.$id;

    const user = await databases.getDocument(databaseId, userCollectionId, userId);

    if (!user.family_ids || user.family_ids.length === 0) {
      return [];
    }

    const families = await databases.listDocuments(
      databaseId,
      familyCollectionId,
      [Query.equal('$id', user.family_ids)]
    );

    return families.documents;
  } catch (error) {
    console.error(`Error fetching families for user ${userId}:`, error);
    throw error;
  }
};

export const getFamilyDetails = async (familyId) => {
  try {
    return await databases.getDocument(databaseId, familyCollectionId, familyId);
  } catch (error) {
    console.error(`Error fetching details for family ${familyId}:`, error);
    throw error;
  }
};

export const leaveFamily = async (userId, familyId) => {
  try {
    const [family, user] = await Promise.all([
      getFamilyDetails(familyId),
      databases.getDocument(databaseId, userCollectionId, userId)
    ]);

    const updatedMembers = family.members.filter(memberId => memberId !== userId);
    const updatedFamilyIds = user.family_ids.filter(id => id !== familyId);

    await Promise.all([
      databases.updateDocument(databaseId, familyCollectionId, familyId, { members: updatedMembers }),
      databases.updateDocument(databaseId, userCollectionId, userId, { family_ids: updatedFamilyIds })
    ]);

    return { success: true };
  } catch (error) {
    console.error(`Error for user ${userId} leaving family ${familyId}:`, error);
    throw error;
  }
};

export const updateFamily = async (familyId, newFamilyName) => {
  try {
    return await databases.updateDocument(
      databaseId,
      familyCollectionId,
      familyId,
      { name: newFamilyName }
    );
  } catch (error) {
    console.error(`Error updating family ${familyId}:`, error);
    throw error;
  }
};

export const deleteFamily = async (familyId) => {
  try {
    const family = await getFamilyDetails(familyId);
    
    await Promise.all(family.members.map(memberId => leaveFamily(memberId, familyId)));

    await databases.deleteDocument(databaseId, familyCollectionId, familyId);

    return { success: true };
  } catch (error) {
    console.error(`Error deleting family ${familyId}:`, error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await databases.listDocuments(databaseId, userCollectionId);
    return users.documents;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const updateFamilyMembers = async (familyId, selectedMembers) => {
  try {
    const updatedMembers = Object.keys(selectedMembers).filter(memberId => selectedMembers[memberId]);
    
    await databases.updateDocument(databaseId, familyCollectionId, familyId, { members: updatedMembers });

    const allUsers = await getAllUsers();
    const updatePromises = allUsers.map(user => {
      if (selectedMembers[user.$id] && !user.family_ids.includes(familyId)) {
        return updateUserFamilies(user.$id, familyId);
      } else if (!selectedMembers[user.$id] && user.family_ids.includes(familyId)) {
        return leaveFamily(user.$id, familyId);
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    return { success: true };
  } catch (error) {
    console.error(`Error updating members for family ${familyId}:`, error);
    throw error;
  }
};

export const getFamilyDogs = async (familyId) => {
  try {
    const dogs = await databases.listDocuments(databaseId, dogCollectionId, [Query.equal('families', familyId)]);
    return dogs.documents;
  } catch (error) {
    console.error(`Error fetching dogs for family ${familyId}:`, error);
    throw error;
  }
};

export const getAllUserDogs = async (userId) => {
  try {
    console.log('Fetching all dogs for userId:', userId);
    const response = await databases.listDocuments(
      databaseId,
      dogCollectionId,
      [Query.equal('creator', userId)]
    );
    console.log('All user dogs response:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error fetching user dogs:', error);
    throw error;
  }
};

export const updateFamilyDogs = async (familyId, selectedDogs) => {
  try {
    const [allUserDogs, currentFamilyDogs] = await Promise.all([
      getCurrentUserDogs(),
      getFamilyDogs(familyId)
    ]);

    const updatePromises = allUserDogs.map(dog => {
      const shouldBeInFamily = selectedDogs[dog.$id];
      const isCurrentlyInFamily = currentFamilyDogs.some(familyDog => familyDog.$id === dog.$id);

      if (shouldBeInFamily !== isCurrentlyInFamily) {
        return databases.updateDocument(
          databaseId,
          dogCollectionId,
          dog.$id,
          { families: shouldBeInFamily ? familyId : null }
        );
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    return { success: true };
  } catch (error) {
    console.error(`Error updating dogs for family ${familyId}:`, error);
    throw error;
  }
};

export const joinFamily = async (userId, familyCode) => {
  try {
    const families = await databases.listDocuments(databaseId, familyCollectionId, [Query.equal('code', familyCode)]);

    if (families.documents.length === 0) {
      throw new Error('Family not found with the given code');
    }

    const family = families.documents[0];

    if (family.members.includes(userId)) {
      throw new Error('You are already a member of this family');
    }

    const updatedMembers = [...family.members, userId];
    
    await Promise.all([
      databases.updateDocument(databaseId, familyCollectionId, family.$id, { members: updatedMembers }),
      updateUserFamilies(userId, family.$id)
    ]);

    return { success: true, family };
  } catch (error) {
    console.error(`Error joining family with code ${familyCode} for user ${userId}:`, error);
    throw error;
  }
};

export const getUserAndFamilyDogs = async (userId) => {
  try {
    const [personalDogs, userFamilies] = await Promise.all([
      getCurrentUserDogs(userId),
      getUserFamilies(userId)
    ]);

    const personalDogsWithOwnership = personalDogs.map(dog => ({ ...dog, isOwnedByUser: true }));

    const familyDogsPromises = userFamilies.map(family => getFamilyDogs(family.$id));
    const familyDogsArrays = await Promise.all(familyDogsPromises);

    const familyDogs = familyDogsArrays.flat().map(dog => ({ ...dog, isOwnedByUser: dog.creator === userId }));

    const allDogs = [...personalDogsWithOwnership, ...familyDogs];

    const uniqueDogs = allDogs.filter((dog, index, self) =>
      index === self.findIndex((t) => t.$id === dog.$id)
    );

    return uniqueDogs;
  } catch (error) {
    console.error(`Error fetching dogs for user ${userId}:`, error);
    throw error;
  }
};

export const getFilePreview = (fileId, type) => {
  try {
    
      return storage.getFileView(storageId, fileId, 2000, 2000, 'top', 100);
   
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw error;
  }
}

export const createImage = async (form) => {
  try {
    const [imageUrl] = await Promise.all([
      uploadFile(form.image, "image"),
    ]);
    if (!imageUrl) {
      throw new Error('Failed to upload image');
    }
    console.log(imageUrl)
    const newPost = await databases.createDocument(
      databaseId, 
      imageCollectionId, 
      ID.unique(), 
      {
        title: form.title,
        image: imageUrl,
        prompt: form.prompt,
        creator: form.userId,
        likes: form.likes,
      }
    );

    return newPost;
  } catch (error) {
    console.error('Error creating image:', error);
    throw error;
  }
}


export const uploadFile = async (file, type) => {
  if (!file) return;

  // Extract file name from URI or generate one
  const fileName = file.uri.split('/').pop() || `image_${Date.now()}.jpg`;

  try {
    // Compress the image with higher quality to maintain file size
    const compressedImage = await ImageManipulator.manipulateAsync(
      file.uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Read the file info to get the accurate file size
    const fileInfo = await FileSystem.getInfoAsync(compressedImage.uri);

    const asset = {
      name: fileName,
      type: 'image/jpeg',
      size: fileInfo.size,
      uri: compressedImage.uri
    };

    console.log('Asset to upload:', asset);

    // Ensure the file meets minimum size requirements (e.g., 1KB)
    if (fileInfo.size < 1024) {
      throw new Error('File size too small. Minimum size is 1KB.');
    }

    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );
    console.log('Uploaded file:', uploadedFile);

    const fileUrl = await getFilePreview(uploadedFile.$id);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const likeImage = async (imageId) => {
  console.log('likeImage called with imageId:', imageId);
  
  if (!imageId) {
    console.error('No imageId provided to likeImage function');
    throw new Error('Missing imageId');
  }

  try {
    // Get the current user
    const currentUser = await account.get();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.$id;
    console.log('Current user ID:', userId);

    console.log('Fetching image document...');
    const image = await databases.getDocument(
      databaseId,
      imageCollectionId,
      imageId
    );
    console.log('Image document:', image);

    if (!image) {
      throw new Error(`Image with id ${imageId} not found`);
    }

    let likes = image.likes || 0;
    likes++; // Increment likes

    console.log('Updating image document...');
    const updatedImage = await databases.updateDocument(
      databaseId,
      imageCollectionId,
      imageId,
      { 
        likes: likes
      }
    );
    console.log('Updated image document:', updatedImage);

    return {
      likes: updatedImage.likes,
      isLiked: true
    };
  } catch (error) {
    console.error("Error in likeImage function:", error);
    throw error;
  }
};

export const updateUserName = async (username) => {
    try {
        const account = new Account(client);
        
        // Update the username in Appwrite account
        const updatedUser = await account.updateName(username);

        // Also update the username in your database if needed
        await databases.updateDocument(
            databaseId,
            userCollectionId,
            updatedUser.$id,
            {
                username: username
            }
        );

        return updatedUser;
    } catch (error) {
        console.error('Error updating username:', error);
        throw error;
    }
};

export const updateUserEmail = async (email, password) => {
    try {
        const account = new Account(client);
        
        // Update email requires password verification
        const updatedUser = await account.updateEmail(email, password);

        // Also update the email in your database if needed
        await databases.updateDocument(
            databaseId,
            userCollectionId,
            updatedUser.$id,
            {
                email: email
            }
        );

        return updatedUser;
    } catch (error) {
        // Handle specific error cases
        if (error.code === 401) {
            throw new Error('Incorrect password');
        }
        if (error.code === 409) {
            throw new Error('Email already exists');
        }
        console.error('Error updating email:', error);
        throw error;
    }
};

export const updateUserAvatar = async (userId, imageUri) => {
    try {
        if (!imageUri) {
            throw new Error('No image selected');
        }

        // Prepare the file object in the format uploadFile expects
        const file = {
            uri: imageUri,
            type: 'image/jpeg',
            name: `avatar_${userId}.jpg`
        };

        // Use your existing uploadFile function to get the URL
        const fileUrl = await uploadFile(file, 'image');
        
        if (!fileUrl) {
            throw new Error('Failed to upload avatar');
        }

        // Update user document in the database
        const updatedUser = await databases.updateDocument(
            databaseId,
            userCollectionId,
            userId,
            {
                avatar: fileUrl
            }
        );

        // Also update user preferences
        await account.updatePrefs({
            avatar: fileUrl
        });

        return updatedUser;
    } catch (error) {
        console.error('Error updating avatar:', error);
        throw error;
    }
};

export const updateUser = async (userId, username, email, password) => {
  try {
    await account.updateName(username);
    await account.updateEmail(email, password);
    const updatedUser = await account.get();
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
export const createAlerts = async (title, date, time) => {
  try {
    const dateObj = new Date(date);
    const timeObj = new Date(time);

    const response = await databases.createDocument(
      databaseId,
      alertsCollectionId,
      ID.unique(),
      {
        title, 
        date: new Date(date), // Format: YYYY-MM-DD
        time: new Date(time),
      }
    );
    return response;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const updateAlert = async (alertId, title, date, time) => {
  try {
    await databases.updateDocument(
      databaseId,
      alertsCollectionId,
      alertId,
      {
        title,
        date,
        time
      }
    );

    return { success: true };
  } catch (error) {
    console.error(`Error updating alert ${alertId}:`, error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    await databases.deleteDocument(
      databaseId,
      alertsCollectionId,
      alertId
    );

    return { success: true };
  } catch (error) {
    console.error(`Error deleting alert ${alertId}:`, error);
    throw error;
  }
};

export const getAlerts = async (alertId) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      alertsCollectionId,
      alertId
    );
    return response.documents;
  } catch (error) {
    console.error('Error loading alerts:', error);
    throw error;
  }
};

export const getDogs = async () => {
  try {
    // First get the user's family ID
    const userResponse = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      'users',
      [
        Query.equal('userId', account.current.$id)
      ]
    );
    
    const familyId = userResponse.documents[0]?.familyId;

    // Then query for dogs that either belong to the user OR belong to the family
    const response = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      'dogs',
      [
        Query.equal('userId', account.current.$id),
        ...(familyId ? [Query.equal('familyId', familyId)] : [])
      ]
    );
    return response;
  } catch (error) {
    console.error('Error fetching dogs:', error);
    throw error;
  }
};

export const createDog = async (dogData) => {
  try {
    // Get user's family ID first
    const userResponse = await databases.listDocuments(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      'users',
      [
        Query.equal('userId', account.current.$id)
      ]
    );
    
    const familyId = userResponse.documents[0]?.familyId;

    const response = await databases.createDocument(
      process.env.EXPO_PUBLIC_DATABASE_ID,
      'dogs',
      ID.unique(),
      {
        ...dogData,
        userId: account.current.$id,
        familyId: familyId || null
      }
    );
    return response;
  } catch (error) {
    console.error('Error creating dog:', error);
    throw error;
  }
};

export const deleteUserAccount = async () => {
  try {
    // Delete user document from database first
    const currentUser = await getCurrentUser();
    await databases.deleteDocument(
      databaseId,
      userCollectionId,
      currentUser.$id
    );

    // Delete Appwrite account
    await account.delete();
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};


export const deleteImage = async (imageId) => {
  try {
    await databases.deleteDocument(databaseId, imageCollectionId, imageId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const reportImage = async (imageId, reason) => {
  try {
    // Implement your reporting logic here, e.g., log the report to a database
    console.log(`Image ${imageId} reported for reason: ${reason}`);
    return { success: true };
  } catch (error) {
    console.error('Error reporting image:', error);
    throw error;
  }
};
