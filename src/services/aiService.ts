
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export const supportedAIModels: AIModel[] = [
  {
    id: "gemini",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "Fast and efficient code generation with Google's Gemini model"
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Advanced code generation with OpenAI's GPT-4 model"
  },
  {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    description: "Comprehensive code generation with Anthropic's Claude model"
  },
  {
    id: "codex",
    name: "Codex",
    provider: "OpenAI",
    description: "Specialized for code with OpenAI's Codex model"
  }
];

export interface CodeGenerationRequest {
  language: string;
  prompt: string;
  context?: string;
  model: string;
  temperature?: number;
  maxLength?: number;
}

export interface CodeGenerationResponse {
  code: string;
  explanation?: string;
  error?: string;
}

// Google Gemini API
const GEMINI_API_KEY = "AIzaSyBnRijcOQvHWx9fdhpd8G0fgvwK_-Ei4kc";

// Note: For other APIs, you would need to add your API keys
// These would ideally be stored securely (not in client-side code)
const OPENAI_API_KEY = ""; // This should be handled securely

const generateWithGemini = async (request: CodeGenerationRequest): Promise<CodeGenerationResponse> => {
  try {
    // Construct a prompt that instructs the model to generate code with detailed comments
    const systemPrompt = `You are an expert code generation assistant. Generate detailed, well-commented code for the following request. The code should be in ${request.language}. Don't skimp on implementation details - provide the most complete implementation possible.`;
    
    const userPrompt = `${request.prompt}${request.context ? "\n\nContext: " + request.context : ""}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt }
            ],
            role: "user"
          },
          {
            parts: [
              { text: userPrompt }
            ],
            role: "user"
          }
        ],
        generationConfig: {
          temperature: request.temperature || 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: request.maxLength || 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated");
    }

    // Extract the code from the response
    const content = data.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      throw new Error("Invalid response format");
    }

    // The response may contain markdown code blocks, so we need to extract the code
    const text = content.parts[0].text;
    
    // Extract code from markdown code blocks if present
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    
    const code = match ? match[1].trim() : text.trim();
    
    return { code };
  } catch (error) {
    console.error("Error generating code with Gemini:", error);
    return { 
      code: "",
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Mock implementation for other AI providers - would be replaced with actual API calls
const generateWithOpenAI = async (request: CodeGenerationRequest): Promise<CodeGenerationResponse> => {
  try {
    // This is a placeholder for the actual OpenAI API implementation
    // In a real implementation, you would use the OpenAI API client
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      code: `// Generated with ${request.model} (OpenAI)\n// Language: ${request.language}\n\n/* This is a placeholder for actual OpenAI-generated code. To use the real OpenAI API, you would need to add your API key and implement the correct API calls. */\n\n// Example ${request.language} code for: ${request.prompt}\n\n// Placeholder code...\n`,
    };
  } catch (error) {
    console.error("Error generating code with OpenAI:", error);
    return { 
      code: "",
      error: error instanceof Error ? error.message : "Unknown error occurred with OpenAI API" 
    };
  }
};

const generateWithClaude = async (request: CodeGenerationRequest): Promise<CodeGenerationResponse> => {
  // Placeholder for Claude API implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    code: `// Generated with Claude (Anthropic)\n// Language: ${request.language}\n\n/* This is a placeholder for actual Claude-generated code. */\n\n// Example ${request.language} code for: ${request.prompt}\n\n// Placeholder code...\n`,
  };
};

export const generateCode = async (request: CodeGenerationRequest): Promise<CodeGenerationResponse> => {
  switch (request.model) {
    case 'gemini':
      return generateWithGemini(request);
    case 'gpt-4':
    case 'codex':
      return generateWithOpenAI(request);
    case 'claude':
      return generateWithClaude(request);
    default:
      return generateWithGemini(request); // Default to Gemini
  }
};
