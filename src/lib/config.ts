// Configuration file for API keys and other environment variables

interface Config {
  // Google AI API key
  googleApiKey: string;
  
  // Gemini model name
  modelName: string;
  
  // OpenAI API key
  openaiApiKey: string;
  
  // OpenAI model names
  openaiModelName: string;
  openaiVisionModelName: string;
  
  // Add other configuration variables as needed
  debugMode: boolean;
}

// Function to get Google API key from localStorage
const getGoogleApiKeyFromStorage = (): string => {
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

// Function to get OpenAI API key from localStorage
const getOpenAIApiKeyFromStorage = (): string => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('openai_api_key') || '';
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return '';
    }
  }
  return '';
};

// Function to save Google API key to localStorage
export const saveGoogleApiKey = (apiKey: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('gemini_api_key', apiKey);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Function to save OpenAI API key to localStorage
export const saveOpenAIApiKey = (apiKey: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('openai_api_key', apiKey);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Default configuration
const config: Config = {
  // Get API key from localStorage if available, else use environment variable
  get googleApiKey() {
    return getGoogleApiKeyFromStorage() || (process.env.GOOGLE_API_KEY || '');
  },
  
  get openaiApiKey() {
    return getOpenAIApiKeyFromStorage() || (process.env.OPENAI_API_KEY || '');
  },
  
  // Gemini model name 
  modelName: "gemini-2.5-flash-preview-04-17",
  
  // OpenAI model names
  openaiModelName: "gpt-4o",
  openaiVisionModelName: "gpt-4o",
  
  // Set to false for production, true for development without an API key
  debugMode: false
};

export default config;