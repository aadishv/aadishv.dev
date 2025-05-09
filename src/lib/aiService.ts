// AI Service for interacting with the OpenAI API
import OpenAI from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import config from './config';

// Import specific OpenAI types directly with correct import syntax
import type { 
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam
} from 'openai/resources/chat/completions';
import type {
  ChatCompletionContentPartText, 
  ChatCompletionContentPartImage
} from 'openai/resources';

// Type definitions
type CardData = {
  type: 'text' | 'file';
  content: string;
  data?: string; // For text cards
  files?: FileData[]; // For file cards
  extraInstructions?: string;
  numQuestions?: number;
  selectedModel?: string;
};

interface FileData {
  name: string;
  type: string;
  data: string; // Base64 for images and PDFs, raw text for other files
  id: string;
}

// Define the function schema for structured output
const tools = [
  {
    type: "function" as const,
    function: {
      name: "return_questions",
      description: "Return a list of practice questions for study, each as a Markdown/LaTeX/SVG string.",
      parameters: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: { type: "string" },
            description: "A list of practice questions, each as a Markdown/LaTeX/SVG string."
          }
        },
        required: ["questions"]
      }
    }
  }
];

// Utility to extract JSON from Markdown code block or anywhere in the text
function extractJsonFromCodeBlock(text: string): string {
  // Try to extract the first ```json ... ``` or ``` ... ``` code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    // Try to find the first { ... } inside the code block
    const braceMatch = codeBlockMatch[1].match(/{[\s\S]*}/);
    if (braceMatch) return braceMatch[0];
    return codeBlockMatch[1].trim();
  }
  // Fallback: try to find the first { ... } block anywhere in the text
  const braceMatch = text.match(/{[\s\S]*}/);
  if (braceMatch) return braceMatch[0];
  return text.trim();
}

/**
 * Process a card using the selected AI model
 * @param cardData - The card data to analyze
 * @returns A promise that resolves to an array of descriptions
 */
