// AI Service for interacting with the Google Generative AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import config as myConfig from './config';

// Type definitions
type CardData = {
  type: 'text' | 'file';
  content: string;
  data?: string; // For text cards
  files?: FileData[]; // For file cards
};

interface FileData {
  name: string;
  type: string;
  data: string; // This should be an ArrayBuffer as string, not a data URL
  id: string;
}

/**
 * Process a card using Google's Gemini model
 * @param cardData - The card data to analyze
 * @returns A promise that resolves to an array of descriptions
 */
export async function processCardWithAI(cardData: CardData): Promise<string[]> {
  try {
    // Get API key directly from localStorage
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

    // Check if API key is available
    if (!apiKey) {
      throw new Error("Google API key is not configured");
    }

    // Log API usage
    console.log(`Using API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log(`Using model: ${myConfig.modelName}`);

    // Initialize the Google Generative AI API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: myConfig.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    let parts = [];

    if (cardData.type === 'text') {
      parts = [{
        text: `Analyze the following text and provide 3 insightful descriptions about it.  Format your response as a numbered list with only the descriptions, without any introduction or conclusion.\n\nType: ${cardData.content || 'No type specified'}\nContent: ${cardData.data || '(No content provided)'}`
      }];
    } else if (cardData.type === 'file' && cardData.files && cardData.files.length > 0) {
      parts = [
        `Analyze the following files and provide a description for each. Format your response as a numbered list with only the descriptions, without any introduction or conclusion.\n`,
        ...cardData.files.flatMap(file => [
          `${file.name} (${file.type})\n`, // Descriptive filename
          {
            inlineData: {
              mimeType: file.type,
              data: file.data
            }
          }
        ])
      ];

    } else {
      return ["No content to analyze"];
    }

    try {
      console.log("Sending request to Gemini API");
      const result = await model.generateContent({
        contents: parts,
      });

      console.log("Received response from Gemini API");
      const responseText = result.response.text();

      console.log("Raw response:", responseText);

      // Parse the numbered list response into an array of descriptions
      const descriptions = responseText
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim())) // Only include numbered lines
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbers and whitespace
        .filter(line => line.length > 0); // Filter out empty lines

      return descriptions;
    } catch (generationError) {
      console.error("Error generating content:", generationError);

      if (myConfig.debugMode) {
        console.warn("Falling back to simulated response due to API error");
        return simulateFallbackResponse(cardData);
      }

      throw generationError;
    }
  } catch (error) {
    console.error("Error processing with AI:", error);

    // Only use fallback in debug mode
    if (myConfig.debugMode) {
      console.warn("Using fallback AI response simulation in debug mode.");
      return simulateFallbackResponse(cardData);
    }

    return ["Error: Unable to process content with AI. Please check your API key and try again."];
  }
}

/**
 * Fallback function to simulate AI response when the real API is unavailable
 */
function simulateFallbackResponse(cardData: CardData): string[] {
  console.warn("Using fallback AI response simulation.  Please configure a valid API key for production.");

  if (cardData.type === 'text') {
    if (!cardData.data || !cardData.data.trim()) {
      return ["No text content to analyze"];
    }

    const text = cardData.data;
    const wordCount = text.split(/\s+/).length;

    const descriptions = [
      `This text contains approximately ${wordCount} words and appears to be about ${getTopicGuess(text)}.`,
      `The writing style seems ${getStyleAnalysis(text)}.`,
      `Key themes include: ${getThemeAnalysis(text)}.`
    ];

    return descriptions;
  } else if (cardData.type === 'file') {
    if (!cardData.files || cardData.files.length === 0) {
      return ["No files to analyze"];
    }

    // Generate descriptions for each file
    return cardData.files.map(file => {
      if (file.type.startsWith('image/')) {
        const imageFormat = file.type.split('/')[1];
        return `Image file "${file.name}": This appears to be a ${imageFormat} image that would likely contain visual elements that could be analyzed for content, colors, and composition.`;
      } else if (file.type.includes('text')) {
        const textPreview = file.data.substring(0, 100);
        return `Text file "${file.name}": Contains content that starts with "${textPreview}..." which appears to be about ${getTopicGuess(textPreview)}.`;
      } else if (file.type.includes('javascript') || file.type.includes('typescript') || file.type.includes('code')) {
        return `Code file "${file.name}": Contains what appears to be programming logic that would be analyzed for structure, patterns, and functionality.`;
      } else {
        return `File "${file.name}": A ${file.type} file that would be analyzed based on its contents and structure.`;
      }
    });
  }

  return ["Content analysis would be provided by AI"];
}


// Helper functions to simulate AI analysis

function getTopicGuess(text: string): string {
  const lowercaseText = text.toLowerCase();

  if (lowercaseText.includes('code') || lowercaseText.includes('function') || lowercaseText.includes('programming')) {
    return 'software development or programming';
  } else if (lowercaseText.includes('data') || lowercaseText.includes('analysis') || lowercaseText.includes('statistics')) {
    return 'data analysis or statistics';
  } else if (lowercaseText.includes('design') || lowercaseText.includes('user') || lowercaseText.includes('interface')) {
    return 'design or user experience';
  } else {
    const words = text.split(/\s+/).slice(0, 5);
    return `topics related to "${words.join(' ')}"`;
  }
}

function getStyleAnalysis(text: string): string {
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const wordCount = text.split(/\s+/).length;

  if (sentenceCount === 0) return 'undetermined';

  const avgWordsPerSentence = wordCount / sentenceCount;

  if (avgWordsPerSentence > 20) {
    return 'formal and academic with long sentences';
  } else if (avgWordsPerSentence > 12) {
    return 'balanced and professional';
  } else {
    return 'concise and straightforward';
  }
}

function getThemeAnalysis(text: string): string {
  const lowercaseText = text.toLowerCase();
  const themesFound = [];

  if (lowercaseText.includes('technology') || lowercaseText.includes('digital') || lowercaseText.includes('computer')) {
    themesFound.push('technology');
  }

  if (lowercaseText.includes('business') || lowercaseText.includes('market') || lowercaseText.includes('company')) {
    themesFound.push('business');
  }

  if (lowercaseText.includes('learn') || lowercaseText.includes('education') || lowercaseText.includes('knowledge')) {
    themesFound.push('education');
  }

  if (lowercaseText.includes('health') || lowercaseText.includes('medical') || lowercaseText.includes('wellness')) {
    themesFound.push('health');
  }

  if (themesFound.length === 0) {
    const words = lowercaseText.split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['about', 'these', 'their', 'there', 'which', 'would'].includes(word))
      .slice(0, 3);

    return words.length > 0 ? words.join(', ') : 'general information';
  }

  return themesFound.join(', ');
}
type CardData = {
  type: 'text' | 'file';
  content: string;
  data?: string; // For text cards
  files?: FileData[]; // For file cards
};

interface FileData {
  name: string;
  type: string;
  data: string; // This should be an ArrayBuffer as string, not a data URL
  id: string;
}

/**
 * Process a card using Google's Gemini model
 * @param cardData - The card data to analyze
 * @returns A promise that resolves to an array of descriptions
 */
export async function processCardWithAI(cardData: CardData): Promise<string[]> {
  try {
    // Get API key directly from localStorage
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

    // Check if API key is available
    if (!apiKey) {
      throw new Error("Google API key is not configured");
    }

    // Log API usage
    console.log(`Using API key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log(`Using model: ${config.modelName}`);

    // Initialize the Google Generative AI API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: config.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    let messages = [];

    if (cardData.type === 'text') {
      messages = [{
        role: 'user',
        parts: [`Analyze the following text and provide 3 insightful descriptions about it.  Format your response as a numbered list with only the descriptions, without any introduction or conclusion.\n\nType: ${cardData.content || 'No type specified'}\nContent: ${cardData.data || '(No content provided)'}`]
      }];
    } else if (cardData.type === 'file' && cardData.files && cardData.files.length > 0) {
      messages = [{
        role: 'user',
        parts: [
          `Analyze the following files and provide a description for each. Format your response as a numbered list with only the descriptions, without any introduction or conclusion.\n`, // Base text part
          ...cardData.files.map(file => ({
            text: `${file.name} (${file.type})` // Descriptive filename
          })),
          ...cardData.files.map(file => ({
            inlineData: {data: file.data, mimeType: file.type} // Inline data parts
          }))
        ]
      }];

    } else {
      return ["No content to analyze"];
    }

    try {
      console.log("Sending request to Gemini API");
      const result = await model.generateContent({
        contents: messages,
      });

      console.log("Received response from Gemini API");
      const responseText = result.response.text();

      console.log("Raw response:", responseText);

      // Parse the numbered list response into an array of descriptions
      const descriptions = responseText
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim())) // Only include numbered lines
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbers and whitespace
        .filter(line => line.length > 0); // Filter out empty lines

      return descriptions;
    } catch (generationError) {
      console.error("Error generating content:", generationError);

      if (config.debugMode) {
        console.warn("Falling back to simulated response due to API error");
        return simulateFallbackResponse(cardData);
      }

      throw generationError;
    }
  } catch (error) {
    console.error("Error processing with AI:", error);

    // Only use fallback in debug mode
    if (config.debugMode) {
      console.warn("Using fallback AI response simulation in debug mode.");
      return simulateFallbackResponse(cardData);
    }

    return ["Error: Unable to process content with AI. Please check your API key and try again."];
  }
}

