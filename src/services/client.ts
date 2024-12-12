import axios from 'axios';

// Create axios instance with default config
const client = axios.create({
  timeout: 10000, // 10 second timeout as per PRD
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
client.interceptors.response.use(
  response => response,
  error => {
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    // Pass through the error
    return Promise.reject(error);
  }
);

export default client;