export async function processCardWithAI(cardData: CardData): Promise<string[]> {
  try {
    // Determine which API to use based on localStorage and selectedModel
    const selectedProvider = localStorage.getItem('selected_ai_provider') || 'openai';
    const selectedModel = cardData.selectedModel || (selectedProvider === 'openai' ? config.openaiModelName : config.modelName);
    if (selectedProvider === 'openai' || selectedModel.startsWith('gpt')) {
      return processWithOpenAI(cardData, selectedModel);
    } else {
      return processWithGemini(cardData, selectedModel);
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
 * Process a card using OpenAI's model
 */
async function processWithOpenAI(cardData: CardData, selectedModel: string): Promise<string[]> {
  // Get API key directly from localStorage
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || '' : '';

  // Check if API key is available
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  // Initialize the OpenAI client
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });

  const numQuestions = cardData.numQuestions || 3;
  const extraInstructions = cardData.extraInstructions ? ` ${cardData.extraInstructions.trim()}` : '';
  const noCodeBlock = ' DO NOT INCLUDE ANY MARKDOWN CODE BLOCK OR JSON CODE BLOCK TAGS IN YOUR RESPONSE.';

  // Prepare the messages based on card type
  if (cardData.type === 'text') {
    const systemMessage: ChatCompletionSystemMessageParam = {
      role: "system",
      content: `You are an expert educational AI assistant. Given the following study material, generate ${numQuestions} high-quality practice questions that help a student learn and test their understanding. Some of the questions should be multi-part problems, with each part clearly labeled (e.g., (a), (b), (c)). You may include SVG diagrams in your questions by embedding <svg>...</svg> code blocks. Use Markdown formatting for structure, and LaTeX for any math or scientific notation (enclose LaTeX in $$ for block or $ for inline). Do not reference any card numbers, IDs, or metadata. Focus on clarity, educational value, and variety. Only output the questions, not answers. Render Markdown, LaTeX, and SVG properly. Return your response as a JSON object: {"questions": [ ... ] } where each array element is a question (which may include Markdown, LaTeX, or SVG).${extraInstructions} ${noCodeBlock}`
    };
    
    const userMessage: ChatCompletionUserMessageParam = {
      role: "user",
      content: `Study Material:\n${cardData.content ? cardData.content + '\n' : ''}${cardData.data || '(No content provided)'}`
    };

    // Make the API call for text content
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      tools,
      tool_choice: { type: 'function', function: { name: 'return_questions' } },
    });

    // Parse function call result if present
    let descriptions: string[] = [];
    const choice = completion.choices[0];
    if (choice && choice.message && choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function && toolCall.function.arguments) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          if (args && Array.isArray(args.questions)) {
            descriptions = args.questions;
          }
        } catch {}
      }
    }
    // Fallback to previous parsing if not present
    if (descriptions.length === 0) {
      const responseText = choice.message.content || '';
      console.log('AI raw output (OpenAI):', responseText);
      try {
        const cleaned = extractJsonFromCodeBlock(responseText);
        const json = JSON.parse(cleaned);
        if (json && Array.isArray(json.questions)) {
          descriptions = json.questions;
        } else {
          throw new Error('Invalid questions array');
        }
      } catch {
        // fallback to old parsing
        descriptions = responseText
          .split(/\n(?=\d+\.\s)/)
          .map(q => q.replace(/^\d+\.\s*/, '').trim())
          .filter(q => q.length > 0);
      }
    }
    // Convert all \n or \n to real newlines and normalize objects with a 'question' key
    descriptions = descriptions.map(q =>
      typeof q === 'string'
        ? q.replace(/\\n|\n/g, '\n')
        : (q && typeof q === 'object' && typeof (q as any).question === 'string')
          ? (q as any).question.replace(/\\n|\n/g, '\n')
          : JSON.stringify(q)
    );
    return descriptions.length > 0 ? descriptions : [choice.message.content || ''];
    
  } else if (cardData.type === 'file' && cardData.files && cardData.files.length > 0) {
    // For file cards with documents and images, use the vision API for images and embeddings for text
    const systemMessage: ChatCompletionSystemMessageParam = {
      role: "system",
      content: `You are an expert educational AI assistant. Given the following files, generate ${numQuestions} high-quality practice questions that help a student learn and test their understanding. Some of the questions should be multi-part problems, with each part clearly labeled (e.g., (a), (b), (c)). You may include SVG diagrams in your questions by embedding <svg>...</svg> code blocks. Use Markdown formatting for structure, and LaTeX for any math or scientific notation (enclose LaTeX in $$ for block or $ for inline). Do not reference any card numbers, IDs, or metadata. Focus on clarity, educational value, and variety. Only output the questions, not answers. Render Markdown, LaTeX, and SVG properly. Return your response as a JSON object: {"questions": [ ... ] } where each array element is a question (which may include Markdown, LaTeX, or SVG).${extraInstructions}${noCodeBlock}`
    };
    
    // Create content objects for user message
    const contentItems: (ChatCompletionContentPartText | ChatCompletionContentPartImage)[] = [];
    
    // Add basic message
    contentItems.push({
      type: "text",
      text: `Analyze the following ${cardData.files.length} file(s) and provide insights.`
    });
    
    // Process each file
    for (const file of cardData.files) {
      if (file.type.startsWith('image/')) {
        // For images, create an image content object
        contentItems.push({
          type: "image_url",
          image_url: {
            url: file.data,
            detail: "high"
          }
        });
        
        // Add context about the image
        contentItems.push({
          type: "text",
          text: `Image: ${file.name}`
        });
        
      } else if (file.type === 'application/pdf') {
        // For PDFs, need to send as file upload
        // Convert base64 to binary for file upload
        const base64Data = file.data.split(',')[1]; // Remove data URL prefix
        const binaryData = atob(base64Data);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }
        
        // Create a file object
        const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
        const fileObj = new File([fileBlob], file.name, { type: 'application/pdf' });
        
        // Upload the file
        const uploadedFile = await openai.files.create({
          file: fileObj,
          purpose: 'assistants',
        });
        
        // Create a file annotation
        contentItems.push({
          type: "text",
          text: `PDF Document: ${file.name} (See the uploaded file ID: ${uploadedFile.id} for content)`
        });
        
      } else {
        // For text files, just include the text content
        contentItems.push({
          type: "text",
          text: `File: ${file.name} (${file.type})\n\nContent:\n${file.data}`
        });
      }
    }
    
    const userMessage: ChatCompletionUserMessageParam = {
      role: "user",
      content: contentItems
    };
    
    // Make the API call with the vision model for mixed content
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 1000,
      tools,
      tool_choice: { type: 'function', function: { name: 'return_questions' } },
    });
    
    // Parse function call result if present
    let descriptions: string[] = [];
    const choice = completion.choices[0];
    if (choice && choice.message && choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function && toolCall.function.arguments) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          if (args && Array.isArray(args.questions)) {
            descriptions = args.questions;
          }
        } catch {}
      }
    }
    // Fallback to previous parsing if not present
    if (descriptions.length === 0) {
      const responseText = choice.message.content || '';
      console.log('AI raw output (OpenAI):', responseText);
      try {
        const cleaned = extractJsonFromCodeBlock(responseText);
        const json = JSON.parse(cleaned);
        if (json && Array.isArray(json.questions)) {
          descriptions = json.questions;
        } else {
          throw new Error('Invalid questions array');
        }
      } catch {
        // fallback to old parsing
        descriptions = responseText
          .split(/\n(?=\d+\.\s)/)
          .map(q => q.replace(/^\d+\.\s*/, '').trim())
          .filter(q => q.length > 0);
      }
    }
    // Convert all \n or \n to real newlines and normalize objects with a 'question' key
    descriptions = descriptions.map(q =>
      typeof q === 'string'
        ? q.replace(/\\n|\n/g, '\n')
        : (q && typeof q === 'object' && typeof (q as any).question === 'string')
          ? (q as any).question.replace(/\\n|\n/g, '\n')
          : JSON.stringify(q)
    );
    return descriptions.length > 0 ? descriptions : [choice.message.content || ''];
  } else {
    return ["No content to analyze"];
  }
}

