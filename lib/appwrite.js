import { Avatars, Databases, Account, Client, ID, Query } from 'react-native-appwrite';


export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.puppypottypal',
    projectId: '66af9c38001e2e6ad8e9',
    databaseId: '66af9d730023a1d75a57',
    userCollectionId: '66af9d8e0014d12625bc',
    videoCollectionId: '66af9dab002cd080167a',
    storageId: '66af9ef9003a67a125b3',
    dogCollectionId: '66b1fcf1003a5567b83b',
    toiletEventsCollectionId: '66b1ff160024765fb18d'
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId,
    dogCollectionId,
    toiletEventsCollectionId
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

    export const createUser = async (email, password, username) => {
     try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

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
        throw new Error(error);
     }
    }


    export const signIn = async (email, password) => {
        try {
            const session = await account.createEmailPasswordSession(email, password)

            return session;
        } catch (error) {
            throw new Error(error);
        }
    }

    export const getCurrentUser = async () => {
        try {
            const currentAccount = await account.get();

            if(!currentAccount) throw Error;

            const currentUser = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('accountId', currentAccount.$id)]
            );

            if(!currentUser) throw Error;

            return currentUser.documents[0];

        } catch (error) {
            console.log(error);
        }
    }

    export const getAllPosts = async () => {
        try {
            const posts = await databases.listDocuments(
           databaseId,
           videoCollectionId
        )
        return posts.documents;
        } catch (error) {
            throw new Error(error);
        }
    }
    

    export const getLatestPosts = async () => {
        try {
            const posts = await databases.listDocuments(
           databaseId,
           videoCollectionId,
           [Query.orderDesc('$createdAt', Query.limit(7))]
        )
        return posts.documents;
        } catch (error) {
            throw new Error(error);
        }
    }

    export const searchPosts = async (query) => {
        try {
            const posts = await databases.listDocuments(
           databaseId,
           videoCollectionId,
           [Query.search('title', query)]
        )
        return posts.documents;
        } catch (error) {
            throw new Error(error);
        }
    }


// Function to get all dogs for the current user
export const getUserDogs = async () => {
    try {
      // Get the currently logged-in user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('No current user found');
      }
  
      // Get the user ID from the current user document
      const userId = currentUser.$id;
  
      // Fetch all dogs linked to this user ID
      const dogs = await databases.listDocuments(
        databaseId,
        dogCollectionId,
        [Query.equal('creator', userId)]
      );
  
      return dogs.documents;
    } catch (error) {
      console.error("Error fetching user's dogs:", error);
      throw error;
    }
  };
  

// Function to get the current user's dogs
export const fetchCurrentUserDogs = async () => {
    try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
            const userId = currentUser.$id; // Ensure you're using the correct field for user ID
            const userDogs = await getUserDogs(userId);
            return userDogs;
        } else {
            throw new Error('No current user found');
        }
    } catch (error) {
        console.error('Error fetching current user dogs:', error);
        throw error;
    }
};

// Function to add a new dog for the current user
export const addDog = async (userId, name, breed, birthdate) => {
    try {
      const newDog = await databases.createDocument(
        databaseId,
        dogCollectionId,
        ID.unique(),
        {
          creator: userId, // Link the dog to the current user
          name: name,     // Dog's name
          breed: breed,   // Dog's breed
          birthdate: birthdate // Dog's birthdate
        }
      );
      return newDog;
    } catch (error) {
      console.error("Error adding new dog:", error);
      throw error;
    }
  };
  
  

  export const getDogToiletEvents = async (dogId, limit = 20) => {
    try {
      const events = await databases.listDocuments(
        databaseId,
        toiletEventsCollectionId,
        [
          Query.equal('associatedDog', dogId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );
      return events.documents;
    } catch (error) {
      console.error("Error fetching dog's toilet events:", error);
      throw error;
    }
  };




// Function to add a new toilet event
export const addToiletEvent = async (dogId, type, location, timestamp = new Date().toISOString()) => {
    // Validate enum values
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
        associatedDog : dogId,  // or { $id: dogId } if it's a relationship
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