/**
 * Fallback function to simulate AI response when the real API is unavailable
 */
function simulateFallbackResponse(cardData: CardData): string[] {
  console.warn("Using fallback AI response simulation.  Please configure a valid API key for production.");

  if (cardData.type === 'text') {
    if (!cardData.data || !cardData.data.trim()) {
      return ["No text content to analyze"];
    }

    const text = cardData.data;
    const wordCount = text.split(/\s+/).length;

    const descriptions = [
      `This text contains approximately ${wordCount} words and appears to be about ${getTopicGuess(text)}.`,
      `The writing style seems ${getStyleAnalysis(text)}.`,
      `Key themes include: ${getThemeAnalysis(text)}.`
    ];

    return descriptions;
  } else if (cardData.type === 'file') {
    if (!cardData.files || cardData.files.length === 0) {
      return ["No files to analyze"];
    }

    // Generate descriptions for each file
    return cardData.files.map(file => {
      if (file.type.startsWith('image/')) {
        const imageFormat = file.type.split('/')[1];
        return `Image file "${file.name}": This appears to be a ${imageFormat} image that would likely contain visual elements that could be analyzed for content, colors, and composition.`;
      } else if (file.type.includes('text')) {
        const textPreview = file.data.substring(0, 100);
        return `Text file "${file.name}": Contains content that starts with "${textPreview}..." which appears to be about ${getTopicGuess(textPreview)}.`;
      } else if (file.type.includes('javascript') || file.type.includes('typescript') || file.type.includes('code')) {
        return `Code file "${file.name}": Contains what appears to be programming logic that would be analyzed for structure, patterns, and functionality.`;
      } else {
        return `File "${file.name}": A ${file.type} file that would be analyzed based on its contents and structure.`;
      }
    });
  }

  return ["Content analysis would be provided by AI"];
}