/**
 * Process a card using Google's Gemini model
 */
async function processWithGemini(cardData: CardData, selectedModel: string): Promise<string[]> {
  // Get API key directly from localStorage
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

  // Check if API key is available
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  // Initialize the Google Generative AI API
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: selectedModel,
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

  const numQuestions = cardData.numQuestions || 3;
  const extraInstructions = cardData.extraInstructions ? ` ${cardData.extraInstructions.trim()}` : '';
  const noCodeBlock = ' Do not include any Markdown code block or JSON code block tags in your response.';

  if (cardData.type === 'text') {
    parts = [{
      text: `YOU ARE AN EXPERT EDUCATIONAL AI ASSISTANT. GIVEN THE FOLLOWING STUDY MATERIAL, YOUR TASK IS TO GENERATE ${numQuestions} HIGH-QUALITY PRACTICE QUESTIONS THAT HELP A STUDENT LEARN AND TEST THEIR UNDERSTANDING. SOME OF THE QUESTIONS SHOULD BE MULTI-PART PROBLEMS, WITH EACH PART CLEARLY LABELED (E.G., (A), (B), (C)). YOU MAY INCLUDE SVG DIAGRAMS IN YOUR QUESTIONS BY EMBEDDING <SVG>...</SVG> CODE BLOCKS. USE MARKDOWN FORMATTING FOR STRUCTURE, AND LATEX FOR ANY MATH OR SCIENTIFIC NOTATION (ENCLOSE LATEX IN $$ FOR BLOCK OR $ FOR INLINE). DO NOT REFERENCE ANY CARD NUMBERS, IDS, OR METADATA. FOCUS ON CLARITY, EDUCATIONAL VALUE, AND VARIETY. ONLY OUTPUT THE QUESTIONS, NOT ANSWERS. RENDER MARKDOWN, LATEX, AND SVG PROPERLY.\n\nYOUR RESPONSE MUST BE A SINGLE VALID JSON OBJECT WITH THE FOLLOWING FORMAT, AND NOTHING ELSE:\n\n{"questions": ["QUESTION 1 TEXT (CAN INCLUDE MARKDOWN, LATEX, SVG)", "QUESTION 2 TEXT", ...]}\n\nDO NOT INCLUDE ANY MARKDOWN CODE BLOCK TAGS, JSON CODE BLOCK TAGS, OR ANY TEXT OUTSIDE THE JSON OBJECT. DO NOT ADD EXPLANATIONS, HEADERS, OR ANY OTHER CONTENT. STRICTLY RETURN ONLY THE JSON OBJECT AS SPECIFIED.\n\nSTUDY MATERIAL:\n${cardData.content ? cardData.content + '\n' : ''}${cardData.data || '(NO CONTENT PROVIDED)'}${extraInstructions}${noCodeBlock}`
    }];
  } else if (cardData.type === 'file' && cardData.files && cardData.files.length > 0) {
    parts = [
      {
        text: `YOU ARE AN EXPERT EDUCATIONAL AI ASSISTANT. GIVEN THE FOLLOWING FILES, YOUR TASK IS TO GENERATE ${numQuestions} HIGH-QUALITY PRACTICE QUESTIONS THAT HELP A STUDENT LEARN AND TEST THEIR UNDERSTANDING. SOME OF THE QUESTIONS SHOULD BE MULTI-PART PROBLEMS, WITH EACH PART CLEARLY LABELED (E.G., (A), (B), (C)). YOU MAY INCLUDE SVG DIAGRAMS IN YOUR QUESTIONS BY EMBEDDING <SVG>...</SVG> CODE BLOCKS. USE MARKDOWN FORMATTING FOR STRUCTURE, AND LATEX FOR ANY MATH OR SCIENTIFIC NOTATION (ENCLOSE LATEX IN $$ FOR BLOCK OR $ FOR INLINE). DO NOT REFERENCE ANY CARD NUMBERS, IDS, OR METADATA. FOCUS ON CLARITY, EDUCATIONAL VALUE, AND VARIETY. ONLY OUTPUT THE QUESTIONS, NOT ANSWERS. RENDER MARKDOWN, LATEX, AND SVG PROPERLY.\n\nYOUR RESPONSE MUST BE A SINGLE VALID JSON OBJECT WITH THE FOLLOWING FORMAT, AND NOTHING ELSE:\n\n{"questions": ["QUESTION 1 TEXT (CAN INCLUDE MARKDOWN, LATEX, SVG)", "QUESTION 2 TEXT", ...]}\n\nDO NOT INCLUDE ANY MARKDOWN CODE BLOCK TAGS, JSON CODE BLOCK TAGS, OR ANY TEXT OUTSIDE THE JSON OBJECT. DO NOT ADD EXPLANATIONS, HEADERS, OR ANY OTHER CONTENT. STRICTLY RETURN ONLY THE JSON OBJECT AS SPECIFIED.\n\nFILES PROVIDED:${extraInstructions}${noCodeBlock}`
      },
      ...cardData.files.flatMap(file => {
        const fileParts = [];
        fileParts.push({
          text: `${file.name} (${file.type})\n`
        });
        if (file.type.startsWith('image/')) {
          try {
            const base64Data = file.data.split(',')[1];
            fileParts.push({
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            });
          } catch (error) {
            console.error("Error extracting image data:", error);
          }
        } else if (file.type === 'application/pdf') {
          fileParts.push({
            text: `(PDF file - content not directly accessible)`
          });
        } else {
          fileParts.push({
            text: `CONTENT: ${file.data.substring(0, 1000)}${file.data.length > 1000 ? '...' : ''}`
          });
        }
        return fileParts;
      })
    ];
  } else {
    return ["No content to analyze"];
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }]
    });
    const responseText = result.response.text();
    console.log('AI raw output (Gemini):', responseText);
    let descriptions: string[] = [];
    try {
      const cleaned = extractJsonFromCodeBlock(responseText);
      const json = JSON.parse(cleaned);
      if (json && Array.isArray(json.questions)) {
        descriptions = json.questions;
      } else {
        throw new Error('Invalid questions array');
      }
    } catch {
      // fallback to old parsing
      descriptions = responseText
        .split(/\n(?=\d+\.\s)/)
        .map(q => q.replace(/^\d+\.\s*/, '').trim())
        .filter(q => q.length > 0);
    }
    // Convert all \n or \n to real newlines and normalize objects with a 'question' key
    descriptions = descriptions.map(q =>
      typeof q === 'string'
        ? q.replace(/\\n|\n/g, '\n')
        : (q && typeof q === 'object' && typeof (q as any).question === 'string')
          ? (q as any).question.replace(/\\n|\n/g, '\n')
          : JSON.stringify(q)
    );
    return descriptions.length > 0 ? descriptions : [responseText];
  } catch (generationError) {
    console.error("Error generating content with Gemini:", generationError);
    throw generationError;
  }
}

/**
 * Fallback function to simulate AI response when the real API is unavailable
 */
function simulateFallbackResponse(cardData: CardData): string[] {
  console.warn("Using fallback AI response simulation. Please configure a valid API key for production.");

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
      } else if (file.type === 'application/pdf') {
        return `PDF file "${file.name}": This document likely contains text, possibly with formatting, images, and structure that would be analyzed for its content and organization.`;
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
