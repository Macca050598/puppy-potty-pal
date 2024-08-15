import { Avatars, Databases, Account, Client, ID, Query, Functions } from 'react-native-appwrite';


export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.puppypottypal',
    projectId: '66af9c38001e2e6ad8e9',
    databaseId: '66af9d730023a1d75a57',
    userCollectionId: '66af9d8e0014d12625bc',
    videoCollectionId: '66af9dab002cd080167a',
    storageId: '66af9ef9003a67a125b3',
    dogCollectionId: '66b1fcf1003a5567b83b',
    toiletEventsCollectionId: '66b1ff160024765fb18d',
    familyCollectionId: '66bd1fae001725e40d1a'

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
    toiletEventsCollectionId,
    familyCollectionId
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

    export const getUserPosts = async (userId) => {
      try {
          const posts = await databases.listDocuments(
         databaseId,
         videoCollectionId,
         [Query.equal('creator', userId)]
      )
      return posts.documents;
      } catch (error) {
          throw new Error(error);
      }
  }

export async function signOut() {
  try {
    await account.deleteSession('current');
    // Clear any local storage or state here if needed
  } catch (error) {
    // Even if there's an error, we want to proceed with local logout
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

  export const getDog = async (dogId) => {
  try {
    const dog = await databases.getDocument(
      databaseId,
      dogCollectionId,
      dogId
    );
    return dog;
  } catch (error) {
    console.error("Error fetching dog:", error);
    throw error;
  }
};

  export const updateDog = async (dogId, name, breed, birthdate) => {
    try {
      const updatedDog = await databases.updateDocument(
        databaseId,
        dogCollectionId,
        dogId,
        {
          name,
          breed,
          birthdate
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
      console.error("Error updating toilet event:", error);
      throw error;
    }
  };
  


      export const analyzeToiletBreaks = async (toiletBreaks, dogName) => {
        try {
            // console.log('Sending toilet breaks for analysis:', JSON.stringify({ toiletBreaks, dogName }));
    
            const execution = await functions.createExecution(
                '66b3b74300156e0ff844',
                JSON.stringify({ toiletBreaks, dogName }),
                false,
                '/',
                'POST'
            );
    
            // console.log('Execution response:', execution);
    
            if (execution.status === 'completed') {
                // Parse the responseBody
                const executionResponse = JSON.parse(execution.responseBody);
    
                console.log('Parsed execution response:', executionResponse);
                
                if (!executionResponse.ok) {
                    throw new Error(executionResponse.error || 'Unknown error occurred');
                }
                
                // Parse the completion string inside the responseBody
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
              code: familyCode,  // This is now correctly assigned
              admin_id: userId, // This is now correctly assigned
              members: [userId],
              created_at: new Date().toISOString(),
              users: userId, 
          }
      );

      // Update user's family_ids with the new family's ID
      await updateUserFamilies(userId, newFamily.$id);

      return newFamily;
  } catch (error) {
      console.error("Error creating family:", error);
      throw error;
  }
};

// Helper function to generate a unique family code
const generateFamilyCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Helper function to update user's family_ids
const updateUserFamilies = async (userId, familyId) => {
  try {
      // Fetch the current user document
      const user = await databases.getDocument(
          databaseId,
          userCollectionId,
          userId
      );

      // Prepare the updated family_ids array
      let updatedFamilyIds = user.family_ids || [];
      if (!updatedFamilyIds.includes(familyId)) {
          updatedFamilyIds.push(familyId);
      }

      // Update the user document with the new family_ids array
      await databases.updateDocument(
          databaseId,
          userCollectionId,
          userId,
          {
              family_ids: updatedFamilyIds
          }
      );
  } catch (error) {
      console.error("Error updating user's families:", error);
      throw error;
  }
};

    export const getUserFamilies = async (userId) => {
      try {
          const user = await databases.getDocument(
              databaseId,
              userCollectionId,
              userId
          );
  
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
          console.error("Error fetching user's families:", error);
          throw error;
      }
  };

  export const getFamilyDetails = async (familyId) => {
    try {
        const family = await databases.getDocument(
            databaseId,
            familyCollectionId,
            familyId
        );

        return family;
    } catch (error) {
        console.error("Error fetching family details:", error);
        throw error;
    }
};

export const leaveFamily = async (userId, familyId) => {
  try {
      const family = await databases.getDocument(
          databaseId,
          familyCollectionId,
          familyId
      );

      // Remove user from family members
      const updatedMembers = family.members.filter(memberId => memberId !== userId);
      await databases.updateDocument(
          databaseId,
          familyCollectionId,
          familyId,
          {
              members: updatedMembers
          }
      );

      // Remove family from user's family_ids
      const user = await databases.getDocument(
          databaseId,
          userCollectionId,
          userId
      );
      const updatedFamilyIds = user.family_ids.filter(id => id !== familyId);
      await databases.updateDocument(
          databaseId,
          userCollectionId,
          userId,
          {
              family_ids: updatedFamilyIds
          }
      );

      return { success: true };
  } catch (error) {
      console.error("Error leaving family:", error);
      throw error;
  }
};

// Add these functions to your Appwrite configuration file

export const updateFamily = async (familyId, newFamilyName) => {
  try {
    const updatedFamily = await databases.updateDocument(
      databaseId,
      familyCollectionId,
      familyId,
      {
        name: newFamilyName
      }
    );
    return updatedFamily;
  } catch (error) {
    console.error("Error updating family:", error);
    throw error;
  }
};

export const deleteFamily = async (familyId) => {
  try {
    // First, get the family details to access the members
    const family = await getFamilyDetails(familyId);
    
    // Remove the family from all members' family_ids
    for (const memberId of family.members) {
      await leaveFamily(memberId, familyId);
    }

    // Now delete the family document
    await databases.deleteDocument(
      databaseId,
      familyCollectionId,
      familyId
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting family:", error);
    throw error;
  }
};

export const removeUserFromFamily = async (familyId, userId) => {
  try {
    const family = await getFamilyDetails(familyId);
    
    // Remove user from family members
    const updatedMembers = family.members.filter(memberId => memberId !== userId);
    await databases.updateDocument(
      databaseId,
      familyCollectionId,
      familyId,
      {
        members: updatedMembers
      }
    );

    // Remove family from user's family_ids
    await leaveFamily(userId, familyId);

    return { success: true };
  } catch (error) {
    console.error("Error removing user from family:", error);
    throw error;
  }
};
