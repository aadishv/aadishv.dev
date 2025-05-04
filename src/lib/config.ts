// Configuration file for API keys and other environment variables

interface Config {
  // Google AI API key
  googleApiKey: string;
  
  // Gemini model name
  modelName: string;
  
  // Add other configuration variables as needed
  debugMode: boolean;
}

// Function to get API key from localStorage
const getApiKeyFromStorage = (): string => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('gemini_api_key') || '';
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return '';
    }
  }
  return '';
};

// Function to save API key to localStorage
export const saveApiKey = (apiKey: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('gemini_api_key', apiKey);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Default configuration
const config: Config = {
  // Get API key from localStorage if available, else use environment variable
  get googleApiKey() {
    return getApiKeyFromStorage() || (process.env.GOOGLE_API_KEY || '');
  },
  
  // Gemini model name 
  modelName: "gemini-2.5-flash-preview-04-17",
  
  // Set to false for production, true for development without an API key
  debugMode: false
};

export default config;