// Helper functions to simulate AI analysis

function getTopicGuess(text: string): string {
  const lowercaseText = text.toLowerCase();

  if (lowercaseText.includes('code') || lowercaseText.includes('function') || lowercaseText.includes('programming')) {
    return 'software development or programming';
  } else if (lowercaseText.includes('data') || lowercaseText.includes('analysis') || lowercaseText.includes('statistics')) {
    return 'data analysis or statistics';
  } else if (lowercaseText.includes('design') || lowercaseText.includes('user') || lowercaseText.includes('interface')) {
    return 'design or user experience';
  } else if (lowercaseText.includes('learn') || lowercaseText.includes('education') || lowercaseText.includes('study')) {
    return 'education or learning';
  } else {
    const words = text.split(/\s+/).slice(0, 5);
    return `topics related to "${words.join(' ')}"`;
  }
}

function getStyleAnalysis(text: string): string {
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const wordCount = text.split(/\s+/).length;

  if (sentenceCount === 0) return 'undetermined';

  const avgWordsPerSentence = wordCount / sentenceCount;

  if (avgWordsPerSentence > 20) {
    return 'formal and academic with long sentences';
  } else if (avgWordsPerSentence > 12) {
    return 'balanced and professional';
  } else {
    return 'concise and straightforward';
  }
}

