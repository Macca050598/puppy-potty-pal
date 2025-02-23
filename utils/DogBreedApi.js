import axios from 'axios';

const API_KEY = 'your_api_key_here'; // Replace with your actual API key from The Dog API
const BASE_URL = 'https://api.thedogapi.com/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': API_KEY
  }
});

export const getAllBreeds = async () => {
  try {
    const response = await api.get('/breeds');
    return response.data.map(breed => ({
      id: breed.id,
      name: breed.name,
      weight: breed.weight.metric // This will be a string like "3 - 6"
    }));
  } catch (error) {
    console.error('Error fetching all breeds:', error);
    throw error;
  }
};

export const searchBreeds = async (query) => {
  try {
    const response = await api.get(`/breeds/search?q=${query}`);
    return response.data.map(breed => ({
      id: breed.id,
      name: breed.name,
      weight: breed.weight.metric
    }));
  } catch (error) {
    console.error('Error searching breeds of dog:', error);
    throw error;
  }
};

// You can add more functions here as needed, such as getting details for a specific breed