function getThemeAnalysis(text: string): string {
  const lowercaseText = text.toLowerCase();
  const themesFound = [];

  if (lowercaseText.includes('technology') || lowercaseText.includes('digital') || lowercaseText.includes('computer')) {
    themesFound.push('technology');
  }

  if (lowercaseText.includes('business') || lowercaseText.includes('market') || lowercaseText.includes('company')) {
    themesFound.push('business');
  }

  if (lowercaseText.includes('learn') || lowercaseText.includes('education') || lowercaseText.includes('knowledge')) {
    themesFound.push('education');
  }

  if (lowercaseText.includes('health') || lowercaseText.includes('medical') || lowercaseText.includes('wellness')) {
    themesFound.push('health');
  }

  if (themesFound.length === 0) {
    const words = lowercaseText.split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['about', 'these', 'their', 'there', 'which', 'would'].includes(word))
      .slice(0, 3);

    return words.length > 0 ? words.join(', ') : 'general information';
  }

  return themesFound.join(', ');
} } from '@google/generative-ai';
import config from './config';

// Type definitions
type CardData = {
  type: 'text' | 'file';
  content: string;
  data?: string;
  files?: Array<{
    name: string;
    type: string;
    data: string;
    id: string;
  }>;
};

/**
 * Process a card using Google's Gemini 2.5 Flash model
 * @param cardData - The card data to analyze
 * @returns A promise that resolves to an array of descriptions
 */
export async function processCardWithAI(cardData: CardData): Promise<string[]> {
  try {
    // Get API key directly from localStorage for most up-to-date value
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

    // Check if API key is available
    if (!apiKey) {
      throw new Error("Google API key is not configured");
    }

    // Create prompts based on the card type
    let prompt = '';
    let messages: any[] = [];
    let hasMultimodalContent = false;

    if (cardData.type === 'text') {
      prompt = `Analyze the following text and provide 3 insightful descriptions about it. Format your response as a numbered list with only the descriptions, without any introduction or conclusion.

Type: ${cardData.content || 'No type specified'}
Content: ${cardData.data || '(No content provided)'}

Example format:
1. First description about the content
2. Second description about the content
3. Third description about the content`;
    } else if (cardData.type === 'file' && cardData.files && cardData.files.length > 0) {
      // Check if there are any image files
      const hasImageFiles = cardData.files.some(file => file.type.startsWith('image/'));

      if (hasImageFiles) {
        // For image files, we'll use the multimodal capabilities
        hasMultimodalContent = true;

        // Prepare the multimodal content parts
        const parts = [];

        // Add text instruction
        parts.push({
          text: `Analyze the following ${cardData.files.length} file(s) and provide a specific description for each. Format your response as a numbered list with only the descriptions, without any introduction or conclusion.\nType: ${cardData.content || 'No type specified'}\n`
        });

        // Add each file
        cardData.files.forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            // For images, add as inline data
            // The data should already be a base64 string from readAsDataURL
            const base64Data = file.data.split(',')[1]; // Remove the data URL prefix
            parts.push({
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            });
            parts.push({ text: `\nFile ${index + 1}: ${file.name} (${file.type})\n` });
          } else if (file.type === 'application/pdf') {
            // For PDFs, we can't directly include them, so just mention them
            parts.push({
              text: `\nFile ${index + 1}: ${file.name} (${file.type}) [PDF file - unable to display content]\n`
            });
          } else {
            // For text files
            parts.push({
              text: `\nFile ${index + 1}: ${file.name} (${file.type})\nContent: ${file.data.substring(0, 1000)}${file.data.length > 1000 ? '...' : ''}\n`
            });
          }
        });

        // Add instruction for the format
        parts.push({
          text: '\nExample format:\n1. Description for file 1\n2. Description for file 2\n...'
        });

        messages = [{
          role: 'user',
          parts: parts
        }];
      } else {
        // For non-image files, use the text-only approach
        prompt = `Analyze the following files and provide a description for each. Format your response as a numbered list with only the descriptions, without any introduction or conclusion.

Type: ${cardData.content || 'No type specified'}
Files:
${cardData.files.map((file, index) => {
          // Handle different file types appropriately
          if (file.type === 'application/pdf') {
            return `${index + 1}. ${file.name} (${file.type}) [PDF file]`;
          } else {
            // For text files, include a preview of the content
            const preview = file.data.length > 100 ? `${file.data.substring(0, 100)}...` : file.data;
            return `${index + 1}. ${file.name} (${file.type}): ${preview}`;
          }
        }).join('\n')}

Example format:
1. Description for file 1
2. Description for file 2
...`;
      }
    } else {
      return ["No content to analyze"];
    }

    console.log(`Using API key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
    console.log(`Using model: ${config.modelName}`);

    // Initialize the Google Generative AI API
    const genAI = new GoogleGenerativeAI(apiKey);

    // For text generation capabilities
    const model = genAI.getGenerativeModel({
      model: config.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    try {
      console.log("Sending request to Gemini API");
      let response;

      if (hasMultimodalContent && messages.length > 0) {
        // Use the generative model's chatInterface for multimodal content
        const chat = model.startChat({
          history: [],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        });

        console.log("Sending multimodal chat request");
        // Generate content using the message format
        const result = await chat.sendMessage(messages[0].parts);
        response = result.response;
      } else {
        // Generate content using the text prompt
        console.log("Sending text prompt request");
        const result = await model.generateContent(prompt);
        response = result.response;
      }

      console.log("Received response from Gemini API");
      const text = response.text();

      console.log("Raw response:", text);

      // Parse the numbered list response into an array of descriptions
      const descriptions = text
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim())) // Only include numbered lines
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbers and whitespace
        .filter(line => line.length > 0); // Filter out empty lines

      if (descriptions.length === 0) {
        // If parsing fails, just return the entire text split by lines
        return text.split('\n').filter(line => line.trim().length > 0);
      }

      return descriptions;
    } catch (generationError) {
      console.error("Error generating content:", generationError);

      if (config.debugMode) {
        console.warn("Falling back to simulated response due to API error");
        return simulateFallbackResponse(cardData);
      }

      throw generationError;
    }
  } catch (error) {
    console.error("Error processing with AI:", error);

    // Only use fallback in debug mode
    if (config.debugMode) {
      console.warn("Using fallback AI response simulation in debug mode.");
      return simulateFallbackResponse(cardData);
    }

    return ["Error: Unable to process content with AI. Please check your API key and try again."];
  }
}

/**
 * Fallback function to simulate AI response when the real API is unavailable
 * For development/testing purposes only
 */
function simulateFallbackResponse(cardData: CardData): string[] {
  // Add a slight delay to simulate network request
  console.warn("Using fallback AI response simulation. Please configure a valid API key for production.");

  // For text cards
  if (cardData.type === 'text') {
    if (!cardData.data || !cardData.data.trim()) {
      return ["No text content to analyze"];
    }

    const text = cardData.data;
    const wordCount = text.split(/\s+/).length;

    // Generate some "smart" analysis of the text
    const descriptions = [
      `This text contains approximately ${wordCount} words and appears to be about ${getTopicGuess(text)}.`,
      `The writing style seems ${getStyleAnalysis(text)}.`,
      `Key themes include: ${getThemeAnalysis(text)}.`
    ];

    return descriptions;
  }

  // For file cards
  else if (cardData.type === 'file') {
    if (!cardData.files || cardData.files.length === 0) {
      return ["No files to analyze"];
    }

    // Generate descriptions for each file
    return cardData.files.map(file => {
      if (file.type.startsWith('image/')) {
        const imageFormat = file.type.split('/')[1];
        return `Image file "${file.name}": This appears to be a ${imageFormat} image that would likely contain visual elements that could be analyzed for content, colors, and composition.`;
      } else if (file.type.includes('text')) {
        const textPreview = file.data.substring(0, 100);
        return `Text file "${file.name}": Contains content that starts with "${textPreview}..." which appears to be about ${getTopicGuess(textPreview)}.`;
      } else if (file.type.includes('javascript') || file.type.includes('typescript') || file.type.includes('code')) {
        return `Code file "${file.name}": Contains what appears to be programming logic that would be analyzed for structure, patterns, and functionality.`;
      } else {
        return `File "${file.name}": A ${file.type} file that would be analyzed based on its contents and structure.`;
      }
    });
  }

  return ["Content analysis would be provided by AI"];
}

// Helper functions to simulate AI analysis

function getTopicGuess(text: string): string {
  const lowercaseText = text.toLowerCase();

  if (lowercaseText.includes('code') || lowercaseText.includes('function') || lowercaseText.includes('programming')) {
    return 'software development or programming';
  } else if (lowercaseText.includes('data') || lowercaseText.includes('analysis') || lowercaseText.includes('statistics')) {
    return 'data analysis or statistics';
  } else if (lowercaseText.includes('design') || lowercaseText.includes('user') || lowercaseText.includes('interface')) {
    return 'design or user experience';
  } else if (lowercaseText.includes('learn') || lowercaseText.includes('education') || lowercaseText.includes('study')) {
    return 'education or learning';
  } else {
    const words = text.split(/\s+/).slice(0, 5);
    return `topics related to "${words.join(' ')}"`;
  }
}

function getStyleAnalysis(text: string): string {
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const wordCount = text.split(/\s+/).length;

  if (sentenceCount === 0) return 'undetermined';

  const avgWordsPerSentence = wordCount / sentenceCount;

  if (avgWordsPerSentence > 20) {
    return 'formal and academic with long sentences';
  } else if (avgWordsPerSentence > 12) {
    return 'balanced and professional';
  } else {
    return 'concise and straightforward';
  }
}

function getThemeAnalysis(text: string): string {
  const lowercaseText = text.toLowerCase();
  const themesFound = [];

  if (lowercaseText.includes('technology') || lowercaseText.includes('digital') || lowercaseText.includes('computer')) {
    themesFound.push('technology');
  }

  if (lowercaseText.includes('business') || lowercaseText.includes('market') || lowercaseText.includes('company')) {
    themesFound.push('business');
  }

  if (lowercaseText.includes('learn') || lowercaseText.includes('education') || lowercaseText.includes('knowledge')) {
    themesFound.push('education');
  }

  if (lowercaseText.includes('health') || lowercaseText.includes('medical') || lowercaseText.includes('wellness')) {
    themesFound.push('health');
  }

  if (themesFound.length === 0) {
    // Extract some potential themes from common words
    const words = lowercaseText.split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['about', 'these', 'their', 'there', 'which', 'would'].includes(word))
      .slice(0, 3);

    return words.length > 0 ? words.join(', ') : 'general information';
  }

  return themesFound.join(', ');
}
